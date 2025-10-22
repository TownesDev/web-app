import { runPortalQueryNoCache } from '../lib/portal/client'
import { runAdminQueryNoCache } from '../lib/admin/client'
import { qInvoicesByClient, qAllInvoices } from '../sanity/lib/queries'

/**
 * Get invoices for a specific client, sorted by issueDate desc.
 * Used in portal routes only.
 */
export async function getInvoicesByClient(clientId: string) {
  return runPortalQueryNoCache(qInvoicesByClient, { clientId })
}

/**
 * Get all invoices for admin view, sorted by issueDate desc.
 * Used in admin routes only.
 */
export async function getAllInvoices() {
  return runAdminQueryNoCache(qAllInvoices)
}
