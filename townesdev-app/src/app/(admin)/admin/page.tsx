/**
 * Admin Home Page
 * Displays clients table for staff users
 */

import { requireCapability } from "../../../lib/rbac/guards";
import { getAllClients } from "../../../queries/clients";
import AdminClientsTable from "../../../components/admin/AdminClientsTable";

export default async function AdminPage() {
  // Require clients:read capability (staff/admin only)
  await requireCapability("clients:read");

  // Fetch all clients
  const clients = await getAllClients();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-nile-blue-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-nile-blue-700">
          Manage clients and monitor system activity
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold font-heading text-nile-blue-900 mb-2">
            Clients
          </h2>
          <p className="text-sm text-gray-600">
            View and manage all client accounts
          </p>
        </div>

        <AdminClientsTable clients={clients} />
      </div>
    </div>
  );
}
