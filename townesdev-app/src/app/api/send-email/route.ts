import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { toHTML } from '@portabletext/to-html'
import type { CreateEmailOptions } from 'resend'
import type { PortableTextBlock } from '@portabletext/types'

const resend = new Resend(process.env.RESEND_API_KEY!)

interface ClientData {
  name: string
  selectedPlan?: { name: string }
  startDate?: string
  slaStartTime?: string
  maintenanceWindow?: string
  status?: string
}

function replacePlaceholders(
  template: string | undefined,
  clientData: ClientData
): string {
  if (!template) return ''

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

export async function POST(request: NextRequest) {
  try {
    const { template, clientData, recipientEmail } = await request.json()

    if (!template || !clientData || !recipientEmail) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: template, clientData, recipientEmail',
        },
        { status: 400 }
      )
    }

    const personalizedSubject = replacePlaceholders(
      template.subject,
      clientData
    )
    const personalizedBody = replacePlaceholders(template.body, clientData)

    // Convert Portable Text to HTML if provided
    let personalizedHtmlBody: string | undefined
    if (template.htmlBody && Array.isArray(template.htmlBody)) {
      try {
        const htmlFromPortableText = toHTML(template.htmlBody)
        personalizedHtmlBody = replacePlaceholders(
          htmlFromPortableText,
          clientData
        )
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
    console.log(
      'HTML Body:',
      personalizedHtmlBody ? 'Generated from Portable Text' : 'Not provided'
    )
    console.log('Text Body Length:', personalizedBody?.length || 0)
    console.log('HTML Body Length:', personalizedHtmlBody?.length || 0)

    // Ensure we have at least a text body
    if (!personalizedBody && !personalizedHtmlBody) {
      throw new Error('Email must have either text content or HTML content')
    }

    // Build email options with required content
    const baseOptions = {
      from: 'noreply@townes.dev',
      to: recipientEmail,
      subject: personalizedSubject,
    }

    let emailOptions: CreateEmailOptions

    if (personalizedBody && personalizedHtmlBody) {
      emailOptions = {
        ...baseOptions,
        text: personalizedBody,
        html: personalizedHtmlBody,
      }
    } else if (personalizedBody) {
      emailOptions = { ...baseOptions, text: personalizedBody }
    } else {
      emailOptions = { ...baseOptions, html: personalizedHtmlBody! }
    }

    const result = await resend.emails.send(emailOptions)

    console.log('✅ Email sent successfully via API!')
    console.log('Resend Response:', result)

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      result,
    })
  } catch (error: unknown) {
    console.error('❌ Server-side email error:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    const errorName = error instanceof Error ? error.name : 'UnknownError'
    const statusCode =
      error && typeof error === 'object' && 'statusCode' in error
        ? (error as { statusCode?: number }).statusCode
        : undefined

    return NextResponse.json(
      {
        error: 'Failed to send email',
        message: errorMessage,
        details: {
          message: errorMessage,
          statusCode,
          name: errorName,
        },
      },
      { status: 500 }
    )
  }
}
