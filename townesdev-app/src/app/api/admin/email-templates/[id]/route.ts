import { NextRequest, NextResponse } from 'next/server'
import { requireCapability } from '@/lib/rbac/guards'
import { sanityWrite } from '@/lib/client'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin capability for email templates management
    await requireCapability('content:write')

    const { id } = await params
    const { name, subject, htmlBody, purpose } = await request.json()

    // Validate required fields
    if (!name || !subject || !htmlBody || !purpose) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update the email template in Sanity
    const result = await sanityWrite
      .patch(id)
      .set({
        name: name.trim(),
        subject: subject.trim(),
        purpose: purpose.trim(),
        lastModified: new Date().toISOString(),
        htmlBody: htmlBody,
      })
      .commit()

    if (!result) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating email template:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin capability for email templates management
    await requireCapability('content:write')

    const { id } = await params

    // Delete the email template from Sanity
    const result = await sanityWrite.delete(id)

    if (!result) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting email template:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
