# Payments & Stripe Integration

Last updated: 2025-11-10

## Overview

TownesDev uses Stripe for subscription billing, one-time feature purchases, and payment processing. The integration follows best practices for webhook idempotency, event deduplication, and atomic state management.

## Architecture Components

### Stripe Client Configuration

**Location**: `src/lib/stripe.ts`

```typescript
// Stripe API v2025-09-30.clover
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
```

### Product Catalog Structure

**Location**: `src/types/stripe.ts`

Three product catalogs with monthly subscriptions and optional setup fees:

#### Small Business Plans

- **Starter**: Product ID + Monthly Price + Setup Price
- **Professional**: Product ID + Monthly Price + Setup Price
- **Premium**: Product ID + Monthly Price + Setup Price

#### Discord Bot Plans

- **Community**: Product ID + Monthly Price
- **Guild**: Product ID + Monthly Price
- **Enterprise**: Product ID + Monthly Price

#### Musician Plans

- **Solo Artist**: Product ID + Monthly Price + Setup Price
- **Band Pro**: Product ID + Monthly Price + Setup Price
- **Label Management**: Product ID + Monthly Price + Setup Price

All product/price IDs stored as environment variables (25+ env keys).

## Checkout Flow

### Creating Checkout Sessions

**Endpoint**: `POST /api/stripe/checkout`

**Request Body**:

```json
{
  "planId": "plan-uuid",
  "assetId": "optional-asset-uuid"
}
```

**Process**:

1. Authenticate user via session
2. Fetch client record by `userId`
3. Validate plan has `stripePriceId`
4. Get or create Stripe customer
5. Create Stripe Checkout Session with metadata
6. Return checkout URL

**Metadata Stored**:

```typescript
{
  planId: string,
  clientId: string,
  userId: string,
  assetId?: string,    // Optional
  addOnIds?: string    // Comma-separated list
}
```

**Session Configuration**:

- Mode: `subscription` (for plans)
- Payment methods: `card`
- Promotion codes: Enabled
- Success URL: `/checkout/success?session_id={CHECKOUT_SESSION_ID}`
- Cancel URL: `/app/plans?canceled=true`

### Customer Management

**Function**: `getOrCreateCustomer(client)`

- Returns existing `stripeCustomerId` if present
- Creates new Stripe customer if missing
- Updates client document with `stripeCustomerId`
- Stores `clientId` in Stripe customer metadata

**Idempotency**: Uses existing customer ID to prevent duplicates

## Webhook Processing

### Webhook Endpoint

**Route**: `POST /api/stripe/webhook`

**Security**: Signature verification using `STRIPE_WEBHOOK_SECRET`

```typescript
const event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
```

### Event Lifecycle

#### 1. Event Reception & Verification

```text
Request → Signature Verification → Event Construction → Processing
```

- Extract raw body and `stripe-signature` header
- Verify webhook signature
- Parse Stripe event object
- Generate `correlationId` for tracing

#### 2. Duplicate Suppression Strategy

**Mechanism**: Atomic record creation using deterministic IDs

```typescript
const stripeEventDocId = `stripeEvent.${event.id}`
```

**Deduplication Logic**:

1. **Atomic Create**: Use `createIfNotExists` mutation
   - Document ID: `stripeEvent.${event.id}`
   - Fields: `eventId`, `eventType`, `status`, `correlationId`, `lockExpiresAt`
   - Initial status: `processing`

2. **Lock Acquisition**:
   - Each worker sets `processingLockOwner` = its `correlationId`
   - Lock duration: 15 minutes (`lockExpiresAt`)
   - Lock prevents concurrent processing

3. **Short-Circuit Conditions**:
   - Status is `success` → Event already processed
   - Status is `failed` → Event already attempted
   - Status is `processing` AND lock is valid AND owned by another worker → Duplicate delivery

4. **Lock Reclamation**:
   - If lock expired, claim it by updating `processingLockOwner` and `lockExpiresAt`
   - If lock claim fails, short-circuit (another worker claimed it)

**Result**: At-most-once processing semantics even with duplicate webhook deliveries

#### 3. Event Processing

**Supported Event Types**:

