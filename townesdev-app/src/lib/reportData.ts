/**
 * Monthly Report Data Collection
 * Gathers all data needed for PDF report generation
 */

import { runQuery } from './client';
import { 
  qClientById, 
  qMonthlyRhythmForClientMonth, 
  qIncidentsByClient, 
  qInvoicesByClient 
} from '../sanity/lib/queries';

export interface MonthlyReportData {
  client: ClientData;
  month: string;
  monthlyRhythm?: MonthlyRhythmData;
  incidents: IncidentData[];
  invoices: InvoiceData[];
  summary: ReportSummary;
  generatedAt: string;
}

export interface ClientData {
  _id: string;
  name: string;
  email: string;
  status: string;
  selectedPlan?: {
    name: string;
    price: number;
  };
  startDate?: string;
  maintenanceWindow?: string;
}

export interface MonthlyRhythmData {
  _id: string;
  month: string;
  hoursUsed?: number;
  hoursIncluded?: number;
  week1Patch?: string;
  week2Observability?: string;
  week3Hardening?: string;
  week4Report?: string;
}

export interface IncidentData {
  _id: string;
  title: string;
  severity: string;
  description: string;
  reportedAt: string;
  resolvedAt?: string;
  status: string;
  hoursUsed?: number;
  outOfScope?: boolean;
}

export interface InvoiceData {
  _id: string;
  invoiceNumber: string;
  totalAmount: number;
  currency: string;
  status: string;
  issueDate: string;
  dueDate: string;
  previewUrl?: string;
}

export interface ReportSummary {
  totalIncidents: number;
  resolvedIncidents: number;
  openIncidents: number;
  criticalIncidents: number;
  totalHoursUsed: number;
  incidentHours: number;
  rhythmHours: number;
  totalInvoiceAmount: number;
  paidInvoices: number;
  pendingInvoices: number;
}

/**
 * Collect all data needed for a monthly report
 */
export async function collectMonthlyReportData(
  clientId: string,
  month: string
): Promise<MonthlyReportData> {
  console.log(`[Report Data] Collecting data for client ${clientId}, month ${month}`);

  // Parse month to get date range for filtering
  const { startDate, endDate } = getMonthDateRange(month);
  
  // Collect data in parallel
  const [client, monthlyRhythm, allIncidents, allInvoices] = await Promise.all([
    runQuery(qClientById, { id: clientId }),
    runQuery(qMonthlyRhythmForClientMonth, { clientId, month }),
    runQuery(qIncidentsByClient, { clientId }),
    runQuery(qInvoicesByClient, { clientId })
  ]);

  if (!client) {
    throw new Error(`Client not found: ${clientId}`);
  }

  // Filter incidents to the specific month
  const incidents = allIncidents.filter((incident: IncidentData) => {
    const reportedDate = new Date(incident.reportedAt);
    return reportedDate >= startDate && reportedDate <= endDate;
  });

  // Filter invoices to the specific month
  const invoices = allInvoices.filter((invoice: InvoiceData) => {
    const issueDate = new Date(invoice.issueDate);
    return issueDate >= startDate && issueDate <= endDate;
  });

  // Generate summary statistics
  const summary = generateReportSummary(incidents, invoices, monthlyRhythm);

  console.log(`[Report Data] Collected: ${incidents.length} incidents, ${invoices.length} invoices`);

  return {
    client,
    month,
    monthlyRhythm,
    incidents,
    invoices,
    summary,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Parse month string to get date range
 * Expects format like "January 2024"
 */
function getMonthDateRange(month: string): { startDate: Date; endDate: Date } {
  // Parse "January 2024" format
  const [monthName, yearStr] = month.split(' ');
  const year = parseInt(yearStr, 10);
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const monthIndex = monthNames.indexOf(monthName);
  
  if (monthIndex === -1) {
    throw new Error(`Invalid month format: ${month}. Expected format: "January 2024"`);
  }

  const startDate = new Date(year, monthIndex, 1);
  const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999); // Last day of month

  return { startDate, endDate };
}

/**
 * Generate summary statistics for the report
 */
function generateReportSummary(
  incidents: IncidentData[],
  invoices: InvoiceData[],
  monthlyRhythm?: MonthlyRhythmData
): ReportSummary {
  const totalIncidents = incidents.length;
  const resolvedIncidents = incidents.filter(inc => inc.status === 'resolved').length;
  const openIncidents = incidents.filter(inc => inc.status === 'open').length;
  const criticalIncidents = incidents.filter(inc => 
    inc.severity === 'urgent' || inc.severity === 'critical'
  ).length;
  
  const incidentHours = incidents.reduce((sum, inc) => sum + (inc.hoursUsed || 0), 0);
  const rhythmHours = monthlyRhythm?.hoursUsed || 0;
  const totalHoursUsed = incidentHours + rhythmHours;
  
  const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;

  return {
    totalIncidents,
    resolvedIncidents,
    openIncidents,
    criticalIncidents,
    totalHoursUsed,
    incidentHours,
    rhythmHours,
    totalInvoiceAmount,
    paidInvoices,
    pendingInvoices
  };
}

/**
 * Generate a formatted month string for the current month
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
}

/**
 * Generate a formatted month string for the previous month
 */
export function getPreviousMonth(): string {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
}