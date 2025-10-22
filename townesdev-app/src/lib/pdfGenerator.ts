/**
 * PDF Report Generation
 * Creates PDF reports from HTML templates using Puppeteer
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { MonthlyReportData } from './reportData';

export interface PDFGenerationOptions {
  format?: 'A4' | 'Letter';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  headerTemplate?: string;
  footerTemplate?: string;
  displayHeaderFooter?: boolean;
}

/**
 * Generate PDF from monthly report data
 */
export async function generateMonthlyReportPDF(
  reportData: MonthlyReportData,
  options: PDFGenerationOptions = {}
): Promise<Buffer> {
  console.log(`[PDF Generation] Starting PDF generation for ${reportData.client.name} - ${reportData.month}`);
  
  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    page = await browser.newPage();

    // Generate HTML content
    const htmlContent = generateReportHTML(reportData);

    // Set content
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0' 
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: options.format || 'A4',
      margin: options.margin || {
        top: '1in',
        right: '0.75in',
        bottom: '1in',
        left: '0.75in'
      },
      displayHeaderFooter: options.displayHeaderFooter || true,
      headerTemplate: options.headerTemplate || generateHeaderTemplate(reportData),
      footerTemplate: options.footerTemplate || generateFooterTemplate(),
      printBackground: true
    });

    console.log(`[PDF Generation] Successfully generated PDF (${pdfBuffer.length} bytes)`);
    return Buffer.from(pdfBuffer);

  } catch (error) {
    console.error('[PDF Generation] Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

/**
 * Generate HTML content for the report
 */
function generateReportHTML(data: MonthlyReportData): string {
  const { client, month, monthlyRhythm, incidents, invoices, summary } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monthly Report - ${client.name} - ${month}</title>
    <style>
        ${getReportStyles()}
    </style>
</head>
<body>
    <div class="report-container">
        <!-- Report Header -->
        <header class="report-header">
            <div class="header-content">
                <h1>Monthly Report</h1>
                <div class="header-details">
                    <h2>${client.name}</h2>
                    <p class="month">${month}</p>
                    <p class="generated">Generated: ${new Date(data.generatedAt).toLocaleDateString()}</p>
                </div>
            </div>
        </header>

        <!-- Executive Summary -->
        <section class="summary-section">
            <h2>Executive Summary</h2>
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>Service Hours</h3>
                    <div class="metric">${summary.totalHoursUsed}</div>
                    <div class="breakdown">
                        <span>Rhythm: ${summary.rhythmHours}h</span>
                        <span>Incidents: ${summary.incidentHours}h</span>
                    </div>
                </div>
                <div class="summary-card">
                    <h3>Incidents</h3>
                    <div class="metric">${summary.totalIncidents}</div>
                    <div class="breakdown">
                        <span>Resolved: ${summary.resolvedIncidents}</span>
                        <span>Critical: ${summary.criticalIncidents}</span>
                    </div>
                </div>
                <div class="summary-card">
                    <h3>Billing</h3>
                    <div class="metric">$${summary.totalInvoiceAmount.toFixed(2)}</div>
                    <div class="breakdown">
                        <span>Paid: ${summary.paidInvoices}</span>
                        <span>Pending: ${summary.pendingInvoices}</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Monthly Rhythm -->
        ${monthlyRhythm ? `
        <section class="rhythm-section">
            <h2>Monthly Rhythm</h2>
            <div class="rhythm-content">
                <div class="rhythm-meta">
                    <p><strong>Hours Used:</strong> ${monthlyRhythm.hoursUsed || 0} / ${monthlyRhythm.hoursIncluded || 0}</p>
                </div>
                
                ${monthlyRhythm.week1Patch ? `
                <div class="rhythm-week">
                    <h3>Week 1 - Patch and Review</h3>
                    <p>${monthlyRhythm.week1Patch}</p>
                </div>
                ` : ''}
                
                ${monthlyRhythm.week2Observability ? `
                <div class="rhythm-week">
                    <h3>Week 2 - Observability</h3>
                    <p>${monthlyRhythm.week2Observability}</p>
                </div>
                ` : ''}
                
                ${monthlyRhythm.week3Hardening ? `
                <div class="rhythm-week">
                    <h3>Week 3 - Hardening</h3>
                    <p>${monthlyRhythm.week3Hardening}</p>
                </div>
                ` : ''}
                
                ${monthlyRhythm.week4Report ? `
                <div class="rhythm-week">
                    <h3>Week 4 - Report</h3>
                    <p>${monthlyRhythm.week4Report}</p>
                </div>
                ` : ''}
            </div>
        </section>
        ` : ''}

        <!-- Incidents -->
        <section class="incidents-section">
            <h2>Incidents (${incidents.length})</h2>
            ${incidents.length > 0 ? `
            <div class="incidents-list">
                ${incidents.map(incident => `
                <div class="incident-item severity-${incident.severity}">
                    <div class="incident-header">
                        <h3>${incident.title}</h3>
                        <div class="incident-meta">
                            <span class="severity">${incident.severity}</span>
                            <span class="status">${incident.status}</span>
                            ${incident.hoursUsed ? `<span class="hours">${incident.hoursUsed}h</span>` : ''}
                        </div>
                    </div>
                    <p class="incident-description">${incident.description}</p>
                    <div class="incident-dates">
                        <span>Reported: ${new Date(incident.reportedAt).toLocaleDateString()}</span>
                        ${incident.resolvedAt ? `<span>Resolved: ${new Date(incident.resolvedAt).toLocaleDateString()}</span>` : ''}
                    </div>
                </div>
                `).join('')}
            </div>
            ` : '<p class="no-data">No incidents reported this month.</p>'}
        </section>

        <!-- Invoices -->
        <section class="invoices-section">
            <h2>Invoices (${invoices.length})</h2>
            ${invoices.length > 0 ? `
            <table class="invoices-table">
                <thead>
                    <tr>
                        <th>Invoice #</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Issue Date</th>
                        <th>Due Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoices.map(invoice => `
                    <tr>
                        <td>${invoice.invoiceNumber}</td>
                        <td>${invoice.currency} ${invoice.totalAmount.toFixed(2)}</td>
                        <td><span class="status status-${invoice.status}">${invoice.status}</span></td>
                        <td>${new Date(invoice.issueDate).toLocaleDateString()}</td>
                        <td>${new Date(invoice.dueDate).toLocaleDateString()}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            ` : '<p class="no-data">No invoices issued this month.</p>'}
        </section>

        <!-- Footer -->
        <footer class="report-footer">
            <p>This report was automatically generated by TownesDev on ${new Date(data.generatedAt).toLocaleDateString()}</p>
            <p>For questions or clarifications, please contact your account manager.</p>
        </footer>
    </div>
</body>
</html>
  `;
}

/**
 * Get CSS styles for the report
 */
function getReportStyles(): string {
  return `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #1E2E3E;
        background: white;
    }

    .report-container {
        max-width: 8.5in;
        margin: 0 auto;
        padding: 0;
    }

    .report-header {
        background: #1E2E3E;
        color: white;
        padding: 2rem;
        margin-bottom: 2rem;
    }

    .header-content h1 {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 1rem;
    }

    .header-details h2 {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
    }

    .month {
        font-size: 1.1rem;
        color: #D8DDE2;
        margin-bottom: 0.5rem;
    }

    .generated {
        font-size: 0.9rem;
        color: #D8DDE2;
        opacity: 0.8;
    }

    h2 {
        font-size: 1.5rem;
        color: #1E2E3E;
        margin-bottom: 1rem;
        border-bottom: 2px solid #3A506B;
        padding-bottom: 0.5rem;
    }

    h3 {
        font-size: 1.2rem;
        color: #3A506B;
        margin-bottom: 0.5rem;
    }

    .summary-section {
        margin-bottom: 2rem;
    }

    .summary-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .summary-card {
        background: #f8f9fa;
        border: 1px solid #D8DDE2;
        border-radius: 8px;
        padding: 1.5rem;
        text-align: center;
    }

    .summary-card h3 {
        color: #3A506B;
        font-size: 1rem;
        margin-bottom: 0.5rem;
    }

    .metric {
        font-size: 2.5rem;
        font-weight: 700;
        color: #1E2E3E;
        margin-bottom: 0.5rem;
    }

    .breakdown {
        display: flex;
        justify-content: space-between;
        font-size: 0.9rem;
        color: #666;
    }

    .rhythm-section,
    .incidents-section,
    .invoices-section {
        margin-bottom: 2rem;
        page-break-inside: avoid;
    }

    .rhythm-week {
        margin-bottom: 1.5rem;
        padding: 1rem;
        background: #f8f9fa;
        border-left: 4px solid #3A506B;
    }

    .rhythm-week h3 {
        color: #1E2E3E;
        margin-bottom: 0.5rem;
    }

    .rhythm-week p {
        margin-bottom: 0;
        line-height: 1.5;
    }

    .incident-item {
        margin-bottom: 1.5rem;
        padding: 1rem;
        border: 1px solid #D8DDE2;
        border-radius: 8px;
        border-left-width: 4px;
    }

    .incident-item.severity-urgent,
    .incident-item.severity-critical {
        border-left-color: #dc3545;
    }

    .incident-item.severity-high {
        border-left-color: #fd7e14;
    }

    .incident-item.severity-medium {
        border-left-color: #ffc107;
    }

    .incident-item.severity-low {
        border-left-color: #28a745;
    }

    .incident-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.5rem;
    }

    .incident-meta {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .severity,
    .status,
    .hours {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
    }

    .severity {
        background: #e9ecef;
        color: #495057;
    }

    .status {
        background: #d1ecf1;
        color: #0c5460;
    }

    .hours {
        background: #d4edda;
        color: #155724;
    }

    .incident-description {
        margin-bottom: 0.5rem;
        color: #666;
    }

    .incident-dates {
        font-size: 0.9rem;
        color: #666;
        display: flex;
        gap: 1rem;
    }

    .invoices-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1rem;
    }

    .invoices-table th,
    .invoices-table td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid #D8DDE2;
    }

    .invoices-table th {
        background: #f8f9fa;
        font-weight: 600;
        color: #1E2E3E;
    }

    .status-paid {
        background: #d4edda;
        color: #155724;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 600;
    }

    .status-pending {
        background: #fff3cd;
        color: #856404;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 600;
    }

    .no-data {
        color: #666;
        font-style: italic;
        text-align: center;
        padding: 2rem;
    }

    .report-footer {
        margin-top: 3rem;
        padding: 2rem;
        background: #f8f9fa;
        border-top: 1px solid #D8DDE2;
        text-align: center;
        color: #666;
        font-size: 0.9rem;
    }

    @media print {
        .report-container {
            margin: 0;
            max-width: none;
        }
        
        .report-header,
        .rhythm-section,
        .incidents-section,
        .invoices-section {
            page-break-inside: avoid;
        }
    }
  `;
}

/**
 * Generate header template for PDF
 */
function generateHeaderTemplate(data: MonthlyReportData): string {
  return `
    <div style="font-size: 10px; color: #666; width: 100%; text-align: center; margin: 0 1in;">
      <span style="float: left;">TownesDev Monthly Report</span>
      <span style="float: right;">${data.client.name} - ${data.month}</span>
    </div>
  `;
}

/**
 * Generate footer template for PDF
 */
function generateFooterTemplate(): string {
  return `
    <div style="font-size: 10px; color: #666; width: 100%; text-align: center; margin: 0 1in;">
      <span style="float: left;">Confidential</span>
      <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      <span style="float: right;">TownesDev.com</span>
    </div>
  `;
}