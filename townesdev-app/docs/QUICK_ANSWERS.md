# Quick Answers to Your Questions

## 1. Where Did the Angel Investments Invoice Go?

**Answer:** It WAS created in Stripe but NOT in Sanity.

**Why?** The old invoice webhook handler only updates **existing** invoices, it doesn't create new ones for self-service signups.

**Fix:** ✅ Just implemented! Now when a client signs up:

1. Creates invoice in Sanity with Stripe invoice data
2. Marks as 'paid' immediately
3. Links to client record
4. Creates admin notification

**Test:** Sign up another test client and check Sanity Studio → Invoices

---

## 2. What Happens When Clients Don't Pay Their Monthly Bill?

**Stripe Automatic Retry System:**

1. **Day 1:** Payment fails (card declined, insufficient funds, etc.)
   - Stripe automatically retries
2. **Day 3:** First retry attempt
   - Stripe sends email to customer: "Please update your payment method"
3. **Day 5:** Second retry attempt
4. **Day 7:** Third and final retry attempt

5. **Day 8:** If still failing:
   - Stripe fires `customer.subscription.deleted` webhook
   - Our webhook sets `hasActiveSubscription: false`
   - Middleware blocks portal access
   - Client gets redirected to `/get-started?blocked=no_subscription`

**What You See:**

- Admin notification: "Subscription Cancelled - [Client Name]"
- Client status changes to Inactive
- Client can't access portal until they update payment

**Manual Override:**
You can manually reactivate in Sanity Studio if needed (family situation, etc.)

---

## 3. Why Does Client Management Show "No Plan" for Angel Investments?

**Problem:** The client record stores `productName` field but your admin table queries for `selectedPlan` (old system).

**Fix:** ✅ Already added `productName` and `stripeProductId` fields to schema!

**Display Logic:**

```
Show: productName || selectedPlan.name || "No Plan"
```

After dev server restarts, Angel Investments will show: **"TownesDev - Small Business - Starter"**

---

## 4. Manual Admin Onboarding - "How Would I Do This for Clients?"

**The Flow You Want:**

```
1. You create client in Sanity
   ↓
2. Select their service (Small Business Starter, Discord Bot, etc.)
   ↓
3. System generates Stripe invoice
   ↓
4. Email automatically sent to client with payment link
   ↓
5. Client clicks link → Pays via Stripe
   ↓
6. Webhook activates their account
   ↓
7. You get admin notification: "Payment Received - [Client Name]"
```

**Implementation:** See `docs/ADMIN_ONBOARDING_SYSTEM.md` for complete code

**Quick Setup:**

1. Create Sanity action: "Create Client & Send Invoice"
2. Build API endpoint: `/api/admin/invoices/create`
3. On invoice payment: Webhook activates subscription

**Estimated Time:** 4-6 hours to build

---

## 5. Family Discounts & Free Months - "How Do I Do It?"

### Family Discounts (20% off forever)

**In Stripe Dashboard (One-Time):**

```bash
Create Coupon → 20% off → Duration: Forever → Name: "Family Discount"
```

**When Onboarding Client:**

1. Check box: "Family Discount"
2. System applies coupon to subscription
3. Client pays 20% less every month forever

**Code:**

```typescript
await stripe.subscriptions.create({
  customer: customerId,
  items: [{ price: priceId }],
  coupon: process.env.STRIPE_COUPON_FAMILY_DISCOUNT,
})
```

---

### Free Months (e.g., 3 months free)

**In Stripe Dashboard (One-Time):**

```bash
Create Coupon → 100% off → Duration: Repeating → 3 months → Name: "3 Free Months"
```

**When Onboarding Client:**

1. Enter number: "3 free months"
2. Enter reason: "Holiday promotion"
3. System creates subscription schedule:
   - Months 1-3: 100% off (free)
   - Month 4+: Normal billing

**Code:**

```typescript
await stripe.subscriptionSchedules.create({
  customer: customerId,
  phases: [
    { items: [{ price: priceId }], coupon: '100OFF', iterations: 3 },
    { items: [{ price: priceId }], iterations: null },
  ],
})
```

---

### One-Time Discounts ($100 off setup, etc.)

**When Creating Invoice:**

```typescript
// Add setup fee ($1,200)
await stripe.invoiceItems.create({
  customer: customerId,
  invoice: invoiceId,
  price: setupPriceId, // $1,200
})

// Add discount (-$100)
await stripe.invoiceItems.create({
  customer: customerId,
  invoice: invoiceId,
  amount: -10000, // -$100.00
  description: 'Holiday promotion - $100 off setup',
})

// Client pays: $1,100 instead of $1,200
```

---

## 6. Admin Dashboard Notifications - "I need to see activity when I check in the morning"

**What's Built:**
✅ Admin notification system
✅ Notifications stored in Sanity
✅ Can view in Sanity Studio → Admin Notifications

**Notification Types:**

- 💰 New Signup - "Angel Investments signed up for Small Business Starter ($1,299)"
- ✅ Payment Success - "Invoice #12345 paid by client"
- ❌ Payment Failed - "Payment declined for recurring invoice"
- 🔄 Subscription Renewed - "Monthly billing successful"
- ⚠️ Subscription Cancelled - "Client subscription ended due to failed payment"

**Next Step:** Build dashboard widget to show on admin home page

**Location:** `/admin` → See "Recent Activity" card with last 10 notifications

---

## Priority Action Items

### Today (30 minutes):

1. ✅ Fix invoice creation - DONE
2. ✅ Add admin notifications - DONE
3. ✅ Add productName field - DONE
4. ⏳ Restart dev server to deploy schema
5. ⏳ Test another signup to verify invoice created

### This Week (4-6 hours):

1. Build admin onboarding UI in Sanity Studio
2. Create invoice generation API
3. Build admin notifications widget on dashboard
4. Create Stripe coupons for discounts
5. Test manual client onboarding flow

### Future Enhancements:

- Email digest: Daily summary of signups/payments
- Client portal: View/download invoices
- Automated dunning: Smart retry logic for failed payments
- Referral tracking: Who referred new clients

---

## What Changed in This Session

**Files Modified:**

1. `src/app/api/stripe/webhook/route.ts`
   - Added invoice creation for self-service signups
   - Added admin notification creation
   - Stores productName on client activation

2. `src/sanity/schemaTypes/index.ts`
   - Added `adminNotification` document type
   - Added `productName` and `stripeProductId` to client
   - Added `activatedAt` and `metadata` fields

**New Features:**

- 🔔 Admin notifications for all payment events
- 📄 Automatic invoice creation
- 🏷️ Product name tracking on clients
- ⚠️ Failed payment handling (already worked, just documented)

**Documentation:**

- `docs/ADMIN_ONBOARDING_SYSTEM.md` - Complete implementation guide
- `docs/LAUNCH_SUMMARY.md` - Original launch testing results

---

## Testing Next Signup

**Steps:**

1. Create another test account at `/get-started`
2. Use different email (e.g., test2@example.com)
3. Complete payment with test card
4. Check Sanity Studio:
   - Invoices → Should see new invoice (paid)
   - Admin Notifications → Should see "New Client Signup"
   - Clients → Should see product name (not "No Plan")

**Expected Result:**
✅ Invoice created in Sanity  
✅ Admin notification created  
✅ Client shows product name  
✅ Trial banner removed  
✅ Portal access granted
