# TownesDev Platform – Checkpoint Review

_Last reviewed: 2025-11-04_

This document captures the current state of the onboarding program, operational gaps, documentation hygiene, and forward-looking work necessary to keep the platform healthy for the next 20–30 years. Tasks are grouped by urgency so a solo developer (and supporting agents) can execute systematically.

## Critical (address immediately)

- [x] **Stripe webhook hardening** ✅ COMPLETED
  - ✅ Persist processed `event.id` using `stripeEvent` docs with `createIfNotExists` for atomic duplicate suppression
  - ✅ Emit structured JSON logs with correlation IDs, provision actions, and failure outcomes
  - ✅ Ops runbook exists at `docs/guides/stripe-webhooks-runbook.md`
  - ✅ Regression tests exist in `src/app/api/stripe/__tests__/webhook.test.ts` and `webhook.regression.test.ts`
- [ ] **Onboarding → Checkout integration**
  - Build the checkout orchestration so selections from `Services` feed Stripe line items (base + add-ons + one-time) and the return path resumes the wizard at Review.
  - Store the resulting subscription/add-on refs in Sanity (client.selectedPlans / selectedAddons) and gate portal access until payment clears.
- [ ] **Onboarding review completeness**
  - Expand the Review step copy, status indicators, and CTA grouping so clients clearly understand what will be provisioned, what billing occurs, and next steps.
  - Surface post-provision preview URLs and Stripe billing portal CTA in the success state.
- [ ] **Sanity schema alignment for plans**
  - Add `appliesTo` (web|discord) to the Sanity Plan schema and update `tools/sanity/ensure-onboarding-plans.mjs` to seed authoritative values.
  - Backfill existing plan docs and adjust the portal queries if needed.
- [x] **Documentation audit kickoff** ✅ COMPLETED
  - ✅ Comprehensive audit completed (see `docs/audit/DOCS_AUDIT_COMPREHENSIVE.md`)
  - ✅ Duplicates identified and removed (stripe runbook, testing docs)
  - ✅ Completed audits archived to `docs/audit/_archived/`
  - ✅ Folder restructuring in progress

## High Priority (queue next)

- [ ] **Provisioning UX polish**
  - Replace the simple `alert` usage in `Finish & Provision` with toast/status components, loading states, and retry guidance.
  - Return preview URL + links inside the UI immediately after provisioning succeeds.
- [ ] **Portal gating & state machine**
  - Store onboarding progress and stripe status on the Client document (`onboardingStatus`, `hasActiveSubscription`) and enforce gating in `src/app/(portal)/layout.tsx`.
  - Provide a friendly blocker page with resume CTA and support contact.
- [ ] **Analytics & funnel instrumentation**
  - Define event schema (step viewed/completed, abandonment, checkout start/complete) and wire to analytics provider.
  - Capture metrics so we can iterate on wizard friction.
- [ ] **Comprehensive documentation pass**
  - Update `docs/client-onboarding-issues.md` to reflect the new Sanity plan catalog + provisioning flow.
  - Ensure `docs/email-integration.md` references the latest webhook pipeline and entitlement mapping.
  - Document the onboarding wizard UX rationale in `docs/guides/` (or create a new guide).
- [ ] **UI audit (desktop + mobile)**
  - Review every portal/public page for adherence to brand tokens (colors, spacing, typography).
  - Confirm focus states, keyboard navigation, and ARIA labelling.
  - Capture screenshots and notes for any deviations.

## Medium Priority

- [ ] **Playwright E2E coverage** for the onboarding happy path, validation failure cases, resume-from-progress, and provisioning success.
- [ ] **Email/notifications alignment**
  - Ensure onboarding milestone emails (welcome, provisioning, ready-to-launch) exist in Sanity templates and that triggers are in place.
- [ ] **Admin experience**
  - Audit `/admin` routes for visibility into client onboarding status, plan selections, and manual overrides.
  - Add quick links to retry provisioning or view webhook history once the persistence layer exists.
- [ ] **Observability & alerting**
  - Instrument critical API routes (`stripe/webhook`, `clients/provision`, `public/queries`) with metrics (duration, error rate) and feed into dashboards.
  - Define uptime + bot health monitors for hosted client assets.
- [ ] **Security review**
  - Verify RBAC guards wrap all portal/admin actions (especially new endpoints).
  - Schedule dependency updates + audit for known vulnerabilities.

## Low Priority / Nice to Have

- [ ] **Design pairing session** to refine spacing, typography, and microcopy once core behaviors land.
- [ ] **Client delight touches**
  - Personalized welcome page post-provision with video walkthrough and checklist.
  - "Launch readiness" score surfaced in the portal based on outstanding tasks.
- [ ] **Internal agent playbooks** for each major workflow (onboarding, incident triage, maintenance window).
- [ ] **Backup & archive policy** documentation to ensure long-term content durability.

## Documentation Housekeeping

- [x] Migrated legacy onboarding todos into this document and removed `docs/onboarding-todos.md` to prevent drift.
- [ ] Add update cadence notes (e.g., quarterly review reminders) to `docs/README.md` so future scrubs are automatic.

---

### Notes from this review

- Onboarding wizard: basics/brand/services/web/discord validation + copy are complete as of 2025-10-30. Remaining gaps center on checkout hand-off, Review UX, analytics, and success state polish.
- Provisioning API (`src/app/api/clients/provision/route.ts`) creates WebsiteProject/DiscordProject docs and seeds default pages, but the UI lacks feedback/preview linking.
- Stripe webhook handler currently writes entitlements but does not guard against duplicate deliveries or emit structured logs.
- Several documentation files overlap; consolidate them into cohesive guides to keep future agents aligned.
- Plan catalog now respects `appliesTo` in the UI; schema + seed updates must follow so content remains source-of-truth.

> Revisit this document after each milestone to tick checkboxes, add context, and keep the long-term roadmap actionable for a single maintainer plus agent team.
