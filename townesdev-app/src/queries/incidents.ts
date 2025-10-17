import { runQuery } from "../lib/client";
import { qIncidentsByClient } from "../sanity/lib/queries";

/**
 * Get incidents for a specific client, sorted by reportedAt desc.
 */
export async function getIncidentsByClient(clientId: string) {
  return runQuery(qIncidentsByClient, { clientId });
}
