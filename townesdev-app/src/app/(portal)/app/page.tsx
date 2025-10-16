// app/web/townesdev-app/src/app/(portal)/app/page.tsx

import { getCurrentClient } from "../../../lib/auth";
import { getInvoicesByClient } from "../../../queries/invoices";
import InvoiceTable from "../../../components/invoices/InvoiceTable";
import ClientInfoGrid from "../../../components/ClientInfoGrid";
import { notFound } from "next/navigation";

export default async function ClientDashboard() {
  const client = await getCurrentClient();

  if (!client) {
    notFound();
  }

  const invoices = await getInvoicesByClient(client._id);

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="font-heading text-3xl font-bold text-nile-blue-900 mb-2">
            Welcome back, {client.name}
          </h1>
          <p className="text-gray-600">
            Manage your account and view your invoices below.
          </p>
        </div>

        {/* Client Information Grid */}
        <ClientInfoGrid client={client} />

        {/* Quick Links */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-nile-blue-900 mb-4">
            Quick Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/app/invoices"
              className="flex items-center p-4 bg-nile-blue-50 rounded-lg hover:bg-nile-blue-100 transition-colors"
            >
              <div className="text-nile-blue-600 mr-3">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-nile-blue-900">Invoices</h3>
                <p className="text-sm text-nile-blue-700">
                  View and manage your invoices
                </p>
              </div>
            </a>
            <a
              href="/app/incidents"
              className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="text-orange-600 mr-3">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-orange-900">Incidents</h3>
                <p className="text-sm text-orange-700">
                  Track support incidents
                </p>
              </div>
            </a>
            <a
              href="/app/rhythm"
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="text-purple-600 mr-3">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-purple-900">Monthly Rhythm</h3>
                <p className="text-sm text-purple-700">
                  View maintenance schedules
                </p>
              </div>
            </a>
          </div>
        </div>

        {/* Invoices Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-nile-blue-900 mb-4">
            Your Invoices
          </h2>
          <InvoiceTable invoices={invoices} />
        </div>

        {/* Future Sections Placeholder */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-nile-blue-900 mb-4">
            Recent Activity
          </h2>
          <div className="text-gray-500">
            Activity feed and updates coming soon...
          </div>
        </div>
      </div>
    </div>
  );
}
