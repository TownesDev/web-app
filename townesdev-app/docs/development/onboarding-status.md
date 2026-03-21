# Onboarding Implementation Status

**Last Updated**: March 20, 2026  
**Purpose**: Current-state onboarding status aligned to the canonical restart plan  
**Canonical Reference**: [Current Resume Plan](./current-resume-plan.md)

---

## Current Direction

TownesDev now treats public self-service onboarding at `/get-started` as the canonical client onboarding entry.

The legacy portal wizard at `/app/onboarding` is retired as a primary flow and remains only as a compatibility redirect. Historical notes in older onboarding docs are preserved for context, but they are no longer the execution target.

## Implementation Status Overview

| Component                  | Status      | Notes                                                              |
| -------------------------- | ----------- | ------------------------------------------------------------------ |
| Public self-service wizard | ✅ Complete | `/get-started` is the active onboarding flow                       |
| Validation                 | ✅ Complete | Client-side validation is in place                                 |
| Signup + session creation  | ✅ Complete | User and client creation happen before checkout                    |
| Checkout integration       | ✅ Complete | Stripe checkout is wired from the active onboarding flow           |
| Webhook activation         | ✅ Complete | Subscription activation is handled in the Stripe webhook           |
| Portal gating              | ✅ Complete | Middleware blocks portal access without active subscription        |
| Success flow               | ✅ Complete | Success page verifies checkout session and routes users forward    |
| Provisioning API           | ✅ Complete | Provisioning endpoints exist                                       |
| Provisioning UX            | ⚠️ Partial  | Further polish and clearer post-provision feedback still needed    |
| Review UX                  | ⚠️ Partial  | Active flow works, but summary and next-step messaging can improve |
| Test coverage              | ⚠️ Partial  | Core gates are green; broader test trust is the next active task   |

## What Changed Since Earlier Docs

- Checkout integration is no longer pending.
- Portal gating is no longer pending.
- Webhook activation is no longer pending.
- The portal onboarding wizard is no longer the primary implementation path.

## Current Gaps

### 1. Provisioning UX Polish

- Improve loading, retry, and status feedback around provisioning flows.
- Surface clearer preview and next-step links after successful payment and setup.

### 2. Review and Success Copy

- Tighten the active onboarding review step so users have clearer expectations about billing, delivery, and next steps.
- Ensure post-payment screens consistently route users into the dashboard and support flow.

### 3. Test Confidence

- Expand coverage around the active self-service onboarding, webhook processing, and portal gating flows.
- Retire or replace tests that still target deprecated onboarding behavior.

## Rules for Future Updates

- Treat [current-resume-plan.md](./current-resume-plan.md) as authoritative when this file conflicts with older launch or audit docs.
- Update this file only when the active onboarding behavior changes.
- Record all major onboarding decisions and validation outcomes in [development-log.md](./development-log.md).

---

## ✅ What's Implemented

### 1. Onboarding Wizard UI

**Location**: `src/app/(portal)/app/onboarding/**`

**Completed Steps**:

- ✅ Basics: Client name, email, contact
- ✅ Brand: Colors, fonts, logo upload
- ✅ Services: Multi-select (web/discord/both)
- ✅ Web: Pages, domain, features
- ✅ Discord: Server ID, features, moderation
- ✅ Review: Summary display

**Features**:

- Step-by-step navigation with prev/next buttons
- Client-side validation on each step
- Progress indicator
- Responsive design

### 2. Validation Layer

**Implemented**:

- Client-side form validation using Zod schemas
- Required field checks
- Email format validation
- URL format validation (domains)
- Discord server ID validation

### 3. Provisioning API

**Location**: `src/app/api/clients/provision/route.ts`

**Capabilities**:

- Creates `websiteProject` documents in Sanity
- Creates `discordProject` documents
- Seeds default pages for websites
- Links projects to client
- Idempotent project creation

**Status**: Fully functional

### 4. Sanity Schema Support

**Implemented Fields**:

- `client.onboardingStatus` (not_started | in_progress | completed)
- `client.hasActiveSubscription` (boolean)
- `client.selectedPlans` (plan references)
- `client.selectedAddons` (plan references)
- `websiteProject` schema with status field
- `discordProject` schema

---

## ⚠️ What's Partial

### 1. State Persistence

**Current**: Wizard state lives in React state only

**Missing**:

- No Sanity writes during wizard progress
- Refreshing page loses all progress
- Can't resume onboarding later

**Needed**:

- Save wizard progress to `client.onboardingData` after each step
- Load saved state on wizard mount
- Enable resume functionality

### 2. Provisioning UX

**Current**: Uses basic `alert()` for feedback

**Missing**:

- Loading states during API calls
- Toast notifications for success/error
- Preview URL display after provisioning
- Retry guidance on failures

**Needed**:

- Replace `alert()` with proper UI components
- Show spinner during provisioning
- Display preview links in success state

### 3. Review Step

**Current**: Shows basic summary of selections

**Missing**:

- Pricing breakdown
- What gets provisioned (clear expectations)
- Billing timeline
- Next steps after payment

**Needed**:

- Detailed itemized pricing
- "What happens next" section
- CTA to checkout or skip for now

---

## ❌ What's Not Started

### 1. Onboarding → Checkout Integration 🔴 CRITICAL

**Current State**: No connection between wizard and Stripe

**What's Missing**:

1. Checkout button in Review step
2. Building Stripe line items from wizard selections
3. Passing metadata to Stripe session
4. Return URL handling back to wizard
5. Webhook updating `client.selectedPlans/selectedAddons`

**Implementation Plan**:

