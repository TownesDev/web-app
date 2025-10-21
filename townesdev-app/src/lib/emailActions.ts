'use server'

import { getEmailTemplateByName } from '../queries/emailTemplates'
import { ptToHtml, ptToPlainText, mergeVars } from '../lib/email'
import { resend, EMAIL_FROM } from '../lib/resendClient'

export async function testEmailTemplate(
  templateName: string,
  to: string,
  vars: Record<string, unknown> = {}
) {
  try {
    // Get email template
    const template = await getEmailTemplateByName(templateName)
    if (!template) {
      throw new Error(`Template '${templateName}' not found`)
    }

    // Render email content
    const subject = mergeVars(template.subject || '', vars)
    const htmlRaw = ptToHtml(template.htmlBody)
    const textRaw = ptToPlainText(template.htmlBody)

    const html = mergeVars(htmlRaw, vars)
    const text = mergeVars(textRaw, vars)

    // Send email
    const emailPayload = {
      from: EMAIL_FROM,
      to: [to],
      subject,
      text: text || 'Test email content',
      ...(html && { html }),
    }

    const result = await resend.emails.send(emailPayload)

    return {
      success: true,
      message: 'Email sent successfully',
      id: String(result),
    }
  } catch (error) {
    console.error('Error sending test email:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
