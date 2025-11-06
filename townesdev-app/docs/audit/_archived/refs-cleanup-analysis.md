# Refs Folder Cleanup & Remaining Work Analysis

**Date**: November 4, 2025  
**Status**: Analysis Complete

## Files Deleted from Refs (Already Migrated)

✅ The following files have been migrated to `docs/` and can now be deleted:

1. ✅ `bot-platform-integration.md` → Migrated to `docs/architecture/bot-integration.md`
2. ✅ `RECENT_UPDATES.md` → Migrated to `docs/audit/updates-oct-2025.md`

## Files Remaining in Refs

1. **CODEBASE_OVERVIEW.md** - KEEP (documents separate Bot Platform codebase)
2. **ISSUES.md** - DELETE (all work tracked elsewhere, see analysis below)

---

## Issues Analysis: What's Actually Done vs. What Remains

### Summary of refs/ISSUES.md Claims

The `ISSUES.md` file claims **all issues #21-30 are COMPLETED** ✅, including:

- ✅ #22: DX (TypeScript strict, ESLint/Prettier)
- ✅ #23: DevOps (Vercel envs & secrets)
- ✅ #24: CI (typecheck/lint/build pipeline)
- ✅ #30: Portal/Admin invoices
- ✅ #34: Payments checkout endpoints
- ✅ #35: Payments webhooks & entitlements
- ✅ #44: Tests foundation
- ✅ #45: Performance bundle optimization
- ✅ #46: Portal assets/features/entitlements
- ✅ #21: Cache/revalidate strategy
- ✅ #22: A11y navigation and tables
- ✅ #26: Docs architecture + local setup
- ✅ #27: Docs client portal flow
- ✅ #28: CMS preview mode
- ✅ #29: Email inbound to incident creation
- ✅ #30: Reports monthly PDF generation

### Reality Check: What's Actually Implemented

Based on code inspection:

**CONFIRMED IMPLEMENTED**:

- ✅ Webhook infrastructure exists (`src/app/api/stripe/webhook/route.ts`)
- ✅ Duplicate suppression implemented (using `stripeEvent` docs with `createIfNotExists`)
- ✅ `onboardingStatus` and `hasActiveSubscription` fields exist in schema
- ✅ Webhook updates `hasActiveSubscription` based on subscription events
- ✅ Correlation IDs and structured logging present

**NOT FULLY IMPLEMENTED** (from checkpoint-review.md):

- ❌ **Onboarding → Checkout integration** - No evidence of wizard → checkout flow
- ❌ **Portal gating** - No layout.tsx gating logic found
- ❌ **Sanity Plan `appliesTo` field** - No evidence in ensure-onboarding-plans.mjs
- ❌ **Onboarding wizard Review step** - Unclear status
- ❌ **Analytics instrumentation** - Not found
- ❌ **Provisioning UX polish** - Unclear implementation

---

## Actual Remaining Work (Consolidated)

### Critical Priority

1. **Complete Onboarding → Checkout Integration**
   - Wire wizard selections to Stripe checkout
   - Store subscription/add-on refs in Sanity
   - Implement return path to Review step
   - **Location**: `src/app/(portal)/onboarding/**`

2. **Implement Portal Gating**
   - Add middleware/layout check for `onboardingStatus !== 'completed'`
   - Redirect incomplete clients to `/app/onboarding`
   - Show friendly blocker page for unpaid clients
   - **Location**: `src/app/(portal)/layout.tsx`

3. **Add `appliesTo` Field to Plans**
   - Update Sanity schema for Plan type
   - Modify `tools/sanity/ensure-onboarding-plans.mjs`
   - Backfill existing plan documents
   - **Files**: `src/sanity/schemaTypes/index.ts`, plan seed script

4. **Enhanced Webhook Logging & Runbook**
   - Already has structured logging ✅
   - Need: Ops runbook documentation
   - Need: Regression tests for duplicate deliveries
   - **Files**: `docs/guides/stripe-webhooks-runbook.md`, test suite

### High Priority

5. **Onboarding Review Step Polish**
   - Expand copy and status indicators
   - Show what will be provisioned
   - Display pricing breakdown
   - **Location**: `src/app/(portal)/onboarding/review/**`

6. **Provisioning UX Polish**
   - Replace `alert()` with toast components
   - Add loading states and retry guidance
   - Return preview URLs in UI
   - **Location**: `src/app/api/clients/provision/**`

7. **Analytics Instrumentation**
   - Define event schema (step viewed, abandonment, etc.)
   - Wire to analytics provider
   - Track funnel metrics
   - **Location**: Throughout onboarding flow

### Medium Priority

8. **Webhook Admin UI** (from docs/audit/repo-issues.md)
   - Build `/admin/webhooks` page
   - List/filter/retry functionality
   - Use existing `scripts/list-stuck-webhooks.mjs` logic

9. **Background Reconciliation Job**
   - Scheduled job to mark expired processing locks
   - Mark as failed or requeue
   - **Location**: New scheduled job/cron

10. **E2E Tests for Onboarding Flow**
    - Happy path test
    - Validation failures
    - Resume from progress
    - Provisioning success

11. **Documentation Consolidation**
    - Merge overlapping email docs (item #6 from repo-issues.md)
    - Clean up deprecated onboarding notes
    - Update all references to new structure

### Low Priority

12. **Docs Hosting & CI** (from repo-issues.md)
13. **UI/Brand Audit** (desktop + mobile)
14. **Email/Notifications Alignment**
15. **Admin Experience Enhancements**
16. **Security Review** (RBAC, dependencies)

---

## Action Items

### Immediate Actions

1. ✅ Delete `refs/ISSUES.md` - All work is now tracked in:
   - `docs/audit/checkpoint-review.md` (comprehensive current state)
   - `docs/audit/repo-issues.md` (specific actionable items)
   - This summary document

2. ✅ Keep `refs/CODEBASE_OVERVIEW.md` - Documents separate Bot Platform codebase

3. ✅ Update `docs/audit/checkpoint-review.md` with verification of what's actually done

### Next Sprint Focus

Based on criticality and dependencies:

**Week 1-2: Onboarding Flow Completion**

- Implement Onboarding → Checkout integration
- Add portal gating logic
- Polish Review step

**Week 3-4: Data & Infrastructure**

- Add `appliesTo` field to plans
- Webhook runbook documentation
- Provisioning UX improvements

**Week 5-6: Observability & Quality**

- Analytics instrumentation
- E2E test coverage
- Documentation consolidation

---

## Reconciliation Summary

The `refs/ISSUES.md` file is **overly optimistic** - while many foundational items are complete, the critical business logic for onboarding is not fully wired. The `docs/audit/checkpoint-review.md` provides a more accurate picture of remaining work.

**Recommendation**: Delete `refs/ISSUES.md` and use the checkpoint review as the authoritative task tracker going forward.

---

_Analysis completed: November 4, 2025_  
_Next review: After onboarding flow completion_
