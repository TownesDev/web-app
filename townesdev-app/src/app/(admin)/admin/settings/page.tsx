/**
 * Admin Settings Page
 * Displays operation configuration settings for admin users
 */

import { requireCapability } from '@/lib/rbac/guards'
import { runQueryNoCache } from '@/lib/client'
import { qOperationConfig } from '@/sanity/lib/queries'
import Link from 'next/link'
import { Settings, Edit } from 'lucide-react'

interface OperationConfig {
  overageRate: string
  emergencyRate: string
  reactivationFee: string
}

export default async function SettingsPage() {
  // Require admin capability for settings management
  await requireCapability('content:write')

  // Fetch operation configuration
  const config = (await runQueryNoCache(qOperationConfig)) as OperationConfig

  // Build Sanity Studio edit URL
  const editUrl = `/studio/desk/operationConfig`

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-nile-blue-900 mb-2">
          Settings
        </h1>
        <p className="text-nile-blue-700">
          Manage operation configuration and system settings
        </p>
      </div>

      {/* Edit in Studio Link */}
      <div className="mb-6">
        <Link
          href={editUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-nile-blue-600 hover:bg-nile-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nile-blue-500"
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit in Studio
        </Link>
      </div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Overage Rate */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-nile-blue-100 rounded-lg">
              <Settings className="h-6 w-6 text-nile-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold font-heading text-nile-blue-900">
                Overage Rate
              </h3>
              <p className="text-sm text-gray-600">
                Rate for hours beyond plan limits
              </p>
            </div>
          </div>
          <div className="text-2xl font-bold text-nile-blue-900">
            {config?.overageRate || 'Not set'}
          </div>
        </div>

        {/* Emergency Rate */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Settings className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold font-heading text-nile-blue-900">
                Emergency Rate
              </h3>
              <p className="text-sm text-gray-600">
                Rate for emergency support (nights/weekends)
              </p>
            </div>
          </div>
          <div className="text-2xl font-bold text-nile-blue-900">
            {config?.emergencyRate || 'Not set'}
          </div>
        </div>

        {/* Reactivation Fee */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Settings className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold font-heading text-nile-blue-900">
                Reactivation Fee
              </h3>
              <p className="text-sm text-gray-600">
                Fee for immediate SLA reactivation
              </p>
            </div>
          </div>
          <div className="text-2xl font-bold text-nile-blue-900">
            {config?.reactivationFee || 'Not set'}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold font-heading text-nile-blue-900 mb-4">
          About These Settings
        </h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <strong>Overage Rate:</strong> Applied when client usage exceeds
            their plan&apos;s included hours.
          </p>
          <p>
            <strong>Emergency Rate:</strong> Applied for urgent support requests
            outside business hours.
          </p>
          <p>
            <strong>Reactivation Fee:</strong> One-time fee to immediately
            restore SLA guarantees for paused accounts.
          </p>
        </div>
        <div className="mt-4 p-4 bg-nile-blue-50 rounded-lg">
          <p className="text-sm text-nile-blue-800">
            <strong>Note:</strong> Changes to these settings take effect
            immediately. Use the &quot;Edit in Studio&quot; button above to
            modify values.
          </p>
        </div>
      </div>
    </div>
  )
}
