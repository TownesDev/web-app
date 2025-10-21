import { runQuery } from '../lib/client'
import { qInvoicesByClient, qAllInvoices } from '../sanity/lib/queries'

/**
 * Get invoices for a specific client, sorted by issueDate desc.
 */
export async function getInvoicesByClient(clientId: string) {
  return runQuery(qInvoicesByClient, { clientId })
}

/**
 * Get all invoices for admin view, sorted by issueDate desc.
 */
export async function getAllInvoices() {
  return runQuery(qAllInvoices)
}
