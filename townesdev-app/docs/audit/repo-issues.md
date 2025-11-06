# Repository Issues & Prioritized Tasks

Date: 2025-10-31

This file lists actionable repository issues discovered during the docs + code audit. Each item is short, with a suggested severity, and acceptance criteria.

1. Backfill Sanity Plan `appliesTo`

- Severity: Critical
- Description: Some onboarding plans in Sanity are missing an explicit `appliesTo` array. Update seed script `tools/sanity/ensure-onboarding-plans.mjs` to include `appliesTo` and run against staging.
- Acceptance: All onboarding plan docs have `appliesTo` set; UI reads plans directly from Sanity and the Playwright smoke test passes.

2. Webhook: Background reconciliation job

- Severity: High
- Description: Implement a scheduled job (cron) to mark expired `processing` locks as `failed` or attempt to requeue them for processing. This reduces operator load.
- Acceptance: Scheduled job finds stuck `stripeEvent` docs older than X hours and either marks them failed or creates a requeue job for later processing. Add unit tests.

3. Webhook Admin UI

- Severity: Medium
- Description: Provide an `/admin/webhooks` UI with list, filter, retry, and mark-failed actions. Use existing `scripts/list-stuck-webhooks.mjs` logic as backend API.
- Acceptance: Admin users can list webhook events, filter by status, and retry or mark failed. Include RBAC checks.

4. Docs hosting & CI

- Severity: Medium
- Description: Decide on docs hosting (GitHub Pages vs Docusaurus on Vercel) and add a lightweight CI job to build and publish docs on merge to `main`.
- Acceptance: Docs are accessible on a stable URL after CI build; PRs to docs show preview.

5. E2E: Checkout → Webhook integration test

- Severity: Medium
- Description: Add an E2E test that exercises Checkout flow and a simulated webhook delivery to validate end-to-end provisioning. This requires either Stripe test credentials or a stubbed webhook endpoint used by the test runner.
- Acceptance: CI runs E2E test with stubbed webhook and passes.

6. Docs: Merge EMAIL docs

- Severity: Low
- Description: Merge `email-handling-strategies.md` into `email-integration.md` and update README index.
- Acceptance: Single canonical email doc; no broken links.

7. Sanity seeds and migrations

- Severity: Low
- Description: Add idempotent seed scripts to ensure all required onboarding plans exist with correct fields, e.g., `appliesTo`, `priceId`, `type`.
- Acceptance: Seed script runs idempotently and adds/updates docs as needed; tests added.

If you'd like, I can create PRs for items (1), (6), and (4) immediately and open issues for tracking the others.
