# Agent PR Integration Issues - Nov 17, 2025

## PR #3: Trial Banner Not Showing

**Problem:** Zamboni Green (Client role) sees no trial banner at `/app`

**Root Cause:**
The trial banner logic checks `client.hasActiveSubscription === false` in `src/app/(portal)/app/layout.tsx:22`

```typescript
{client.hasActiveSubscription === false && <TrialBanner />}
```

**Diagnosis Needed:**

1. Check Zamboni Green's `hasActiveSubscription` field in Sanity Studio
2. Field is defined in schema at line 311-319 with `initialValue: false`
3. If Zamboni had old plans before deletion, field may still be `true`
4. Field should be `false` to show banner, but might be `null` or `undefined`

**Fix Options:**

- **Option A (Quick):** Manually set `hasActiveSubscription: false` for Zamboni in Sanity Studio
- **Option B (Proper):** Update condition to handle truthy/falsy instead of strict equality:
  ```typescript
  {!client.hasActiveSubscription && <TrialBanner />}
  ```

**To Verify:**

1. Open Sanity Studio: `http://localhost:3333`
2. Find Zamboni Green in Clients
3. Check "Has Active Subscription" checkbox value
4. If checked (true), uncheck it
5. Refresh `/app` to see banner appear

---

## PR #2: Wrong Pricing Data in Onboarding

**Problem:** Onboarding shows hardcoded fallback plans instead of Sanity data

**Root Cause:**
The onboarding wizard uses **FALLBACK** pricing (lines 62-241) instead of Sanity Plans:

### What's Showing (Hardcoded Fallback):

```typescript
FALLBACK_PLAN_CATALOG = {
  base: [
    { name: 'Base Retainer', price: '$150/mo' },
    { name: 'Base Retainer Plus', price: '$275/mo' },
  ],
  addon: [
    { name: 'Web-App Starter', price: '$25/mo' }, // ❌ Not in your Sanity
    { name: 'Web-App Pro', price: '$75/mo' }, // ❌ Not in your Sanity
    { name: 'Web-App Plus', price: '$150/mo' }, // ❌ Not in your Sanity
    { name: 'Discord Bronze', price: '$15/mo' }, // ❌ Not in your Sanity
    { name: 'Discord Silver', price: '$45/mo' }, // ❌ Not in your Sanity
    { name: 'Discord Gold', price: '$95/mo' }, // ❌ Not in your Sanity
  ],
  oneTime: [
    { name: 'Web-App Setup', price: '$500' },
    { name: 'Discord Bot Setup', price: '$300' },
  ],
}
```

### What You Actually Have (Stripe Products):

Per `docs/stripe-products.md`:

- **Small Business**: Starter ($200/mo), Pro ($400/mo), Enterprise ($800/mo) + $500 setup
- **Discord Bot**: Starter ($150/mo), Pro ($300/mo), Enterprise ($600/mo) + $300 setup
- **Musician**: Starter ($100/mo), Pro ($200/mo), Enterprise ($400/mo) + $200 setup

**Why It's Failing:**

1. Agent created fallback data that doesn't match your Stripe products
2. Code fetches from Sanity via `qPlans` query (line 6)
3. But if Sanity returns empty, falls back to hardcoded data (line 246-252)
4. Your Sanity "Services" section likely doesn't match the agent's `plan` schema expectations

**The Disconnect:**

- You have **9 Stripe products** (3 markets × 3 tiers) configured in environment
- You have **"Services"** in Sanity (your custom content type)
- Agent expects **"plans"** schema type in Sanity (doesn't exist or empty)
- Agent provides fallback prices that don't match either

---

## Required Actions

### Immediate (Testing Blocker):

1. **Fix Trial Banner:**

   ```bash
   # Option 1: Update Zamboni in Sanity Studio
   # Go to Clients > Zamboni Green > Set hasActiveSubscription = false

   # Option 2: Fix the condition (safer)
   # Edit src/app/(portal)/app/layout.tsx line 22
   ```

2. **Fix Pricing Data:**
   ```bash
   # DECISION NEEDED: Which pricing source is truth?
   # A) Stripe products (from .env.local) - 9 products configured
   # B) Sanity Services (your custom schema) - unknown state
   # C) New Sanity Plans schema (doesn't exist yet)
   ```

### Strategic (Before Launch):

**You need to consolidate your pricing model:**

**Option 1: Stripe as Source of Truth** (Recommended)

- Remove hardcoded fallback plans
- Fetch Stripe products directly via Stripe API
- Display real product names, prices, features from Stripe
- Benefits: Single source of truth, matches checkout flow

**Option 2: Sanity as Source of Truth**

- Create proper `plan` schema in Sanity matching agent's expectations
- Populate with your 9 Stripe products
- Link via `stripeProductId` and `stripePriceId` fields
- Benefits: CMS-managed, easier for non-technical updates

**Option 3: Hybrid Approach**

- Store product metadata in Sanity (descriptions, features, marketing copy)
- Store pricing in Stripe (prices, intervals, IDs)
- Join data at runtime
- Benefits: Best of both worlds, separation of concerns

---

## Testing Checklist After Fixes

- [ ] Zamboni sees yellow trial banner at `/app`
- [ ] Trial banner links to `/pricing`
- [ ] Onboarding pricing step shows YOUR 9 products
- [ ] Product names match Stripe dashboard
- [ ] Prices match: Small Business Starter = $200/mo (not $25/mo)
- [ ] "Get Started" attempts checkout (will fail until Issue #75 done)
- [ ] All 3 categories shown: Small Business, Discord Bot, Musician

---

## Related Files

- `src/app/(portal)/app/layout.tsx` - Trial banner condition
- `src/app/(portal)/app/onboarding/page.tsx` - Pricing display (2165 lines!)
- `src/lib/auth.ts` - Client fetch with hasActiveSubscription
- `src/sanity/schemaTypes/index.ts` - Client schema with hasActiveSubscription field
- `docs/stripe-products.md` - Your actual Stripe configuration
- `.env.local` - 25+ Stripe product/price IDs
