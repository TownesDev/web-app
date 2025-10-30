import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getClientByUserId, stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get client by user ID
    const client = await getClientByUserId(session.id)
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Check if client has a Stripe customer ID
    if (!client.stripeCustomerId) {
      console.error('Client has no stripeCustomerId:', client)
      return NextResponse.json(
        { error: 'No billing account found' },
        { status: 404 }
      )
    }

    // Create billing portal session
    // Build a safe return URL with a runtime fallback to the request origin
    const origin =
      req.headers.get('origin') || new URL(req.url).origin || undefined
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || origin
    const returnUrl = baseUrl
      ? `${baseUrl.replace(/\/$/, '')}/app/plans`
      : undefined

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: client.stripeCustomerId,
      ...(returnUrl ? { return_url: returnUrl } : {}),
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Billing portal creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    )
  }
}
