# Admin Onboarding & Discount System - Implementation Guide

**Date:** November 17, 2025  
**Purpose:** Enable admin to manually onboard clients and send payment invoices, plus handle family discounts and free months

## Current System Status

### ✅ What Works Now

1. **Self-Service Onboarding** (`/get-started`)
   - Client signs up and pays immediately
   - Automatic activation after payment
   - Invoice created automatically
   - Admin notification sent

2. **Failed Payment Handling**
   - Stripe automatically retries failed payments (3 attempts over 2 weeks)
   - After final failure: `customer.subscription.deleted` webhook fires
   - Webhook sets `hasActiveSubscription: false`
   - Middleware blocks portal access
   - Client gets email from Stripe to update payment method

3. **Admin Notifications** (NEW)
   - Stored in Sanity as `adminNotification` documents
   - Types: new_signup, payment_success, payment_failed, invoice_generated
   - View at `/admin/studio` → Admin Notifications
   - Shows unread count, sortable by date

## Required: Admin Manual Onboarding System

### Use Case

**"I want to onboard clients manually and generate their invoice they have to pay for me to get started"**

### Flow Architecture

```
1. Admin creates client in Sanity Studio
   - Fills in client details (name, email, business info)
   - Selects service/product
   - System generates invoice (status: 'pending')
   ↓
2. System creates Stripe invoice
   - Draft invoice in Stripe with line items
   - Sends payment link to client via email
   ↓
3. Client receives email with payment link
   - Clicks link → Stripe hosted invoice page
   - Enters payment info
   ↓
4. Client pays invoice
   - Stripe webhook: invoice.paid
   - Webhook activates subscription
   - Sets hasActiveSubscription: true
   - Admin gets notification
```

### Implementation Steps

#### Step 1: Create Admin Onboarding Action in Sanity

**File:** `src/sanity/actions/adminOnboarding.ts`

```typescript
import { defineAction } from 'sanity'
import { FiUserPlus } from 'react-icons/fi'

export const createAndInvoiceClient = defineAction({
  name: 'createAndInvoiceClient',
  title: 'Create Client & Send Invoice',
  icon: FiUserPlus,
  async onHandle(context) {
    // Open modal with form:
    // - Client details (name, email, business name)
    // - Product selection (dropdown of Stripe products)
    // - Custom pricing override (optional)
    // - Payment terms (net 15, net 30, etc.)
    // On submit:
    // 1. Create client in Sanity (hasActiveSubscription: false)
    // 2. Call /api/admin/invoices/create
    // 3. Show success + invoice link
  },
})
```

#### Step 2: Create Invoice Generation API

**File:** `src/app/api/admin/invoices/create/route.ts`

