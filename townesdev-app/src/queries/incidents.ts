import { runQuery } from '../lib/client'
import { qIncidentsByClient, qAllIncidents } from '../sanity/lib/queries'

/**
 * Get incidents for a specific client, sorted by reportedAt desc.
 */
export async function getIncidentsByClient(clientId: string) {
  return runQuery(qIncidentsByClient, { clientId })
}

/**
 * Get all incidents for admin dashboard
 * Returns incidents with client names and all incident details
 */
export async function getAllIncidents() {
  return runQuery(qAllIncidents)
}
