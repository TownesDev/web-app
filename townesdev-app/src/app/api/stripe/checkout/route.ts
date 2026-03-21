import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { runQuery, sanityWrite } from '@/lib/client'
import { stripe } from '@/lib/stripe'

const qClientByUserId = `*[_type == "client" && user._ref == $userId][0]{
  _id,
  name,
  email,
  stripeCustomerId
}`

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const session = await requireAuth()

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Get client record
    const client = await runQuery(qClientByUserId, { userId: session.id })

    if (!client) {
      return NextResponse.json(
        { error: 'Client record not found' },
        { status: 404 }
      )
    }

    // Get the Stripe product and prices
    const product = await stripe.products.retrieve(productId, {
      expand: ['default_price'],
    })

    if (!product.active) {
      return NextResponse.json(
        { error: 'Product is not active' },
        { status: 400 }
      )
    }

    // Get all prices for this product to find monthly and setup fees
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
    })

    const monthlyPrice = prices.data.find(
      (p) => p.recurring?.interval === 'month'
    )
    const setupPrice = prices.data.find((p) => p.type === 'one_time')

    if (!monthlyPrice) {
      return NextResponse.json(
        { error: 'No monthly price found for product' },
        { status: 400 }
      )
    }

    // Create or get Stripe customer
    let customerId = client.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: client.email,
        name: client.name,
        metadata: {
          sanityClientId: client._id,
          sanityUserId: session.id,
        },
      })
      customerId = customer.id

      // Update client record with Stripe customer ID
      await sanityWrite
        .patch(client._id)
        .set({
          stripeCustomerId: customerId,
        })
        .commit()
    }

    // Build line items
    const lineItems = [
      {
        price: monthlyPrice.id,
        quantity: 1,
      },
    ]

    // Add setup fee if exists
    if (setupPrice) {
      lineItems.push({
        price: setupPrice.id,
        quantity: 1,
      })
    }

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/app/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/get-started?canceled=true`,
      metadata: {
        sanityClientId: client._id,
        sanityUserId: session.id,
        productId: productId,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      payment_method_types: ['card'],
      subscription_data: {
        metadata: {
          sanityClientId: client._id,
          sanityUserId: session.id,
        },
      },
    })

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error: unknown) {
    console.error('Checkout session creation error:', error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
