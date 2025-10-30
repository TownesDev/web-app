// app/web/townesdev-app/src/app/(portal)/app/profile/page.tsx

import { getCurrentClient } from '../../../../lib/auth'
import { notFound } from 'next/navigation'
import { BillingPortalButton } from '@/components/BillingPortalButton'

export default async function ProfilePage() {
  const client = await getCurrentClient()

  if (!client) {
    notFound()
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Profile Settings
          </h1>
          <p className="text-gray-600 mb-6">
            Manage your account settings and preferences.
          </p>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {client.name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {client.email}
                </p>
              </div>
            </div>

            {/* Billing management */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Billing & Payments
              </h2>
              <p className="text-gray-600 mb-4">
                Update payment methods, view invoices, and manage your
                subscription from your Stripe billing portal.
              </p>
              <BillingPortalButton />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                📝 Profile management features are coming soon. Contact support
                if you need to update your information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