| Event Type                      | Handler Function                                        | Purpose                    |
| ------------------------------- | ------------------------------------------------------- | -------------------------- |
| `checkout.session.completed`    | `handleFeaturePurchase()` or `handlePlanSubscription()` | Process payment completion |
| `customer.subscription.created` | `handleSubscriptionCreated()`                           | New subscription setup     |
| `invoice.payment_succeeded`     | `handleInvoicePaymentSucceeded()`                       | Update invoice status      |
| `customer.subscription.updated` | `handleSubscriptionUpdated()`                           | Sync subscription changes  |
| `customer.subscription.deleted` | `handleSubscriptionDeleted()`                           | Handle cancellation        |

#### 4. Success/Failure Recording

**On Success**:

```typescript
await sanityWrite.mutate([
  {
    patch: {
      id: stripeEventDocId,
      set: {
        status: 'success',
        processedAt: new Date().toISOString(),
        outcome: event.type,
      },
    },
  },
])
```

**On Failure**:

```typescript
await sanityWrite.mutate([
  {
    patch: {
      id: stripeEventDocId,
      set: {
        status: 'failed',
        processedAt: new Date().toISOString(),
        outcome: String(error),
      },
    },
  },
])
```

### Failure Handling

#### Network/Transient Errors

- Stripe automatically retries webhook delivery (72 hours)
- Exponential backoff between retries
- Our deduplication prevents duplicate processing

#### Processing Errors

- Event marked as `failed` with error message in `outcome`
- Correlation ID logged for debugging
- Structured logging captures full error context

#### Stuck Processing Detection

- Lock expires after 15 minutes
- Subsequent webhook delivery can reclaim expired lock
- Prevents indefinite "stuck" state

#### Manual Intervention

Query stripeEvent documents to investigate failures:

```groq
*[_type=="stripeEvent" && status=="failed"]{
  eventId, eventType, outcome, processedAt, correlationId
}
```

## Event Handlers

### Checkout Session Completed

**Two Paths**:

1. **Feature Purchase** (if `metadata.featureId` present):
   - Create `entitlement` document linking client, asset, and feature
   - Store `stripePaymentIntentId` for reference
   - Idempotent: Checks for existing entitlement first

2. **Plan Subscription** (if `metadata.planId` present):
   - Retrieve subscription from Stripe
   - Create `retainer` document for base plan
   - Process add-ons if `metadata.addOnIds` present
   - Create feature entitlements based on plan
   - Auto-provision projects (bump status to `ready`)
   - Update client: `hasActiveSubscription`, `selectedPlan`
   - Generate invoice via `ensureInvoiceForSubscription()`
   - Send welcome email

### Subscription Created

- Logs subscription creation
- Placeholder for future welcome email logic

### Invoice Payment Succeeded

**Idempotent Invoice Update**:

```typescript
// Only update if not already marked 'paid'
if (existingInvoice && existingInvoice.status !== 'paid') {
  // Update to 'paid'
}
```

Uses `metadata.invoiceId` to link Stripe invoice to Sanity invoice document.

### Subscription Updated

**Syncs Changes**:

- Update `hasActiveSubscription` on client
- Update retainer `status`: `active`, `canceled`, or `past_due`
- Update `periodStart` and `periodEnd` from subscription
- Idempotent: Only updates if status changed

### Subscription Deleted

**Cancellation Handling**:

- Set `hasActiveSubscription` = false on client
- Retainer status updated via subscription.updated event

## Plan-Feature Mapping

### CMS-Driven Mapping

**Preferred**: `planFeatureMapping` documents in Sanity

```groq
*[_type=="planFeatureMapping"]{
  plan->{ _id },
  feature->{ _id, name, key, assetType }
}
```

### Heuristic Fallback

**Function**: `mapPlanToFeature(planId)`

When CMS mapping absent, infers feature from plan ID patterns.

### Entitlement Creation

1. Determine feature for plan (CMS or heuristic)
2. Ensure feature exists via `ensureFeature()`
3. Ensure client asset exists via `ensureClientAsset()`
4. Create entitlement if not exists (idempotent check)

**Entitlement Document**:

