# TownesDev Onboarding & Billing Tracker

_Last updated: 2025-10-30_

## Agent Brief – Stripe Webhook Hardening

**Objective**

- Increase reliability and observability of Stripe webhook handling so subscription events are idempotent, auditable, and recoverable without manual intervention.

**Deliverables**

- [ ] Persistence layer (Sanity or Supabase table) capturing processed Stripe `event.id` / `checkout.session.id`, timestamps, client references, and outcome.
- [ ] Updated webhook handler that short-circuits duplicate events via the persistence layer and emits structured logs (JSON) with correlation identifiers.
- [ ] Operational runbook notes covering retry handling, how to replay events safely, and alerting recommendations.
- [ ] Regression tests (unit + integration stub) demonstrating duplicate suppression and correct logging.

**Key Tasks**

- [ ] Design storage schema for processed Stripe events (choose datastore, define fields, TTL policy if needed).
- [ ] Implement read-before-write guard in `/api/stripe/webhook/route.ts` leveraging the new store.
- [ ] Add structured logging helper (e.g., `logWebhookEvent`) to capture request metadata, entitlements actions, and provisioning status.
- [ ] Write tests/stubs that simulate duplicate `checkout.session.completed` deliveries and verify no additional entitlements/retainers are created.
- [ ] Document ops workflow (e.g., in `docs/OPERATIONS.md`) including replay commands and monitoring hooks.

---

## Onboarding Wizard & UI Polish TODOs (Core Team)

- [ ] Define UX copy and schema for each step (Basics, Brand, Services, Web App, Discord, Review) with validation requirements.
  - [x] Basics step: copy, validation schema, and inline error states (2025-10-30)
  - [x] Brand step: copy, validation schema, and inline error states (2025-10-30)
  - [x] Services step: copy, validation schema, and inline error states (2025-10-30)
  - [x] Web App step (2025-10-30)
  - [x] Discord step (2025-10-30)
  - [ ] Review step
- [x] Implement stepped layout with progress indicator and accessible navigation (keyboard/focus states, screen reader labels). (2025-10-30)
- [x] Persist wizard state server-side (e.g., via onboarding session document) while keeping optimistic local updates. (2025-10-30)
- [ ] Integrate plan selection / checkout hand-off so wizard summary reflects Stripe selections and handles return path.
- [ ] Connect "Finish & Provision" action to new server endpoint that validates data, invokes provisioning, and handles error/display states.
- [ ] Surface preview link and billing portal CTA post-provisioning with success + failure UI states.
- [ ] Add analytics/events instrumentation (e.g., step complete, abandon) for future funnel tracking.
- [ ] Write unit/e2e tests covering happy path, validation failures, and resume-from-interruption scenarios.
- [ ] Pair with design to align spacing, typography, and brand tokens for desktop/mobile breakpoints.

> _Please review and confirm before implementation so we can adjust scope or sequencing._
