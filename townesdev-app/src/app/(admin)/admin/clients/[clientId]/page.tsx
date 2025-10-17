/**
 * Client Detail Page (Stub)
 * Displays detailed information for a specific client
 */

import { requireCapability } from "../../../../../lib/rbac/guards";
import Link from "next/link";

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

        <h1 className="text-3xl font-bold font-heading text-nile-blue-900 mb-2">
          Client Details
        </h1>
        <p className="text-nile-blue-700">Client ID: {clientId}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👷‍♂️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Under Construction
          </h2>
          <p className="text-gray-600 mb-6">
            This client detail page is currently being developed.
          </p>
          <div className="text-sm text-gray-500">
            Coming soon: Client profile, plan details, invoices, and management
            actions.
          </div>
        </div>
      </div>
    </div>
  );
}