```typescript
// In Review step:
const handleCheckout = async () => {
  const response = await fetch('/api/checkout/onboarding', {
    method: 'POST',
    body: JSON.stringify({
      basePlan: selections.basePlan,
      addons: selections.addons,
      oneTimeServices: selections.oneTime,
      returnUrl: '/app/onboarding/success',
    }),
  })
  const { url } = await response.json()
  window.location.href = url
}
```

**Files to Create/Modify**:

- `src/app/api/checkout/onboarding/route.ts` (new)
- `src/app/(portal)/app/onboarding/success/page.tsx` (new)
- Update webhook to handle onboarding-specific metadata

### 2. Portal Gating 🔴 CRITICAL

**Current State**: Portal accessible even without completed onboarding

**What's Missing**:

1. Layout.tsx check for `onboardingStatus`
2. Redirect logic to `/app/onboarding` if incomplete
3. Friendly blocker page with resume CTA
4. Exception for `/app/onboarding` routes

**Implementation Plan**:

```typescript
// In src/app/(portal)/layout.tsx:
const session = await getSession();
const client = await getClientByUserId(session.user.id);

if (client.onboardingStatus !== 'completed') {
  // Allow onboarding routes
  if (!pathname.startsWith('/app/onboarding')) {
    redirect('/app/onboarding');
  }
}

if (!client.hasActiveSubscription) {
  // Show "payment required" blocker
  if (!pathname.startsWith('/app/onboarding') && !pathname.startsWith('/app/billing')) {
    return <PaymentRequiredBlocker />;
  }
}
```

### 3. Plan `appliesTo` Field 🔴 CRITICAL

**Current State**: Plans don't explicitly declare web vs discord

**What's Missing**:

1. `appliesTo` field in Plan schema
2. Seed script updates to set values
3. Backfill existing plans
4. UI filtering based on `appliesTo`

**Files to Modify**:

- `src/sanity/schemaTypes/index.ts` (add field)
- `tools/sanity/ensure-onboarding-plans.mjs` (set values)
- `src/app/(portal)/app/onboarding/**` (filter logic)

### 4. Analytics Instrumentation

**Current State**: No tracking of onboarding funnel

**What's Missing**:

- Event tracking (step viewed, step completed, abandoned, checkout started)
- Conversion funnel metrics
- Drop-off analysis

**Needed**:

- Analytics provider integration (Plausible, PostHog, or custom)
- Event schema definition
- Track points in each step

---

## Priority Order for Completion

### Sprint 1: Critical Path (1 week)

1. **Checkout Integration** (2-3 days)
   - Create `/api/checkout/onboarding` endpoint
   - Wire Review step to checkout
   - Handle return flow
   - Update webhook to set `selectedPlans/selectedAddons`

2. **Portal Gating** (1 day)
   - Add layout.tsx checks
   - Create blocker page
   - Test redirect logic

3. **Plan `appliesTo`** (1 day)
   - Add schema field
   - Update seed script
   - Backfill existing plans

### Sprint 2: Polish & UX (1 week)

4. **State Persistence** (2 days)
   - Save wizard progress to Sanity
   - Load saved state on mount
   - Enable resume

5. **Provisioning UX** (1 day)
   - Replace alerts with toasts
   - Add loading states
   - Show preview URLs

6. **Review Step Polish** (1 day)
   - Add pricing breakdown
   - Add "what happens next" section
   - Improve copy

### Sprint 3: Observability (3-5 days)

7. **Analytics** (2-3 days)
   - Integrate analytics provider
   - Define event schema
   - Add tracking to each step

8. **E2E Tests** (2 days)
   - Happy path test
   - Validation failure test
   - Resume from progress test

---

## Testing Checklist

### Manual Testing

- [ ] Complete wizard from start to finish
- [ ] Abandon and resume at each step
- [ ] Submit with invalid data (validation)
- [ ] Complete checkout flow
- [ ] Verify provisioning creates projects
- [ ] Check portal gating works
- [ ] Test payment failure scenario
- [ ] Test subscription cancellation

### Automated Testing

- [ ] Unit tests for validation schemas
- [ ] API route tests for provisioning
- [ ] E2E test for happy path
- [ ] E2E test for incomplete onboarding redirect
- [ ] Webhook tests for onboarding metadata

---

## Dependencies & Blockers

| Dependency               | Status          | Impact                             |
| ------------------------ | --------------- | ---------------------------------- |
| Stripe Product/Price IDs | ⚠️ Partial      | Need to set in Sanity plans        |
| Sanity Plan `appliesTo`  | ❌ Missing      | Can't filter plans by service type |
| Email templates          | ✅ Complete     | Welcome/provisioning emails ready  |
| Provisioning API         | ✅ Complete     | Backend ready                      |
| Portal layout            | ❌ Needs update | Gating logic missing               |

---

## Questions & Decisions Needed

1. **State Persistence**: Save after every step or only on explicit "Save & Exit"?
2. **Payment Timing**: Collect payment before or after provisioning?
3. **Free Trial**: Offer trial period before first payment?
4. **Partial Onboarding**: Allow portal access with incomplete onboarding?
5. **Webhook Retry**: How to handle provisioning failures during webhook?

---

## Success Metrics

**Definition of Done**:

- [ ] User can complete entire onboarding flow without leaving
- [ ] Payment collected before portal access granted
- [ ] Projects automatically provisioned after successful payment
- [ ] User can resume incomplete onboarding
- [ ] Portal access properly gated by onboarding status
- [ ] Analytics tracking all funnel steps
- [ ] E2E tests pass for all scenarios

---

**Next Review**: After Sprint 1 completion  
**Maintained By**: Primary developer + AI agents  
**Related Work**: See [Checkpoint Review](../audit/checkpoint-review.md) for broader platform tasks
