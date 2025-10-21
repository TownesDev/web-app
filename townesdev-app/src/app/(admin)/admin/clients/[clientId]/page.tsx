/**
 * Client Detail Page
 * Displays detailed information for a specific client including bot management
 */

import { requireCapability } from "../../../../../lib/rbac/guards";
import { runQuery } from "../../../../../lib/client";
import { qClientById } from "../../../../../sanity/lib/queries";
import Link from "next/link";
import { BotManagementSection } from "../../../../../components/BotManagementSection";

interface ClientDetailPageProps {
  params: {
    clientId: string;
  };
}

export default async function ClientDetailPage({
  params,
}: ClientDetailPageProps) {
  const { clientId } = params;

  // Require clients:read capability
  await requireCapability("clients:read");

  // Fetch client details
  const client = await runQuery(qClientById, { id: clientId });

  if (!client) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Client Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The requested client could not be found.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-nile-blue-600 hover:bg-nile-blue-700"
          >
            Back to Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href="/admin"
            className="text-nile-blue-600 hover:text-nile-blue-900 font-medium"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-heading text-nile-blue-900 mb-2">
              {client.name}
            </h1>
            <p className="text-nile-blue-700">Client ID: {clientId}</p>
            <p className="text-sm text-gray-600 mt-1">Email: {client.email}</p>
          </div>
          <div className="text-right">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                client.status === "Active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {client.status}
            </span>
            {client.selectedPlan && (
              <p className="text-sm text-gray-600 mt-1">
                Plan: {client.selectedPlan.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bot Management Section */}
      <BotManagementSection clientId={clientId} client={client} />
    </div>
  );
}
