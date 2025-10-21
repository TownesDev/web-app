/**
 * Admin Email Templates Page
 * Displays email templates table for staff users
 */

import { requireCapability } from '../../../../lib/rbac/guards'
import { runQueryFresh } from '../../../../lib/client'
import { qEmailTemplates } from '../../../../sanity/lib/queries'
import EmailTemplatesTable from '../../../../components/admin/EmailTemplatesTable'
import Link from 'next/link'

export default async function EmailTemplatesPage() {
  // Require admin capability for email templates management
  await requireCapability('content:write')

  // Fetch all email templates
  const templates = await runQueryFresh(qEmailTemplates)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-nile-blue-900 mb-2">
          Email Templates
        </h1>
        <p className="text-nile-blue-700">
          Manage email templates for client communications
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold font-heading text-nile-blue-900 mb-2">
              Templates
            </h2>
            <p className="text-sm text-gray-600">
              View and edit email templates used for client communications
            </p>
          </div>
          <Link
            href="/admin/email-templates/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-nile-blue-600 hover:bg-nile-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-nile-blue-500"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create New Template
          </Link>
        </div>

        <EmailTemplatesTable templates={templates} />
      </div>
    </div>
  )
}
