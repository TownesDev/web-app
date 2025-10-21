/**
 * Admin Create Email Template Page
 * Create a new email template
 */

import { requireCapability } from '../../../../../lib/rbac/guards'
import EmailTemplateForm from '../../../../../components/admin/EmailTemplateForm'

export default async function CreateEmailTemplatePage() {
  // Require admin capability for email templates management
  await requireCapability('content:write')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-heading text-nile-blue-900 mb-2">
              Create New Email Template
            </h1>
            <p className="text-nile-blue-700">
              Create a new email template for client communications
            </p>
          </div>
          <a
            href="/admin/email-templates"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            ← Back to Templates
          </a>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <EmailTemplateForm />
      </div>
    </div>
  )
}
