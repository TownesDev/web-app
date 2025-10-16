import { runQuery } from "../lib/client";
import { qInvoicesByClient } from "../sanity/lib/queries";

/**
 * Get invoices for a specific client, sorted by issueDate desc.
 */
// First get the client's _id from their session or auth token

// It will return all invoices for that client
// Then call this function with that clientId
export async function getInvoicesByClient(clientId: string) {
  return runQuery(qInvoicesByClient, { clientId });
}
