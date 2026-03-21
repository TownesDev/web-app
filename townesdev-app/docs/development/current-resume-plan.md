# TownesDev Platform - Current Resume Plan

## Purpose

This document is the canonical restart point for active engineering work. It supersedes fragmented sprint notes and older launch assumptions when they conflict with the actual repository state.

## Canonical Direction

### Product Flow to Keep

- Public self-service onboarding at `/get-started`
- Stripe product-driven pricing and checkout
- Webhook-based subscription activation
- Hard portal access gate based on active subscription

### Flows to Retire

- The legacy portal onboarding wizard at `/app/onboarding` as a primary user flow
- Dual-source pricing assumptions where fallback plans diverge from Stripe truth
- Any planning artifact that still assumes checkout, webhook activation, or gating are unimplemented

## Current State Summary

### Confirmed Working or Implemented

- Stripe checkout API exists
- Stripe webhook handler exists
- Public self-service signup flow exists
- Payment success flow exists
- Portal subscription gating exists
- `npm audit` is currently clean

### Confirmed Broken or Incomplete

- Legacy portal onboarding file is mid-refactor and breaks TypeScript validation
- Lint configuration includes generated output and CommonJS utility scripts that should not block the app quality gate
- Test suite is not yet the active trusted release gate and needs structured triage

## Quality Gate Order for Every Session

1. `npm run typecheck`
2. `npm run lint`
3. `npm run build`
4. `npm test`
5. `npm run test:e2e` when the scope affects user flows or integration boundaries

If a session intentionally does not reach all five gates, the deviation must be logged in the development log with explicit blockers.

## Current Session Scope

### Phase 1: Re-establish Engineering Discipline

- Create a development log
- Create this canonical resume plan
- Stop linting generated docs-site output
- Stop allowing dead legacy onboarding code to break typecheck

### Phase 2: Stabilize the Active Flow

- Verify `/get-started` remains the canonical onboarding entry
- Verify checkout and webhook activation behavior still matches the intended product flow
- Verify portal gating and success page redirects align with the retired-flow decision

### Phase 3: Restore Trusted Validation

- Get typecheck green
- Get lint green
- Get build green
- Run the full test suite and categorize failures into:
  - obsolete tests tied to retired flows
  - broken tests tied to current code regressions
  - flaky or environment-dependent tests

## Canonical Backlog

### Immediate

- Retire legacy `/app/onboarding` implementation cleanly
- Align redirects to modern onboarding and dashboard behavior
- Make lint deterministic on Windows and scoped to maintained source

### Near-Term

- Remove or refactor fallback pricing that conflicts with Stripe products
- Unify dashboard and admin subscription presentation around `productName` and Stripe-linked data
- Clean and rewrite stale planning docs that are still pointing at pre-implementation work

### Release Readiness

- Confirm the deployed Vercel target is behind the current implemented Stripe and onboarding work
- Ship only after typecheck, lint, and build are green
- Treat tests as the next stabilization milestone after structural cleanup

## Documents That Still Matter

- `docs/SOT.md` for architectural authority
- `docs/development/development-log.md` for session-by-session decisions and evidence
- `docs/development/current-resume-plan.md` for current execution order and scope

## Documents That Need Reconciliation, Not Blind Trust

- `PROJECT_SNAPSHOT_NOV13.md`
- `WEEK_1-2_TRACKER.md`
- `docs/guides/launch-roadmap-2026.md`
- `docs/development/onboarding-status.md`

These remain useful historical references, but they describe an earlier state of the system and should not be treated as the canonical engineering restart point.
