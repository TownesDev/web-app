import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { runQuery } from '@/lib/client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

export async function POST(request: NextRequest) {
  try {
    const { planId } = await request.json()

    if (!planId) {
      return NextResponse.json({ error: 'Missing planId' }, { status: 400 })
    }

    // Get plan details
    const plan = await runQuery(
      `*[_type=="plan" && _id==$planId][0]{
        _id, name, price, description
      }`,
      { planId }
    )

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Parse price (assuming format like "$150/month")
    const priceMatch = plan.price.match(/\$(\d+)/)
    if (!priceMatch) {
      return NextResponse.json(
        { error: 'Invalid plan price format' },
        { status: 400 }
      )
    }

    const priceInCents = parseInt(priceMatch[1]) * 100

    // Create Stripe Checkout Session for subscription
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
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/plans?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/plans?canceled=true`,
      metadata: {
        planId: plan._id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout plan error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
