import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { toHTML } from '@portabletext/to-html'

const resend = new Resend(process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY)

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
  htmlBody?: any[] // Portable Text array
}

function replacePlaceholders(template: string | undefined, clientData: ClientData): string {
  if (!template) return ''

  return template
    .replace(/\{\{clientName\}\}/g, clientData.name || 'Unknown Client')
    .replace(/\{\{planName\}\}/g, clientData.selectedPlan?.name || 'Unknown Plan')
    .replace(/\{\{startDate\}\}/g, clientData.startDate ? new Date(clientData.startDate).toLocaleDateString() : 'Not set')
    .replace(/\{\{slaStartTime\}\}/g, clientData.slaStartTime ? new Date(clientData.slaStartTime).toLocaleString() : 'Not set')
    .replace(/\{\{maintenanceWindow\}\}/g, clientData.maintenanceWindow || 'Not set')
    .replace(/\{\{status\}\}/g, clientData.status || 'Unknown')
}

export async function POST(request: NextRequest) {
  try {
    const { template, clientData, recipientEmail } = await request.json()

    if (!template || !clientData || !recipientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: template, clientData, recipientEmail' },
        { status: 400 }
      )
    }

    const personalizedSubject = replacePlaceholders(template.subject, clientData)
    const personalizedBody = replacePlaceholders(template.body, clientData)

    // Convert Portable Text to HTML if provided
    let personalizedHtmlBody: string | undefined
    if (template.htmlBody && Array.isArray(template.htmlBody)) {
      try {
        const htmlFromPortableText = toHTML(template.htmlBody)
        personalizedHtmlBody = replacePlaceholders(htmlFromPortableText, clientData)
      } catch (error) {
        console.error('Error converting Portable Text to HTML:', error)
        personalizedHtmlBody = undefined
      }
    }

    console.log('📧 Server-side Email Debug Info:')
    console.log('From: noreply@townes.dev')
    console.log('To:', recipientEmail)
    console.log('Subject:', personalizedSubject)
    console.log('Raw Template Body:', `"${template.body}"`)
    console.log('Raw Template HTML Body:', template.htmlBody)
    console.log('Text Body:', `"${personalizedBody}"`)
    console.log('HTML Body:', personalizedHtmlBody ? 'Generated from Portable Text' : 'Not provided')
    console.log('Text Body Length:', personalizedBody?.length || 0)
    console.log('HTML Body Length:', personalizedHtmlBody?.length || 0)

    // Ensure we have at least a text body
    if (!personalizedBody && !personalizedHtmlBody) {
      throw new Error('Email must have either text content or HTML content')
    }

    const emailOptions: any = {
      from: 'noreply@townes.dev',
      to: recipientEmail,
      subject: personalizedSubject,
    }

    // Add text body if available
    if (personalizedBody) {
      emailOptions.text = personalizedBody
    }

    // Add HTML body if provided
    if (personalizedHtmlBody) {
      emailOptions.html = personalizedHtmlBody
    }

    const result = await resend.emails.send(emailOptions)

    console.log('✅ Email sent successfully via API!')
    console.log('Resend Response:', result)

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      result
    })

  } catch (error: any) {
    console.error('❌ Server-side email error:', error)

    return NextResponse.json(
      {
        error: 'Failed to send email',
        message: error?.message || 'Unknown error',
        details: {
          message: error?.message,
          statusCode: error?.statusCode,
          name: error?.name
        }
      },
      { status: 500 }
    )
  }
}