```typescript
{
  _type: 'entitlement',
  client: { _ref: clientId },
  asset: { _ref: assetId },
  feature: { _ref: featureId },
  status: 'active',
  activatedAt: ISO datetime
}
```

## Retainer Management

### Retainer Creation

**Triggered By**: Plan subscription via webhook

**Document Structure**:

```typescript
{
  _type: 'retainer',
  client: { _ref: clientId },
  plan: { _ref: planId },
  stripeSubId: subscription.id,
  status: 'active' | 'canceled' | 'past_due',
  periodStart: ISO datetime,
  periodEnd: ISO datetime,
  hoursIncluded: number,
  hoursUsed: number,
  asset?: { _ref: assetId }
}
```

**Idempotency**: Query for existing retainer with matching `stripeSubId` + `planId`

### Add-On Retainers

If `metadata.addOnIds` present:

1. Parse comma-separated plan IDs
2. For each add-on plan:
   - Check if retainer exists for this subscription + plan
   - Create retainer if missing
   - Create feature entitlements for add-on

## Invoice Generation

### Auto-Invoice Creation

**Function**: `ensureInvoiceForSubscription()`

**Triggered By**: Successful subscription webhook

**Process**:

1. Fetch latest Stripe invoice for subscription
2. Check if Sanity invoice exists (`stripeInvoiceId`)
3. If not, generate invoice document:
   - Invoice number: `INV-{YYYYMMDD}-{last6chars}`
   - Line items from Stripe invoice
   - Currency, subtotal, tax, total
   - Status: `paid` or `pending`
   - Store `stripeInvoiceId` and `stripeSubscriptionId`

**Idempotency**: Check by `stripeInvoiceId` before creating

## Customer Portal

### Billing Portal Access

**Endpoint**: `POST /api/stripe/portal`

**Process**:

1. Authenticate user
2. Fetch client with `stripeCustomerId`
3. Create Stripe billing portal session
4. Return portal URL

**Portal Features**:

- Update payment methods
- View invoices and receipts
- Manage subscriptions
- Cancel subscriptions
- Update billing information

**Return URL**: `{BASE_URL}/app/plans`

## Email Notifications

### Welcome Email

**Triggered By**: Successful plan subscription

**Template**: `Welcome Activation` (from `emailTemplate` in Sanity)

**Variables**:

```typescript
{
  clientName: string,
  planName: string,
  startDate: formatted date,
  slaStartTime: formatted datetime,
  maintenanceWindow: string
}
```

**Non-Fatal**: Email failures logged but don't fail webhook

## Environment Variables

### Required Secrets

```bash
STRIPE_SECRET_KEY                 # API key for Stripe operations
STRIPE_WEBHOOK_SECRET             # Webhook signature verification
NEXT_PUBLIC_BASE_URL              # App base URL for redirects
```

### Product/Price IDs (25+ variables)

```bash
# Small Business
STRIPE_PRODUCT_SMALL_BUSINESS_STARTER_ID
STRIPE_PRICE_SMALL_BUSINESS_STARTER_SETUP_ID
STRIPE_PRICE_SMALL_BUSINESS_STARTER_MONTHLY_ID
# ... (22 more for Professional, Premium, Discord, Musician plans)
```

## Data Models

### Sanity Schema: stripeEvent

```typescript
{
  name: 'stripeEvent',
  fields: [
    { name: 'eventId', type: 'string' },           // evt_xxx
    { name: 'eventType', type: 'string' },         // Event type
    { name: 'sessionId', type: 'string' },         // cs_xxx (optional)
    { name: 'status', type: 'string' },            // processing|success|failed
    { name: 'correlationId', type: 'string' },     // UUID for tracing
    { name: 'createdAt', type: 'datetime' },
    { name: 'processedAt', type: 'datetime' },
    { name: 'outcome', type: 'string' },           // Result description
    { name: 'raw', type: 'text' },                 // Full JSON payload
    { name: 'processingLockOwner', type: 'string', hidden: true },
    { name: 'lockExpiresAt', type: 'datetime', hidden: true }
  ]
}
```

### Client Document Updates

```typescript
{
  stripeCustomerId: string,
  hasActiveSubscription: boolean,
  selectedPlan: { _ref: planId },
  selectedAddons: [{ _ref: planId }]
}
```

