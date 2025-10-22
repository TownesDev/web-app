/**
 * Email Test Page
 * Allows admins to test email templates with custom variables
 */

import { requireCapability } from '@/lib/rbac/guards'
import { getAllEmailTemplates } from '@/queries/emailTemplates'
import EmailTestForm from '@/components/admin/EmailTestForm'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EmailTestPage({ searchParams }: PageProps) {
  // Require admin capability
  await requireCapability('content:read')

  // Await searchParams in Next.js 15
  const resolvedSearchParams = await searchParams
  const templateName =
    typeof resolvedSearchParams.template === 'string'
      ? resolvedSearchParams.template
      : 'Welcome Activation'

  // Get all templates for the dropdown
  const allTemplates = await getAllEmailTemplates()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-nile-blue-900 mb-2">
          Email Template Tester
        </h1>
        <p className="text-nile-blue-700">
          Test email templates with custom variables and recipients
        </p>
      </div>

      <EmailTestForm
        initialTemplateName={templateName}
        availableTemplates={allTemplates}
      />

      {/* Quick Links */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Available Templates
        </h3>
        <div className="flex flex-wrap gap-2">
          <a
            href="?template=Welcome Activation"
            className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-nile-blue-100 text-nile-blue-800 hover:bg-nile-blue-200 transition-colors"
          >
            Welcome Activation
          </a>
          {/* Add more template links as you create them */}
        </div>
      </div>
    </div>
  )
}
