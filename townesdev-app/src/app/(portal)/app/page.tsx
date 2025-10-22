// app/web/townesdev-app/src/app/(portal)/app/page.tsx

import { getCurrentClient } from '../../../lib/auth'
import { getInvoicesByClient } from '../../../queries/invoices'
import InvoiceTable from '../../../components/invoices/InvoiceTable'
import ClientInfoGrid from '../../../components/ClientInfoGrid'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ClientDashboard({ searchParams }: PageProps) {
  const client = await getCurrentClient()

  if (!client) {
    notFound()
  }

  // Await searchParams in Next.js 15
  const resolvedSearchParams = await searchParams

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

        {/* Plan Card and Maintenance Window */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Plan */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-nile-blue-900 mb-4">
              Current Plan
            </h2>
            {client.selectedPlan ? (
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {client.selectedPlan.name}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <p className="text-gray-600 mt-2">
                  {client.selectedPlan.price}
                </p>
                <div className="mt-4">
                  <Link
                    href="/app/assets"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                  >
                    Manage Assets →
                  </Link>
                </div>
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
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-nile-blue-900 mb-4">
              Next Maintenance Window
            </h2>
            <div className="flex items-center">
              <div className="text-2xl mr-4">🛠️</div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {nextMaintenance}
                </p>
                <p className="text-sm text-gray-600">
                  Scheduled maintenance period
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Client Information Grid */}
        <ClientInfoGrid client={client} />

        {/* Quick Links */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-nile-blue-900 mb-4">
            Quick Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <a
              href="/app/assets"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="text-green-600 mr-3">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-green-900">Assets</h3>
                <p className="text-sm text-green-700">
                  Manage your bots & apps
                </p>
              </div>
            </a>
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
  )
}
