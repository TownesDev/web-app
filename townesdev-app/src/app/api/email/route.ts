import { NextRequest, NextResponse } from 'next/server'
import { getEmailTemplateByName } from '../../../queries/emailTemplates'
import { ptToHtml, ptToPlainText, mergeVars } from '../../../lib/email'
import { resend, EMAIL_FROM } from '../../../lib/resendClient'

type Body = {
  templateName: string
  to: string | string[]
  vars?: Record<string, unknown>
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body

    if (!body?.templateName || !body?.to) {
      return NextResponse.json(
        { error: 'Missing required fields: templateName, to' },
        { status: 400 }
      )
    }

    // Optional: enforce RBAC or server-only usage here
    // e.g., check auth header, capability, or internal secret

    const tpl = await getEmailTemplateByName(body.templateName)
    if (!tpl) {
      return NextResponse.json(
        { error: `Template '${body.templateName}' not found` },
        { status: 404 }
      )
    }

    const subject = mergeVars(tpl.subject || '', body.vars || {})
    const htmlRaw = ptToHtml(tpl.htmlBody)
    const textRaw = ptToPlainText(tpl.htmlBody)

    // Merge vars
    const html = mergeVars(htmlRaw, body.vars || {})
    const text = mergeVars(textRaw, body.vars || {})

    // If no HTML produced, Resend will use text fallback
    const emailPayload: {
      from: string
      to: string[]
      subject: string
      text: string
      html?: string
    } = {
      from: EMAIL_FROM,
      to: Array.isArray(body.to) ? body.to : [body.to],
      subject,
      text: text || 'Email content could not be generated.',
    }

    // Add HTML if available
    if (html) {
      emailPayload.html = html
    }

    const result = await resend.emails.send(emailPayload)

    // Normalize response
    return NextResponse.json(
      {
        id:
          (result as { id?: string; data?: { id?: string } })?.id ||
          (result as { id?: string; data?: { id?: string } })?.data?.id ||
          null,
        ok: true,
      },
      { status: 200 }
    )
  } catch (err: unknown) {
    console.error('Email send error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to send email', detail: errorMessage },
      { status: 500 }
    )
  }
}
