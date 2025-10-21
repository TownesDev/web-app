'use client'

interface Incident {
  _id: string
  title: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description?: string
  reportedAt: string
  resolvedAt?: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  hoursUsed?: number
  outOfScope?: boolean
}

interface IncidentListProps {
  incidents: Incident[]
  onStatusUpdate?: (id: string, title: string) => void
  onDelete?: (id: string, title: string) => void
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-800'
    case 'high':
      return 'bg-orange-100 text-orange-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'open':
      return 'bg-blue-100 text-blue-800'
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800'
    case 'resolved':
      return 'bg-green-100 text-green-800'
    case 'closed':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function IncidentList({
  incidents,
  onStatusUpdate,
  onDelete,
}: IncidentListProps) {
  if (incidents.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-16 w-16 text-nile-blue-400 mb-4"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No incidents reported
        </h3>
        <p className="text-gray-500">
          Your support incidents will appear here once they are reported.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Severity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reported
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Resolved
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {incidents.map((incident) => (
            <tr key={incident._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {incident.title}
                </div>
                {incident.description && (
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {incident.description}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(
                    incident.severity
                  )}`}
                >
                  {incident.severity.charAt(0).toUpperCase() +
                    incident.severity.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    incident.status
                  )}`}
                >
                  {incident.status
                    .replace('_', ' ')
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(incident.reportedAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {incident.resolvedAt ? formatDate(incident.resolvedAt) : '—'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() =>
                      onStatusUpdate?.(incident._id, incident.title)
                    }
                    disabled={
                      incident.status === 'resolved' ||
                      incident.status === 'closed'
                    }
                    className={`text-sm ${
                      incident.status === 'resolved' ||
                      incident.status === 'closed'
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-green-600 hover:text-green-900'
                    }`}
                    title={
                      incident.status === 'resolved' ||
                      incident.status === 'closed'
                        ? 'Incident already resolved'
                        : 'Mark as resolved'
                    }
                  >
                    ✓ Resolve
                  </button>
                  <button
                    onClick={() => onDelete?.(incident._id, incident.title)}
                    className="text-red-600 hover:text-red-900 text-sm"
                    title="Delete incident"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
