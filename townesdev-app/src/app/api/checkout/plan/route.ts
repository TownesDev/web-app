import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { runQuery } from '@/lib/client'
import { getSession } from '@/lib/session'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Checkout plan request received')

    // Check authentication
    const userSession = await getSession()
    console.log(
      '🔍 User session:',
      userSession ? { id: userSession.id, email: userSession.email } : 'null'
    )

    if (!userSession) {
      console.log('❌ No user session found')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Find client associated with this user
    const client = await runQuery(
      `*[_type=="client" && user._ref==$userId][0]{
        _id, name, email
      }`,
      { userId: userSession.id }
    )
    console.log(
      '🔍 Client found:',
      client ? { id: client._id, name: client.name } : 'null'
    )

    if (!client) {
      console.log('❌ No client found for user:', userSession.id)
      return NextResponse.json(
        { error: 'No client account found for this user' },
        { status: 400 }
      )
    }

    const { planId, addOnIds } = await request.json()
    console.log('🔍 Plan ID received:', planId, 'addOnIds:', addOnIds)

    if (!planId) {
      console.log('❌ Missing planId')
      return NextResponse.json({ error: 'Missing planId' }, { status: 400 })
    }

    // Get base plan details
    const plan = await runQuery(
      `*[_type=="plan" && _id==$planId][0]{
        _id, name, price, description, category, interval, stripePriceId
      }`,
      { planId }
    )
    console.log(
      '🔍 Plan found:',
      plan ? { id: plan._id, name: plan.name, price: plan.price } : 'null'
    )

    if (!plan) {
      console.log('❌ Plan not found:', planId)
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    if (plan.category && plan.category !== 'base') {
      console.log('❌ Selected plan is not a base plan:', plan.category)
      return NextResponse.json(
        { error: 'Selected plan is not a base plan' },
        { status: 400 }
      )
    }

    // Build line items: base + optional add-ons
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []

    // Helper to fallback to price_data if no Stripe Price ID
    const buildPriceData = (
      name: string,
      description: string | undefined,
      price: string,
      interval?: string
    ): Stripe.Checkout.SessionCreateParams.LineItem => {
      const match = typeof price === 'string' ? price.match(/(\d+)/) : null
      if (!match?.[1]) {
        throw new Error(`Invalid price format for ${name}`)
      }
      const unit_amount = parseInt(match[1], 10) * 100
      return {
        price_data: {
          currency: 'usd',
          product_data: { name, description },
          unit_amount,
          recurring: {
            interval:
              (interval as 'day' | 'week' | 'month' | 'year') || 'month',
          },
        },
        quantity: 1,
      }
    }

    if (plan.stripePriceId) {
      line_items.push({ price: plan.stripePriceId, quantity: 1 })
    } else {
      line_items.push(
        buildPriceData(
          `${plan.name} Retainer`,
          plan.description,
          plan.price,
          plan.interval || 'month'
        )
      )
    }

    // Add-ons
    let addOns: Array<{
      _id: string
      name: string
      price: string
      description?: string
      category?: string
      interval?: string
      stripePriceId?: string
    }> = []
    if (Array.isArray(addOnIds) && addOnIds.length > 0) {
      addOns = await runQuery(
        `*[_type=="plan" && _id in $ids]{ _id, name, price, description, category, interval, stripePriceId }`,
        { ids: addOnIds }
      )
      const invalid = addOns.find((p) => p.category !== 'addon')
      if (invalid) {
        return NextResponse.json(
          { error: 'One or more selected add-ons are invalid' },
          { status: 400 }
        )
      }
      for (const a of addOns) {
        if (a.stripePriceId)
          line_items.push({ price: a.stripePriceId, quantity: 1 })
        else
          line_items.push(
            buildPriceData(
              a.name,
              a.description,
              a.price,
              a.interval || 'month'
            )
          )
      }
    }

    // Create Stripe Checkout Session for subscription
    console.log('🔍 Creating Stripe checkout session...')
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/app?welcome=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/plans?canceled=true`,
      metadata: {
        planId: plan._id,
        addOnIds:
          Array.isArray(addOnIds) && addOnIds.length ? addOnIds.join(',') : '',
        clientId: client._id,
      },
    })

    console.log('✅ Checkout session created successfully:', session.id)
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('❌ Checkout plan error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error,
    })

    // Handle specific Stripe errors
    if (error instanceof Error && 'type' in error) {
      const stripeError = error as Error & { type?: string; message: string }
      if (stripeError.type === 'StripeCardError') {
        console.error('❌ Stripe card error:', stripeError.message)
        return NextResponse.json(
          { error: 'Card was declined' },
          { status: 400 }
        )
      }
      if (stripeError.type === 'StripeRateLimitError') {
        console.error('❌ Stripe rate limit error')
        return NextResponse.json(
          { error: 'Too many requests, please try again later' },
          { status: 429 }
        )
      }
      if (stripeError.type === 'StripeInvalidRequestError') {
        console.error('❌ Stripe invalid request:', stripeError.message)
        return NextResponse.json(
          { error: 'Invalid payment request' },
          { status: 400 }
        )
      }
      if (stripeError.type === 'StripeAPIError') {
        console.error('❌ Stripe API error:', stripeError.message)
        return NextResponse.json(
          { error: 'Payment service temporarily unavailable' },
          { status: 503 }
        )
      }
      if (stripeError.type === 'StripeConnectionError') {
        console.error('❌ Stripe connection error:', stripeError.message)
        return NextResponse.json(
          { error: 'Payment service connection failed' },
          { status: 503 }
        )
      }
      if (stripeError.type === 'StripeAuthenticationError') {
        console.error(
          '❌ Stripe authentication error - check STRIPE_SECRET_KEY'
        )
        return NextResponse.json(
          { error: 'Payment service configuration error' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
