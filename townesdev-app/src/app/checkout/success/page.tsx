import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from '../../../lib/session'
import { getClientByUserId, getPlanById, stripe } from '../../../lib/stripe'
import { sanityWrite } from '../../../lib/client'
import Stripe from 'stripe'

interface SuccessPageProps {
  searchParams: Promise<{
    session_id?: string
  }>
}

async function verifySession(sessionId: string) {
  try {
    // Verify the session with Stripe
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/checkout/verify?session_id=${sessionId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to verify session')
    }

    const { session } = await response.json()
    return session
  } catch (error) {
    console.error('Session verification error:', error)
    return null
  }
}

async function ensureRetainerCreated(session: Stripe.Checkout.Session) {
  try {
    console.log('Ensuring retainer created for session:', session.id)
    console.log('Session metadata:', session.metadata)

    // Get authenticated user
    const userSession = await getSession()
    if (!userSession) {
      console.error('No authenticated user session')
      return
    }

    // Get client
    const client = await getClientByUserId(userSession.id)
    if (!client) {
      console.error('Client not found')
      return
    }

    console.log('Found client:', client._id)

    // Get plan details
    const planId = session.metadata?.planId
    if (!planId) {
      console.error('No planId in session metadata')
      return
    }

    console.log('Processing plan:', planId)

    const plan = await getPlanById(planId)
    if (!plan) {
      console.error('Plan not found:', planId)
      return
    }

    console.log('Found plan:', plan.name)

    // Get subscription details from Stripe
    const subscriptionId = session.subscription as string
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const sub = subscription as unknown as Stripe.Subscription & {
      current_period_start: number
      current_period_end: number
    }

    // For new subscriptions, use created date as fallback
    const periodStart = sub.current_period_start || subscription.created
    const periodEnd =
      sub.current_period_end || subscription.created + 30 * 24 * 60 * 60 // 30 days from created

    if (!periodStart || !periodEnd) {
      console.error('Cannot determine subscription period dates')
      return
    }

    // Create retainer
    const retainerData = {
      _type: 'retainer',
      client: { _type: 'reference', _ref: client._id },
      plan: { _type: 'reference', _ref: planId },
      stripeSubId: subscription.id,
      status:
        subscription.status === 'active'
          ? 'active'
          : subscription.status === 'canceled'
            ? 'canceled'
            : 'past_due',
      periodStart: new Date(periodStart * 1000).toISOString(),
      periodEnd: new Date(periodEnd * 1000).toISOString(),
      hoursIncluded: plan.hoursIncluded || 0,
      hoursUsed: 0,
      ...(session.metadata?.assetId && {
        asset: { _type: 'reference', _ref: session.metadata.assetId },
      }),
    }

    await sanityWrite.mutate([
      {
        create: retainerData,
      },
      {
        patch: {
          id: client._id,
          set: {
            selectedPlan: { _type: 'reference', _ref: planId },
          },
        },
      },
    ])

    console.log('Retainer created for subscription:', subscription.id)

    // Create invoice for the payment
    await createPaymentInvoice(client, plan, subscription)
  } catch (error) {
    console.error('Error ensuring retainer creation:', error)
  }
}

async function createPaymentInvoice(
  client: { _id: string },
  plan: { name: string },
  subscription: Stripe.Subscription
) {
  try {
    console.log('Creating invoice for payment')

    // Get the latest invoice from Stripe for this subscription
    const invoices = await stripe.invoices.list({
      subscription: subscription.id,
      limit: 1,
    })

    const stripeInvoice = invoices.data[0]
    if (!stripeInvoice) {
      console.log('No Stripe invoice found yet, skipping invoice creation')
      return
    }

    // Check if invoice already exists
    const existingInvoice = await sanityWrite.fetch(
      `*[_type=="invoice" && stripeInvoiceId==$stripeInvoiceId][0]`,
      { stripeInvoiceId: stripeInvoice.id }
    )

    if (existingInvoice) {
      console.log('Invoice already exists:', stripeInvoice.id)
      return
    }

    // Create line items from the Stripe invoice
    const lineItems = stripeInvoice.lines.data.map(
      (line: Stripe.InvoiceLineItem) => ({
        description: line.description || `${plan.name} Subscription`,
        quantity: line.quantity || 1,
        unitPrice: line.amount / 100 / (line.quantity || 1), // Convert from cents
        amount: line.amount / 100, // Convert from cents
      })
    )

    // Calculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
    const taxAmount = 0 // TODO: Implement proper tax calculation from Stripe
    const totalAmount = stripeInvoice.amount_due / 100 // Convert from cents

    // Generate unique invoice number using Stripe invoice ID for auditability
    // Format: INV-YYYYMMDD-XXXXXX (where XXXXXX is last 6 chars of Stripe invoice ID)
    const issueDate = new Date(stripeInvoice.created * 1000)
    const dateStr = issueDate.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
    const stripeSuffix = stripeInvoice.id.slice(-6).toUpperCase() // Last 6 chars of Stripe invoice ID

    const invoiceNumber = `INV-${dateStr}-${stripeSuffix}`

    // Create invoice in Sanity
    const invoiceData = {
      _type: 'invoice',
      invoiceNumber,
      client: { _type: 'reference', _ref: client._id },
      issueDate: new Date(stripeInvoice.created * 1000).toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now for subscription invoices
      currency: stripeInvoice.currency.toUpperCase(),
      subtotal,
      taxRate: 0, // TODO: Get tax rate from Stripe invoice
      taxAmount,
      totalAmount,
      status: stripeInvoice.status === 'paid' ? 'paid' : 'pending',
      lineItems,
      stripeInvoiceId: stripeInvoice.id,
      stripeSubscriptionId: subscription.id,
      notes: `Payment for ${plan.name} subscription`,
      terms: 'Payment processed via Stripe. Subscription will auto-renew.',
      createdBy: 'Stripe Integration',
      lastModified: new Date().toISOString(),
    }

    await sanityWrite.mutate([
      {
        create: invoiceData,
      },
    ])

    console.log('Invoice created:', invoiceNumber)
  } catch (error) {
    console.error('Error creating payment invoice:', error)
  }
}

async function SuccessContent({ sessionId }: { sessionId: string }) {
  const session = await verifySession(sessionId)

  if (!session) {
    redirect('/plans?error=verification_failed')
  }

  // Ensure retainer is created (fallback for webhook failures)
  await ensureRetainerCreated(session)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>

        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your subscription has been activated and
          you should receive a confirmation email shortly.
        </p>

        <div className="space-y-3">
          <a
            href="/app"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go to Client Portal
          </a>

          <a
            href="/plans"
            className="block w-full border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Plans
          </a>
        </div>
      </div>
    </div>
  )
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams
  const sessionId = params.session_id

  if (!sessionId) {
    redirect('/plans?error=missing_session')
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <SuccessContent sessionId={sessionId} />
    </Suspense>
  )
}
