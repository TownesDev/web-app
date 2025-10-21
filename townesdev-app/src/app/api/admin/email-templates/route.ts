import { NextRequest, NextResponse } from 'next/server'
import { requireCapability } from '@/lib/rbac/guards'
import { sanityWrite } from '@/lib/client'

export async function POST(request: NextRequest) {
  try {
    // Require admin capability for email templates management
    await requireCapability('content:write')

    const { name, subject, htmlBody, purpose } = await request.json()

    // Validate required fields
    if (!name || !subject || !htmlBody || !purpose) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the email template in Sanity
    const result = await sanityWrite.create({
      _type: 'emailTemplate',
      name: name.trim(),
      subject: subject.trim(),
      purpose: purpose.trim(),
      htmlBody: htmlBody,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    })

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to create template' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: result._id })
  } catch (error) {
    console.error('Error creating email template:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
