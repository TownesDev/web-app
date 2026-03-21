# Self-Service Onboarding Implementation

> Status note: this document describes the self-service implementation lineage. For the current authoritative state and execution order, use [docs/development/current-resume-plan.md](./development/current-resume-plan.md).

**Status:** ✅ Implemented - Active Canonical Flow  
**Date:** November 17, 2025  
**Architecture:** "Option 1 Hard Gate" - No portal access until paid

## Overview

Implemented complete public self-service signup and onboarding flow at `/get-started` with "no portal until paid" approach. Clients can signup 24/7, but must complete Stripe payment before accessing `/app` portal.

## Files Created/Modified

### 1. Public Signup Page

**File:** `src/app/(public)/get-started/page.tsx` (775 lines)

- 6-step wizard: Account → Business → Brand → Market → Pricing → Review
- Client-side form validation with Zod schemas
- Password validation (8+ characters)
- Color picker for brand colors
- Font selector for brand fonts
- Market-based product filtering
- Price sorting (lowest first)
- Review step with summary before checkout

### 2. Enhanced Signup API

**File:** `src/app/api/auth/signup/route.ts` (Modified)

- Creates user account with hashed password
- Creates client record in Sanity
- Sets `hasActiveSubscription: false`
- Stores onboarding metadata (brand, market, business info)
- Creates session cookie after signup
- Returns user and client IDs

### 3. Session Helper Enhancement

**File:** `src/lib/session.ts` (Modified)

- Added `createSession()` function
- Generates JWT token
- Sets HTTP-only cookie with 7-day expiration
- Secure in production, lax SameSite policy

### 4. Stripe Checkout API

**File:** `src/app/api/stripe/checkout/route.ts` (Replaced old plan-based system)

- Accepts `productId` from frontend
- Gets client record by user ID
- Creates/retrieves Stripe customer
- Links customer to Sanity client record
- Fetches product prices (monthly + setup fee)
- Creates Checkout Session with both line items
- Returns checkout URL for redirect
- Metadata includes client ID, user ID, product ID

### 5. Middleware Enhancement

**File:** `middleware.ts` (Modified)

- Implements "hard gate" subscription check
- Blocks all `/app/*` routes if `hasActiveSubscription !== true`
- Redirects to `/get-started?blocked=no_subscription`
- Exempts `/app/onboarding/success` for post-checkout
- Simplified from complex onboarding status checks

## Flow Architecture

```
1. Client visits /get-started (unauthenticated)
   ↓
2. Fills 6-step form (Account → Business → Brand → Market → Pricing → Review)
   ↓
3. Clicks "Complete Setup" → POST /api/auth/signup
   - Creates user + client in Sanity
   - Sets hasActiveSubscription: false
   - Creates session cookie
   ↓
4. POST /api/stripe/checkout
   - Creates/gets Stripe customer
   - Creates Checkout Session
   - Returns checkout URL
   ↓
5. Redirects to Stripe Checkout
   - Client enters payment info
   - Completes purchase
   ↓
6. Stripe redirects to /app/onboarding/success?session_id=...
   ↓
7. Stripe webhook receives `checkout.session.completed`
   - Sets `hasActiveSubscription: true`
   - Sends welcome email
   ↓
8. Client can now access /app/* portal
```

## Environment Variables Required

Add to `.env.local`:

```env
# Existing (should already be set)
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_READ_TOKEN=your-read-token
SANITY_AUTH_TOKEN=your-write-token
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=sk_test_...
NODE_ENV=development

# NEW - Required for checkout success/cancel URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Testing Checklist

- [ ] Visit `http://localhost:3000/get-started`
- [ ] Fill Account step (name, email, password 8+ chars)
- [ ] Fill Business step (business name, elevator pitch)
- [ ] Fill Brand step (logo URL, color, font)
- [ ] Select Market (Small Business/Discord Bot/Musician)
- [ ] Select Plan (see filtered products, verify sorting)
- [ ] Review summary page
- [ ] Click "Complete Setup"
- [ ] Verify account created in Sanity Studio
- [ ] Verify redirect to Stripe Checkout
- [ ] Use test card: 4242 4242 4242 4242
- [ ] Complete test payment
- [ ] Verify redirect to success page
- [ ] Verify `hasActiveSubscription` flips to true after webhook activation
- [ ] Test middleware: Visit `/app` → should redirect to /get-started

## Pending Work

### Current Follow-Through

- Expand automated test coverage for the active self-service path
- Reconcile stale supporting docs so they stop describing webhook activation as pending
- Verify the deployed Vercel environment matches the implemented checkout and webhook behavior

### Flow Boundary

1. Public onboarding remains at `/get-started`
2. `/app/onboarding` is no longer the primary client flow
3. Admin and manual onboarding work should be treated separately from self-service onboarding

## Key Decisions

1. **Hard Gate vs Trial Mode:** No trial mode - nothing functional without subscription
2. **Public vs Portal Onboarding:** Public at `/get-started`, admin override at `/app/onboarding`
3. **Stripe as Source of Truth:** All pricing from Stripe API, no Sanity sync
4. **Session After Signup:** Immediate session creation eliminates extra login step
5. **Metadata Storage:** Onboarding preferences stored in client record for future use

## Technical Notes

- Password validation: 8 characters minimum (updated from 6)
- Client role assigned by default for self-signups
- Stripe customer created on-demand during checkout
- Customer ID stored in Sanity for future transactions
- Checkout includes both monthly + setup fee as separate line items
- Metadata on subscription for webhook processing
- Middleware uses Edge-compatible jose library for JWT

## Error Handling

- Invalid email format → 400 error
- Password too short → 400 error
- Email already exists → 409 error
- Missing product ID → 400 error
- Inactive product → 400 error
- No monthly price found → 400 error
- Client not found → 404 error
- No subscription → Redirect to /get-started

## Next Steps

1. **Add NEXT_PUBLIC_APP_URL to .env.local**
2. **Test complete signup flow** (see checklist above)
3. **Test webhook with Stripe CLI:** `stripe listen --forward-to localhost:3000/api/stripe/webhook`
4. **Verify portal access** after webhook sets `hasActiveSubscription = true`
5. **Deploy to staging** for end-to-end test with real Stripe
6. **Keep deprecated onboarding docs from becoming active planning sources**

## Comparison: Old vs New

### Old System

- 7-step wizard with conditional logic
- 2155 lines of complex state management
- Onboarding status field with multiple states
- Trial banner with confusing messaging
- Hardcoded fallback pricing data
- Plan-based Stripe integration

### New System

- 6-step public signup (775 lines)
- 5-step admin onboarding (686 lines)
- Simple boolean: hasActiveSubscription
- No trial mode - clarity over complexity
- Stripe API as single source of truth
- Product-based Stripe integration
- "No portal until paid" approach

## Success Metrics

- ✅ Signup API enhanced with client creation
- ✅ Session creation after signup
- ✅ Checkout API replaced with product-based system
- ✅ Middleware implements hard gate
- ✅ Public signup page complete with 6 steps
- ✅ All TypeScript compilation passes
- ✅ Zero lint errors
- ✅ Webhook handler implemented
- ⏳ End-to-end testing and broader regression coverage pending

**Estimated Time Saved:** 2155 lines → 1461 lines (694 lines / 32% reduction)  
**Complexity Reduction:** 7 steps → 5/6 steps, conditional logic eliminated  
**Clarity Improvement:** Trial confusion → "No portal until paid"
