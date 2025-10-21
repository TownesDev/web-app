/**
 * 403 Forbidden Page
 * Displayed when user lacks required capabilities
 */

import Link from 'next/link'

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-red-500 text-6xl mb-4">🚫</div>

        <h1 className="text-2xl font-bold font-heading text-gray-900 mb-2">
          Access Denied
        </h1>

        <p className="text-gray-600 mb-6">
          You don&apos;t have permission to access this page. This area is
          restricted to staff members only.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-nile-blue-600 hover:bg-nile-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Go to Home Page
          </Link>

          <Link
            href="/app"
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Go to Client Portal
          </Link>
        </div>
      </div>
    </div>
  )
}
