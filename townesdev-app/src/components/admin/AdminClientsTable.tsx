'use client'

/**
 * Admin Clients Table Component
 * Displays clients with Name | Status | Plan | Actions columns
 * Includes status filtering functionality
 */

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface Client {
  _id: string
  name: string
  email: string
  status: string
  selectedPlan?: {
    name: string
    price: string
  }
}

interface AdminClientsTableProps {
  clients: Client[]
}

type StatusFilter = 'all' | 'Active' | 'Inactive' | 'Cancelled'

export default function AdminClientsTable({ clients }: AdminClientsTableProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  // Filter clients based on status
  const filteredClients = useMemo(() => {
    if (statusFilter === 'all') return clients

    return clients.filter((client) => {
      switch (statusFilter) {
        case 'Active':
          return client.status === 'Active'
        case 'Inactive':
          return client.status === 'Inactive'
        case 'Cancelled':
          return client.status === 'Cancelled'
        default:
          return true
      }
    })
  }, [clients, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Inactive':
        return 'bg-red-100 text-red-800'
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {/* Status Filter */}
      <div className="flex items-center space-x-4">
        <label
          htmlFor="status-filter"
          className="text-sm font-medium text-gray-700"
        >
          Filter by Status:
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-nile-blue-500 focus:outline-none focus:ring-1 focus:ring-nile-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <span 
          className="text-sm text-gray-500"
          aria-live="polite"
          aria-atomic="true"
        >
          Showing {filteredClients.length} of {clients.length} clients
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200" role="table">
          <caption className="sr-only">
            Client management table showing {filteredClients.length} of {clients.length} total clients with their status, plan, and available actions
          </caption>
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Plan
              </th>
              <th 
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No clients found
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {client.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{client.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.status)}`}
                      aria-label={`Client status: ${client.status}`}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {client.selectedPlan?.name || 'No Plan'}
                    </div>
                    {client.selectedPlan?.price && (
                      <div className="text-sm text-gray-500">
                        {client.selectedPlan.price}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/clients/${client._id}`}
                        className="text-nile-blue-600 hover:text-nile-blue-900 focus:outline-none focus:ring-2 focus:ring-nile-blue-500 rounded px-2 py-1"
                        aria-label={`View details for ${client.name}`}
                      >
                        View Details
                      </Link>
                      <Link
                        href={`/admin/clients/${client._id}/rhythm`}
                        className="text-nile-blue-600 hover:text-nile-blue-900 focus:outline-none focus:ring-2 focus:ring-nile-blue-500 rounded px-2 py-1"
                        aria-label={`View rhythm settings for ${client.name}`}
                      >
                        Rhythm
                      </Link>
                      {/* Edit button - only show if user has write capability */}
                      <span 
                        className="text-gray-300 cursor-not-allowed px-2 py-1"
                        aria-label={`Edit ${client.name} (not available)`}
                      >
                        Edit
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
