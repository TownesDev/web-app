import { definePlugin } from 'sanity'
import type { PortableTextBlock } from '@portabletext/types'

// Email sending functionality is handled via API routes
// No direct Resend client needed in Sanity Studio

interface ClientData {
  name: string
  selectedPlan?: { name: string }
  startDate?: string
  slaStartTime?: string
  maintenanceWindow?: string
  status?: string
}

interface EmailTemplate {
  name?: string
  subject: string
  body: string
  htmlBody?: PortableTextBlock[]
}

function replacePlaceholders(template: string, clientData: ClientData): string {
  return template
    .replace(/\{\{clientName\}\}/g, clientData.name || 'Unknown Client')
    .replace(
      /\{\{planName\}\}/g,
      clientData.selectedPlan?.name || 'Unknown Plan'
    )
    .replace(
      /\{\{startDate\}\}/g,
      clientData.startDate
        ? new Date(clientData.startDate).toLocaleDateString()
        : 'Not set'
    )
    .replace(
      /\{\{slaStartTime\}\}/g,
      clientData.slaStartTime
        ? new Date(clientData.slaStartTime).toLocaleString()
        : 'Not set'
    )
    .replace(
      /\{\{maintenanceWindow\}\}/g,
      clientData.maintenanceWindow || 'Not set'
    )
    .replace(/\{\{status\}\}/g, clientData.status || 'Unknown')
}

interface EmailResponse {
  success: boolean
  message: string
  result?: unknown
}

export async function sendEmail(
  template: EmailTemplate,
  clientData: ClientData,
  recipientEmail: string
): Promise<EmailResponse> {
  console.log('📧 Client-side Email Debug Info:')
  console.log('To:', recipientEmail)
  console.log('Template:', template.name || 'Unknown')
  console.log('Client Data:', clientData)

  try {
    console.log('🚀 Sending email via Next.js API route...')

    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template,
        clientData,
        recipientEmail,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || result.message || 'API request failed')
    }

    console.log('✅ Email sent successfully via API!')
    console.log('API Response:', result)

    return result
  } catch (error: unknown) {
    console.error('❌ Error sending email:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    const errorName = error instanceof Error ? error.name : 'UnknownError'
    const errorStack = error instanceof Error ? error.stack : undefined

    console.error('Error details:', {
      message: errorMessage,
      name: errorName,
      stack: errorStack,
    })

    throw new Error(`Failed to send email: ${errorMessage}`)
  }
}

export const emailSender = definePlugin({
  name: 'email-sender',
  // This plugin provides utility functions for sending emails
})