## Testing

### Unit Tests

**Location**: `src/app/api/stripe/__tests__/webhook.test.ts`

- Duplicate suppression verification
- Processing record creation
- Lock mechanism validation

### Regression Tests

**Location**: `src/app/api/stripe/__tests__/webhook.regression.test.ts`

- Concurrent webhook delivery handling
- Expired lock reclamation
- Stuck processing recovery

### Test Coverage

- Webhook signature verification
- Event deduplication logic
- Idempotent entitlement creation
- Retainer creation for subscriptions
- Invoice generation

## Structured Logging

### Log Events

| Event                                   | Description                    |
| --------------------------------------- | ------------------------------ |
| `webhook.received`                      | Initial request reception      |
| `webhook.verified`                      | Signature verification success |
| `webhook.signature_verification_failed` | Invalid signature              |
| `webhook.duplicate_suppressed`          | Duplicate event detected       |
| `webhook.event_recorded`                | New event persisted            |
| `webhook.lock_claimed`                  | Expired lock reclaimed         |
| `webhook.lock_claim_failed`             | Failed to claim lock           |
| `webhook.processing_completed`          | Event processed successfully   |
| `webhook.processing_error`              | Processing failure             |

### Log Context

All logs include:

- `correlationId`: UUID for request tracing
- `eventId`: Stripe event ID
- `eventType`: Stripe event type
- `docId`: stripeEvent document ID

## Best Practices

### ✅ DO

- Use webhook metadata for passing context (planId, clientId, etc.)
- Implement idempotency checks before creating records
- Log all critical operations with structured data
- Verify webhook signatures before processing
- Handle expired locks gracefully
- Mark events as success/failed for auditability
- Use deterministic document IDs for atomic operations

### ❌ AVOID

- Processing webhooks without signature verification
- Creating duplicate entitlements/retainers
- Failing webhooks on non-critical errors (like email)
- Storing sensitive data in webhook metadata
- Ignoring lock expiration times
- Processing same event twice

## Troubleshooting

### Common Issues

#### 1. Duplicate Entitlements

**Symptom**: Multiple entitlements for same client/asset/feature

**Fix**: Webhook processed multiple times - check `stripeEvent` docs for duplicates

#### 2. Stuck Processing

**Symptom**: Event status stuck at `processing`

**Fix**: Lock expired - Stripe will retry, or manually update status

#### 3. Missing Customer ID

**Symptom**: Cannot create portal session

**Fix**: Client never went through checkout - create customer via API

#### 4. Webhook Signature Errors

**Symptom**: `webhook.signature_verification_failed` logs

**Fix**: Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard

### Debugging Queries

```groq
// Find failed events
*[_type=="stripeEvent" && status=="failed"] | order(createdAt desc)

// Find processing events (potential stuck)
*[_type=="stripeEvent" && status=="processing" && lockExpiresAt < now()]

// Find duplicate events
*[_type=="stripeEvent"] | group(eventId)

// Find client's subscriptions
*[_type=="retainer" && client._ref==$clientId]
```

## Future Enhancements

### Planned Features

- [ ] Automatic project provisioning on subscription (partially implemented)
- [ ] Usage-based billing for overages
- [ ] Multi-currency support
- [ ] Annual subscription discounts
- [ ] Metered billing for API usage
- [ ] Dunning management for failed payments
- [ ] Subscription upgrade/downgrade flows

### TODO Comments in Code

```typescript
// TODO(provisioning): Auto-trigger project provisioning after successful
// subscription instead of relying on manual onboarding action
```

## Related Documentation

- `src/lib/stripe.ts` - Core Stripe utilities
- `src/types/stripe.ts` - Type definitions and env keys
- `src/app/api/stripe/webhook/route.ts` - Webhook handler (1097 lines)
- `src/app/api/stripe/checkout/route.ts` - Checkout session creation
- `src/app/api/stripe/portal/route.ts` - Billing portal access
- `src/lib/invoices.ts` - Invoice generation logic
- `src/lib/entitlements.ts` - Feature entitlement helpers
- `src/sanity/schemaTypes/index.ts` - stripeEvent schema
- `docs/onboarding-plan.md` - Billing-related epics
