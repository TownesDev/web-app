// app/web/townesdev-app/src/app/(portal)/app/offboarding/page.tsx

import { getCurrentClient } from '../../../../lib/auth'
import { notFound } from 'next/navigation'

export default async function OffboardingPage() {
  const client = await getCurrentClient()

  if (!client) {
    notFound()
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Account Offboarding
          </h1>
          <p className="text-gray-600 mb-6">
            This feature is coming soon. If you need to cancel your account or
            offboard, please contact our support team.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              📧 Contact support at{' '}
              <a
                href="mailto:support@townesdev.com"
                className="text-blue-600 hover:underline"
              >
                support@townesdev.com
              </a>{' '}
              for assistance with account offboarding.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
