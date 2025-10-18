/**
 * Admin Clients Page
 * Displays all clients for staff users
 */

import { requireCapability } from "../../../../lib/rbac/guards";
import { getAllClients } from "../../../../queries/clients";
import AdminClientsTable from "../../../../components/admin/AdminClientsTable";

export default async function AdminClientsPage() {
  // Require clients:read capability (staff/admin only)
  await requireCapability("clients:read");

  // Fetch all clients
  const clients = await getAllClients();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-nile-blue-900 mb-2">
          Client Management
        </h1>
        <p className="text-nile-blue-700">
          View and manage all client accounts
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold font-heading text-nile-blue-900 mb-2">
            All Clients
          </h2>
          <p className="text-sm text-gray-600">
            Comprehensive view of all client accounts and their details
          </p>
        </div>

        <AdminClientsTable clients={clients} />
      </div>
    </div>
  );
}
