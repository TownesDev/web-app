/**
 * Admin Incidents Page
 * Displays incidents table for staff users
 */

import { requireCapability } from '@/lib/rbac/guards'
import { getAllIncidents } from '@/queries/incidents'
import AdminIncidentsTable from '@/components/admin/AdminIncidentsTable'

export default async function AdminIncidentsPage() {
  // Require system:read capability (staff/admin only)
  await requireCapability('system:read')

  // Fetch all incidents
  const incidents = await getAllIncidents()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-nile-blue-900 mb-2">
          Incident Management
        </h1>
        <p className="text-nile-blue-700">
          Monitor and manage all client incidents
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold font-heading text-nile-blue-900 mb-2">
            All Incidents
          </h2>
          <p className="text-sm text-gray-600">
            View and manage incident reports across all clients
          </p>
        </div>

        <AdminIncidentsTable incidents={incidents} />
      </div>
    </div>
  )
}
