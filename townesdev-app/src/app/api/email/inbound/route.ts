import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { sanityWrite } from '../../../../lib/client'
import {
  findClientByEmail,
  extractEmailAddress,
} from '../../../../lib/emailMapping'
import { parseEmailToIncident } from '../../../../lib/emailParser'
import {
  processEmailAttachments,
  generateAttachmentSummary,
} from '../../../../lib/emailAttachments'

interface IncidentData {
  _type: 'incident'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open'
  reportedAt: string
  source: 'email'
  tags: string[]
  emailMessageId: string
  senderEmail: string
  originalFrom: string
  hasAttachments: boolean
  isReply: boolean
  matchType: string
  metadata: {
    attachmentCount: number
    attachmentSummary?: unknown
  }
  attachments?: unknown[]
  client?: {
    _type: 'reference'
    _ref: string
  }
}

/**
 * Email webhook endpoint for receiving inbound emails and creating incident tickets
 * Supports Resend webhook format and other common email service providers
 */
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()

    // Verify webhook authentication
    const webhookSecret = process.env.EMAIL_WEBHOOK_SECRET
    const signature =
      headersList.get('x-webhook-signature') ||
      headersList.get('resend-signature') ||
      headersList.get('authorization')

    if (!webhookSecret) {
      console.error('[Email Webhook] EMAIL_WEBHOOK_SECRET not configured')
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      )
    }

    if (!signature) {
      console.error('[Email Webhook] Missing webhook signature')
      return NextResponse.json(
        { error: 'Webhook authentication required' },
        { status: 401 }
      )
    }

    // Simple signature validation for development (in production, use proper HMAC validation)
    if (process.env.NODE_ENV === 'development' && signature !== webhookSecret) {
      console.error('[Email Webhook] Invalid webhook signature for development')
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    // Parse email payload
    const payload = await request.json()
    console.log('[Email Webhook] Received payload:', {
      from: payload.from,
      subject: payload.subject,
      timestamp: payload.timestamp || new Date().toISOString(),
    })

    // Extract email data with fallbacks for different webhook formats
    const emailData = {
      from: payload.from || payload.sender?.email,
      subject: payload.subject || payload.data?.subject,
      body: payload.text || payload.body || payload.data?.text,
      htmlBody: payload.html || payload.data?.html,
      timestamp:
        payload.timestamp || payload.created_at || new Date().toISOString(),
      messageId: payload.id || payload.message_id || `email-${Date.now()}`,
      attachments: payload.attachments || [],
    }

    // Validate required fields
    if (!emailData.from || !emailData.subject) {
      console.error('[Email Webhook] Missing required email data:', emailData)
      return NextResponse.json(
        { error: 'Missing required email fields (from, subject)' },
        { status: 400 }
      )
    }

    // Extract and normalize sender email
    const rawEmailFrom = emailData.from
    const cleanEmail = extractEmailAddress(rawEmailFrom)

    if (!cleanEmail) {
      console.error(
        '[Email Webhook] Invalid sender email format:',
        rawEmailFrom
      )
      return NextResponse.json(
        { error: 'Invalid sender email format' },
        { status: 400 }
      )
    }

    // Find client with enhanced mapping
    console.log('[Email Webhook] Looking up client for email:', cleanEmail)
    const lookupResult = await findClientByEmail(cleanEmail)

    let client = lookupResult.client
    let matchType = lookupResult.matchType
    let incidentCategory = 'client'

    // Handle unknown senders based on configuration
    if (!client) {
      console.warn('[Email Webhook] No client found for email:', cleanEmail)

      // Check if we should handle unknown emails
      const handleUnknownEmails = process.env.HANDLE_UNKNOWN_EMAILS === 'true'

      if (!handleUnknownEmails) {
        return NextResponse.json(
          {
            error: 'Client not found',
            message: 'Email sender is not associated with any client account',
            email: cleanEmail,
            originalFrom: rawEmailFrom,
            suggestion:
              'Add this email to a client record in Sanity Studio if this is a legitimate client inquiry',
          },
          { status: 404 }
        )
      }

      // Create incident for unknown sender with special handling
      console.log(
        '[Email Webhook] Creating incident for unknown sender:',
        cleanEmail
      )
      incidentCategory = 'unknown'
      matchType = 'none'

      // Use a default "Unknown Clients" bucket or create individual records
      const unknownClientId = process.env.UNKNOWN_CLIENT_ID || null

      if (unknownClientId) {
        // Use a designated "Unknown Clients" client record
        const unknownClientResult = await sanityWrite.fetch(
          `*[_type == "client" && _id == $clientId][0]`,
          { clientId: unknownClientId }
        )
        client = unknownClientResult
      }

      if (!client) {
        // Still no client found, create a special incident without client reference
        console.log(
          '[Email Webhook] Creating clientless incident for unknown sender'
        )
      }
    }

    console.log(
      `[Email Webhook] Processing email - Category: ${incidentCategory}, Match: ${matchType}${client ? `, Client: ${client.name}` : ', No Client'}`
    )

    // Parse email content into structured incident data
    const parsedContent = parseEmailToIncident(
      emailData.subject,
      emailData.body,
      emailData.htmlBody
    )

    console.log('[Email Webhook] Parsed email content:', {
      title: parsedContent.title,
      priority: parsedContent.priority,
      isReply: parsedContent.isReply,
      tags: parsedContent.tags,
    })

    // Process email attachments
    const processedAttachments = processEmailAttachments(emailData.attachments)
    const attachmentSummary = generateAttachmentSummary(processedAttachments)

    if (attachmentSummary.totalCount > 0) {
      console.log('[Email Webhook] Attachment summary:', attachmentSummary)

      if (attachmentSummary.hasUnsafe) {
        console.warn(
          '[Email Webhook] Unsafe attachments detected:',
          processedAttachments
            .filter((att) => !att.isSafe)
            .map((att) => att.filename)
        )
      }
    }

    // Create incident document
    console.log(
      '[Email Webhook] Creating incident for client:',
      client?.name || 'Unknown Client'
    )

    const incidentData: IncidentData = {
      _type: 'incident' as const,
      title: parsedContent.title,
      description: parsedContent.description,
      severity: parsedContent.priority, // Map priority to severity
      status: 'open' as const,
      reportedAt: emailData.timestamp,
      source: 'email' as const,
      tags: parsedContent.tags,
      emailMessageId: emailData.messageId,
      senderEmail: cleanEmail,
      originalFrom: rawEmailFrom,
      hasAttachments: processedAttachments.length > 0,
      isReply: parsedContent.isReply,
      matchType: matchType,
      metadata: {
        attachmentCount: attachmentSummary.totalCount,
        ...(attachmentSummary.totalCount > 0 && {
          attachmentSummary: attachmentSummary,
        }),
      },
      ...(processedAttachments.length > 0 && {
        attachments: processedAttachments,
      }),
    }

    // Add client reference if we have a client
    if (client) {
      incidentData.client = {
        _type: 'reference' as const,
        _ref: client._id,
      }
    }

    const incident = await sanityWrite.create(incidentData)

    // Log successful creation
    console.log('[Email Webhook] Successfully created incident:', {
      incidentId: incident._id,
      clientId: client?._id || 'N/A',
      clientName: client?.name || 'Unknown Client',
      title: parsedContent.title,
      priority: parsedContent.priority,
      messageId: emailData.messageId,
      senderEmail: cleanEmail,
      matchType: matchType,
    })

    return NextResponse.json({
      success: true,
      incident: {
        id: incident._id,
        title: parsedContent.title,
        client: client?.name || 'Unknown Client',
        status: 'open',
        priority: parsedContent.priority,
        isReply: parsedContent.isReply,
        attachmentCount: attachmentSummary.totalCount,
        hasUnsafeAttachments: attachmentSummary.hasUnsafe,
      },
      message: 'Incident created successfully from email',
    })
  } catch (error) {
    console.error('[Email Webhook] Error processing email:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to process inbound email',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
