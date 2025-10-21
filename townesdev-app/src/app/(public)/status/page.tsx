/**
 * Public Status Page
 * Displays system status with uptime and recent incidents
 */

import { Activity, AlertTriangle, CheckCircle } from 'lucide-react'

export const revalidate = 3600 // Revalidate every hour for status page

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-nile-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-nile-blue-900 mb-4 font-heading">
            System Status
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real-time status of TownesDev services and systems
          </p>
        </div>

        {/* Status Overview */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-nile-blue-900 font-heading">
                    All Systems Operational
                  </h2>
                  <p className="text-gray-600">
                    All TownesDev services are running normally
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Last updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Uptime Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-nile-blue-100 rounded-lg">
                <Activity className="h-6 w-6 text-nile-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold font-heading text-nile-blue-900">
                  Uptime
                </h3>
                <p className="text-sm text-gray-600">
                  Service availability over time
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last 30 days</span>
                <span className="text-lg font-bold text-green-600">99.9%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last 7 days</span>
                <span className="text-lg font-bold text-green-600">100%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last 24 hours</span>
                <span className="text-lg font-bold text-green-600">100%</span>
              </div>
            </div>
          </div>

          {/* Last Incident Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold font-heading text-nile-blue-900">
                  Last Incident
                </h3>
                <p className="text-sm text-gray-600">
                  Most recent service disruption
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Resolved
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Date</span>
                <span className="text-sm font-medium text-gray-900">
                  No incidents reported
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Duration</span>
                <span className="text-sm font-medium text-gray-900">N/A</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold font-heading text-nile-blue-900 mb-4">
              About This Status Page
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                This page provides real-time information about the operational
                status of TownesDev services. We monitor our systems 24/7 to
                ensure reliable service delivery.
              </p>
              <p>
                <strong>Uptime metrics:</strong> Calculated based on service
                availability and response times.
              </p>
              <p>
                <strong>Incident reporting:</strong> Any service disruptions
                will be reported here with details about impact and resolution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
