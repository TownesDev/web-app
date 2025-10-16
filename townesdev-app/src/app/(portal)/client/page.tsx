import { getCurrentClient } from '../../../lib/auth'
import { notFound } from 'next/navigation'

export default async function ClientDashboard() {
  const client = await getCurrentClient()

  if (!client) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Welcome, {client.name}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Plan</h2>
              <p className="text-blue-700">{client.selectedPlan?.name || 'No plan selected'}</p>
              <p className="text-blue-600 text-sm">{client.selectedPlan?.price || ''}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-green-900 mb-2">Status</h2>
              <p className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${
                client.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {client.status}
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-purple-900 mb-2">Start Date</h2>
              <p className="text-purple-700">
                {client.startDate ? new Date(client.startDate).toLocaleDateString() : 'Not set'}
              </p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-orange-900 mb-2">Maintenance Window</h2>
              <p className="text-orange-700">{client.maintenanceWindow || 'Not set'}</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600">Activity feed coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}