```typescript
import { stripe } from '@/lib/stripe'
import { sanityWrite } from '@/lib/client'
import { requireAuth } from '@/lib/session'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  // Require admin role
  const session = await requireAuth()
  if (session.role !== 'admin' && session.role !== 'staff') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const {
    clientId,
    productId,
    customPrice, // Optional: override Stripe price
    dueDate,
    paymentTerms,
  } = await request.json()

  // Get client
  const client = await runQuery(
    `*[_type=="client" && _id==$id][0]{ name, email, stripeCustomerId }`,
    { id: clientId }
  )

  // Create/get Stripe customer
  let customerId = client.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: client.email,
      name: client.name,
      metadata: { sanityClientId: clientId },
    })
    customerId = customer.id

    await sanityWrite
      .patch(clientId)
      .set({
        stripeCustomerId: customerId,
      })
      .commit()
  }

  // Get product prices
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
  })

  const monthlyPrice = prices.data.find(
    (p) => p.recurring?.interval === 'month'
  )
  const setupPrice = prices.data.find((p) => p.type === 'one_time')

  // Create Stripe invoice (not finalized yet)
  const invoice = await stripe.invoices.create({
    customer: customerId,
    collection_method: 'send_invoice',
    days_until_due: paymentTerms === 'net_30' ? 30 : 15,
    auto_advance: false, // Manual finalization
    metadata: {
      sanityClientId: clientId,
      productId,
      source: 'admin_manual',
    },
  })

  // Add line items
  if (customPrice) {
    // Custom pricing: create one-time price
    const customPriceObj = await stripe.prices.create({
      unit_amount: Math.round(customPrice * 100),
      currency: 'usd',
      product: productId,
    })

    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      price: customPriceObj.id,
    })
  } else {
    // Standard pricing
    if (setupPrice) {
      await stripe.invoiceItems.create({
        customer: customerId,
        invoice: invoice.id,
        price: setupPrice.id,
      })
    }
    if (monthlyPrice) {
      await stripe.invoiceItems.create({
        customer: customerId,
        invoice: invoice.id,
        price: monthlyPrice.id,
      })
    }
  }

  // Finalize invoice
  const finalInvoice = await stripe.invoices.finalizeInvoice(invoice.id)

  // Send invoice email
  await stripe.invoices.sendInvoice(invoice.id)

  // Create invoice in Sanity
  const sanityInvoiceId = randomUUID()
  await sanityWrite.create({
    _id: sanityInvoiceId,
    _type: 'invoice',
    client: { _type: 'reference', _ref: clientId },
    invoiceNumber: finalInvoice.number,
    status: 'pending',
    amount: finalInvoice.amount_due / 100,
    currency: finalInvoice.currency.toUpperCase(),
    dueDate: new Date(finalInvoice.due_date! * 1000).toISOString(),
    stripeInvoiceId: finalInvoice.id,
    description: 'Manual admin invoice',
  })

  // Create admin notification
  await sanityWrite.create({
    _type: 'adminNotification',
    type: 'invoice_generated',
    title: `Invoice Sent: ${client.name}`,
    message: `Invoice ${finalInvoice.number} sent to ${client.email}`,
    client: { _type: 'reference', _ref: clientId },
    invoice: { _type: 'reference', _ref: sanityInvoiceId },
    read: false,
    createdAt: new Date().toISOString(),
  })

  return NextResponse.json({
    success: true,
    invoiceId: sanityInvoiceId,
    stripeInvoiceUrl: finalInvoice.hosted_invoice_url,
  })
}
```

#### Step 3: Handle Invoice Payment Webhook

Update existing `handleInvoicePaymentSucceeded` to activate subscriptions:

```typescript
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // ... existing code ...

  // Check if this is a manual admin invoice
  if (
    invoice.metadata?.source === 'admin_manual' &&
    invoice.metadata?.sanityClientId
  ) {
    const clientId = invoice.metadata.sanityClientId

    // Create subscription if monthly price included
    if (invoice.subscription) {
      await sanityWrite
        .patch(clientId)
        .set({
          hasActiveSubscription: true,
          stripeSubscriptionId: invoice.subscription,
          activatedAt: new Date().toISOString(),
        })
        .commit()
    }

    // Create notification
    await sanityWrite.create({
      _type: 'adminNotification',
      type: 'payment_success',
      title: `Payment Received`,
      message: `Invoice ${invoice.number} paid by client`,
      client: { _type: 'reference', _ref: clientId },
      read: false,
      createdAt: new Date().toISOString(),
    })
  }
}
```

## Discounts & Free Months System

### Family Discounts

**Approach:** Use Stripe Customer metadata + Coupons

```typescript
// Create family discount coupon (one-time setup)
const familyCoupon = await stripe.coupons.create({
  percent_off: 20, // 20% off for family
  duration: 'forever',
  name: 'Family Discount',
  metadata: { type: 'family' },
})

// Apply to client's subscription
await stripe.subscriptions.update(subscriptionId, {
  coupon: familyCoupon.id,
})

// Or apply to invoice before finalizing
await stripe.invoices.update(invoiceId, {
  discounts: [
    {
      coupon: familyCoupon.id,
    },
  ],
})
```

**In Admin UI:**

1. Add checkbox in client form: "Family Discount (20% off)"
2. When creating invoice/subscription, apply coupon if checked
3. Store in Sanity: `client.discountType: 'family'`

### Free Subscription Months

**Approach:** Use Stripe Subscription Schedules

```typescript
// Give 3 free months, then resume billing
const schedule = await stripe.subscriptionSchedules.create({
  customer: customerId,
  start_date: 'now',
  end_behavior: 'release',
  phases: [
    {
      // Phase 1: Free for 3 months
      items: [
        {
          price: monthlyPriceId,
          quantity: 1,
        },
      ],
      coupon: '100OFF', // 100% off coupon (create once)
      iterations: 3, // 3 billing cycles
    },
    {
      // Phase 2: Normal billing resumes
      items: [
        {
          price: monthlyPriceId,
          quantity: 1,
        },
      ],
      iterations: null, // Continue forever
    },
  ],
})

// Update client
await sanityWrite
  .patch(clientId)
  .set({
    hasActiveSubscription: true,
    stripeSubscriptionId: schedule.subscription,
    freeMonthsRemaining: 3,
    freeMonthsReason: '3 months free marketing promo',
  })
  .commit()
```

