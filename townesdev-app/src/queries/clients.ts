/**
 * Admin Client Queries
 * Functions for fetching client data for admin use
 */

import { runAdminQueryNoCache } from '../lib/admin/client'
import { qAllClients } from '../sanity/lib/queries'

/**
 * Get all clients for admin dashboard
 * Returns clients with basic info and plan details
 */
export async function getAllClients() {
  return runAdminQueryNoCache(qAllClients)
}
