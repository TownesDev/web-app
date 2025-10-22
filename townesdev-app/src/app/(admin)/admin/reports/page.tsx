import { Suspense } from "react";
import { requireCapability } from "../../../../lib/rbac/guards";
import { runQuery } from "../../../../lib/client";
import { qAllClients } from "../../../../sanity/lib/queries";
import { ReportGenerator } from "../../../../components/ReportGenerator";

/**
 * Admin Reports Page
 * Allows staff to generate PDF reports for clients
 */
export default async function AdminReportsPage() {
  // Require reports capability
  await requireCapability("reports:generate");

  // Get all clients for the dropdown
  const clients = await runQuery(qAllClients);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Monthly Reports</h1>
        <p className="mt-2 text-gray-600">
          Generate comprehensive monthly PDF reports for clients including rhythm activities, 
          incidents, and billing information.
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ReportGenerator clients={clients} />
      </Suspense>

      {/* Additional Information */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">About Monthly Reports</h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Report Sections</h3>
            <ul className="space-y-1">
              <li>• Executive Summary with key metrics</li>
              <li>• Monthly Rhythm breakdown by week</li>
              <li>• Incident tracking and resolution</li>
              <li>• Invoice and billing summary</li>
              <li>• Hours usage and allocation</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Data Sources</h3>
            <ul className="space-y-1">
              <li>• Monthly rhythm documents</li>
              <li>• Incident reports for the month</li>
              <li>• Invoice records and payments</li>
              <li>• Client plan and service details</li>
              <li>• Time tracking and hour usage</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Reports are generated in real-time from current data. 
            For consistent monthly reports, generate them at the end of each month when 
            all activities are complete.
          </p>
        </div>
      </div>
    </div>
  );
}