**In Admin UI:**

1. Add field: "Free Months" (number input)
2. Add field: "Free Months Reason" (text)
3. When creating subscription, use schedule if free months > 0

### One-Time Discount (e.g., $100 off setup)

```typescript
// Apply fixed amount discount to setup fee
await stripe.invoiceItems.create({
  customer: customerId,
  invoice: invoiceId,
  amount: -10000, // -$100.00
  currency: 'usd',
  description: 'Setup fee discount - Holiday promotion',
})
```

## Admin Dashboard Enhancements

### 1. Notifications Widget

**File:** `src/app/(admin)/admin/components/NotificationsWidget.tsx`

```typescript
'use client'

export function NotificationsWidget() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    // Fetch unread notifications
    fetch('/api/admin/notifications?read=false&limit=10')
      .then(res => res.json())
      .then(data => setNotifications(data.notifications))
  }, [])

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-bold mb-4">Recent Activity</h3>
      {notifications.map(n => (
        <div key={n._id} className="mb-3 p-2 border-l-4 border-blue-500">
          <div className="font-medium">{n.title}</div>
          <div className="text-sm text-gray-600">{n.message}</div>
          <div className="text-xs text-gray-400">{formatTime(n.createdAt)}</div>
        </div>
      ))}
    </div>
  )
}
```

### 2. Update Client Management Table

Show `productName` instead of "No Plan":

**File:** Update client list query to include `productName` field

```typescript
const qAllClients = `
  *[_type=="client"] | order(name asc) {
    _id,
    name,
    email,
    status,
    productName,
    hasActiveSubscription,
    selectedPlan-> { name }
  }
`
```

Display: `{client.productName || client.selectedPlan?.name || 'No Plan'}`

## Testing Checklist

### Self-Service Flow

- [x] Client signs up at /get-started
- [x] Payment processed
- [x] Invoice created in Sanity
- [x] Admin notification created
- [ ] Check notification appears in Studio

### Manual Admin Flow

- [ ] Admin creates client in Studio
- [ ] Admin triggers "Create Client & Send Invoice"
- [ ] Invoice sent to client email
- [ ] Client pays via Stripe hosted page
- [ ] Webhook activates subscription
- [ ] Admin notification shows payment received

### Discounts

- [ ] Create family discount coupon
- [ ] Apply to client subscription
- [ ] Verify discounted price in invoice
- [ ] Free months schedule created
- [ ] Billing resumes after free period

### Failed Payments

- [x] Stripe retries payment automatically
- [x] After 3 failures: subscription.deleted webhook
- [x] hasActiveSubscription set to false
- [x] Portal access blocked

## Next Steps

1. **Immediate (Today):**
   - Test admin notifications in Studio
   - Create family discount coupon in Stripe Dashboard
   - Create 100% off coupon for free months

2. **This Week:**
   - Build admin onboarding action in Sanity
   - Create invoice generation API
   - Build admin notifications widget
   - Update client table to show productName

3. **Nice-to-Have:**
   - Email digest of daily signups/payments
   - Webhook event viewer in admin
   - Automated retry logic for failed invoices
   - Client portal: view/download invoices

## Stripe Dashboard Setup

### Create Coupons (One-Time)

```bash
# Family discount (20% off forever)
stripe coupons create \
  --percent-off 20 \
  --duration forever \
  --name "Family Discount"

# Free months (100% off)
stripe coupons create \
  --percent-off 100 \
  --duration repeating \
  --duration-in-months 3 \
  --name "3 Months Free"
```

Save coupon IDs in `.env.local`:

```env
STRIPE_COUPON_FAMILY_DISCOUNT=<coupon_id>
STRIPE_COUPON_FREE_MONTHS=<coupon_id>
```

## Summary

**What's Built:**

- ✅ Self-service signup with automatic invoicing
- ✅ Failed payment handling (auto-disable)
- ✅ Admin notification system
- ✅ Invoice creation in Sanity

**What's Needed:**

- 🔨 Admin manual onboarding UI
- 🔨 Invoice generation API for admins
- 🔨 Discount application system
- 🔨 Free months scheduling
- 🔨 Admin notifications widget

**Estimated Time:** 6-8 hours for complete implementation
