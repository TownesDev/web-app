import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { runQuery } from '@/lib/client'
import { getSession } from '@/lib/session'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
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

    const { planId } = await request.json()
    console.log('🔍 Plan ID received:', planId)

    if (!planId) {
      console.log('❌ Missing planId')
      return NextResponse.json({ error: 'Missing planId' }, { status: 400 })
    }

    // Get plan details
    const plan = await runQuery(
      `*[_type=="plan" && _id==$planId][0]{
        _id, name, price, description
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

    // Parse price - extract the first sequence of digits from any format
    console.log(
      '🔍 Raw plan.price:',
      JSON.stringify(plan.price),
      'length:',
      plan.price.length,
      'type:',
      typeof plan.price
    )
    const priceMatch = plan.price.match(/(\d+)/)
    console.log('🔍 Price parsing:', {
      price: plan.price,
      match: priceMatch,
      extracted: priceMatch?.[1],
    })

    if (!priceMatch || !priceMatch[1]) {
      console.log(
        '❌ Invalid plan price format:',
        plan.price,
        '- expected to contain a number like "300", "$300", "$300/month", or "300/month"'
      )
      return NextResponse.json(
        {
          error:
            'Invalid plan price format - expected to contain a number like "300", "$300", "$300/month", or "300/month"',
        },
        { status: 400 }
      )
    }

    const priceInCents = parseInt(priceMatch[1]) * 100
    console.log('🔍 Price conversion:', {
      priceString: priceMatch[1],
      priceInCents,
    })

    // Create Stripe Checkout Session for subscription
    console.log('🔍 Creating Stripe checkout session...')
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${plan.name} Retainer`,
              description: plan.description,
            },
            unit_amount: priceInCents,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/app?welcome=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/plans?canceled=true`,
      metadata: {
        planId: plan._id,
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
