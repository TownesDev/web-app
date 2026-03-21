// app/web/townesdev-app/src/app/(portal)/app/page.tsx

import { getCurrentClient } from '../../../lib/auth'
import { getInvoicesByClient } from '../../../queries/invoices'
import InvoiceTable from '../../../components/invoices/InvoiceTable'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function ClientDashboard({ searchParams }: PageProps) {
  const client = await getCurrentClient()

  if (!client) {
    notFound()
  }

  const invoices = await getInvoicesByClient(client._id)
  const searchParamsData = await searchParams
  const isWelcome = searchParamsData.welcome === 'true'

  // Calculate next maintenance window (simplified - would need more logic)
  const nextMaintenance = client.maintenanceWindow
    ? new Date(client.maintenanceWindow).toLocaleDateString()
    : 'TBD'

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="font-heading text-3xl font-bold text-nile-blue-900 mb-2">
            {isWelcome
              ? `Welcome to TownesDev, ${client.name}!`
              : `Welcome back, ${client.name}`}
          </h1>
          <p className="text-gray-600">
            {isWelcome
              ? "Thank you for subscribing! Your retainer plan is now active. We'll be in touch soon to get started."
              : 'Manage your account and view your invoices below.'}
          </p>
          {isWelcome && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                🎉 Your payment was successful! Check your email for a welcome
                message with next steps.
              </p>
            </div>
          )}
        </div>

        {/* Account Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Plan & Status */}
          <div className="bg-white shadow rounded-lg p-6 border-l-4 border-nile-blue-500">
            <h2 className="text-xl font-semibold text-nile-blue-900 mb-4">
              Current Plan
            </h2>
            {client.productName || client.selectedPlan ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {client.productName || client.selectedPlan?.name}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                {client.selectedPlan?.price && (
                  <p className="text-gray-600 text-sm mb-2">
                    {client.selectedPlan.price}
                  </p>
                )}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Account Status</p>
                  <p className="text-sm font-medium text-gray-900">
                    {client.status}
                  </p>
                </div>
                {client.startDate && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-1">Member Since</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(client.startDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No active plan</p>
                <Link
                  href="/plans"
                  className="inline-flex items-center mt-2 text-sm text-blue-600 hover:text-blue-500"
                >
                  View Plans →
                </Link>
              </div>
            )}
          </div>

          {/* Next Maintenance Window */}
          <div className="bg-white shadow rounded-lg p-6 border-l-4 border-orange-500">
            <h2 className="text-xl font-semibold text-nile-blue-900 mb-4">
              Maintenance Window
            </h2>
            <div className="flex items-center">
              <div className="text-3xl mr-4">🛠️</div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {nextMaintenance}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Scheduled maintenance period
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6 border-l-4 border-green-500">
            <h2 className="text-xl font-semibold text-nile-blue-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                href="/app/assets"
                className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-green-600 mr-3 text-xl">🤖</span>
                  <div>
                    <p className="font-medium text-green-900 text-sm">
                      Manage Assets
                    </p>
                    <p className="text-xs text-green-700">Your bots & apps</p>
                  </div>
                </div>
              </Link>
              <Link
                href="/app/support"
                className="block p-3 bg-nile-blue-50 rounded-lg hover:bg-nile-blue-100 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-nile-blue-600 mr-3 text-xl">💬</span>
                  <div>
                    <p className="font-medium text-nile-blue-900 text-sm">
                      Get Support
                    </p>
                    <p className="text-xs text-nile-blue-700">Report issues</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Invoices Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-nile-blue-900">
              Recent Invoices
            </h2>
            <Link
              href="/app/invoices"
              className="text-sm text-nile-blue-600 hover:text-nile-blue-800 font-medium"
            >
              View All →
            </Link>
          </div>
          <InvoiceTable invoices={invoices} />
        </div>
      </div>
    </div>
  )
}
