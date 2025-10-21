/**
 * Admin Email Template Edit Page
 * Edit individual email template details
 */

import { requireCapability } from '../../../../../lib/rbac/guards'
import { runQueryFresh } from '../../../../../lib/client'
import { notFound } from 'next/navigation'
import EmailTemplateForm from '../../../../../components/admin/EmailTemplateForm'

interface EmailTemplate {
  _id: string
  name: string
  subject: string
  htmlBody?: any[]
  purpose: string
}

export default async function EmailTemplateEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Require admin capability for email templates management
  await requireCapability('content:write')

  const { id } = await params

  // Fetch the specific email template
  const template = (await runQueryFresh(
    `*[_type=="emailTemplate" && _id==$id][0]{
      _id,
      name,
      subject,
      htmlBody,
      purpose
    }`,
    { id }
  )) as EmailTemplate

  if (!template) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-heading text-nile-blue-900 mb-2">
              Edit Email Template
            </h1>
            <p className="text-nile-blue-700">
              Modify the email template details
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
        <EmailTemplateForm template={template} />
      </div>
    </div>
  )
}
