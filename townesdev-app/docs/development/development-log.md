# TownesDev Platform - Development Log

Purpose: running engineering log for implementation, debugging, and architectural decision tracking.

## Entry Template

- Date/Time:
- Session Label:
- Trigger/Context:
- Problem Statement:
- Initial Hypothesis:
- Actions Taken:
- Evidence/Output:
- Decision:
- Architectural Impact:
- Follow-up Tasks:

---

## Entries

### Entry 001

- Date/Time: 2026-03-20
- Session Label: Restart Audit and Canonicalization
- Trigger/Context: Project reorientation after a long gap, with multiple in-flight onboarding and payment changes in the repo and an older production deployment that predates them.
- Problem Statement: The codebase had multiple overlapping planning artifacts and partially merged implementation paths. The team needed a single canonical restart point, a unified development direction, and a clear read on whether the current app state was deployable.
- Initial Hypothesis: The product flow was likely further along than the older planning docs suggested, but local quality gates were expected to be red due to unfinished refactor work.
- Actions Taken:
  - Reviewed core status documents, including project snapshots, launch summaries, changelog, SOT, and onboarding docs.
  - Inspected recent git history in the actual app repo.
  - Verified current `npm audit`, `npm run lint`, and `npm run typecheck` state from the app directory.
  - Compared the implemented self-service flow against the older portal onboarding flow.
- Evidence/Output:
  - `npm audit --json` reported 0 vulnerabilities in the app repo.
  - Recent commits confirmed Stripe checkout, webhook activation, payment success, and portal gating had already been implemented.
  - `npm run lint` failed mostly because generated docs-site artifacts and CommonJS utility scripts were being linted.
  - `npm run typecheck` failed in `src/app/(portal)/app/onboarding/page.tsx` because the file mixed a new `WizardData` model with old `services`, `web`, and `discord` logic.
  - `npm run dev` was reported by the user to work, reinforcing that the main breakage was in discipline and validation layers rather than runtime boot.
- Decision:
  - Treat the public self-service flow at `/get-started` as the modern onboarding path.
  - Retire the legacy portal onboarding implementation as an active product flow instead of continuing to patch it.
  - Use a new canonical restart plan document to unify fragmented planning.
  - Re-establish session quality gates in this order: typecheck, lint, build, then tests.
- Architectural Impact:
  - Product onboarding direction is simplified toward a single public entry flow.
  - Legacy portal onboarding becomes deprecated infrastructure, not an active roadmap target.
  - Documentation becomes a first-class control surface for resuming work, not a pile of historical fragments.
- Follow-up Tasks:
  - Create and maintain a canonical restart plan.
  - Fix lint configuration so it reflects source-of-truth code instead of generated output.
  - Replace the broken legacy onboarding route with a minimal retired-flow redirect.
  - Re-run typecheck, lint, and build.
  - Inventory and triage the current failing test suite into the next session scope.

### Entry 002

- Date/Time: 2026-03-20
- Session Label: Quality Gate Baseline Restoration
- Trigger/Context: Follow-through from the restart audit to establish a reliable session baseline before any new feature work.
- Problem Statement: The repo needed a clean core validation baseline and a durable documentation point so future sessions could resume from a single source of truth.
- Initial Hypothesis: Most failures would be structural rather than deep product regressions, so a focused cleanup of dead flow code, lint scope, and version drift should restore the baseline quickly.
- Actions Taken:
  - Added `docs/development/current-resume-plan.md` as the canonical restart document.
  - Added this development log and linked both documents from the docs index.
  - Narrowed ESLint scope to ignore generated docs-site and report output.
  - Made the lint script deterministic on Windows by removing the shell fallback.
  - Replaced the legacy `/app/onboarding` implementation with a minimal redirect to `/app`.
  - Updated onboarding success fallbacks to point to `/get-started` instead of the retired flow.
  - Removed obsolete tests that targeted the retired onboarding wizard.
  - Updated Stripe API version strings to the SDK-expected version.
  - Re-ran `npm run typecheck`, `npm run lint`, and `npm run build`.
- Evidence/Output:
  - `npm run typecheck` completed successfully.
  - `npm run lint` completed successfully.
  - `npm run build` completed successfully.
  - The only remaining build-level note was a non-failing Next.js warning about inferred workspace root due to multiple lockfiles.
- Decision:
  - Treat the app repo as restored to a usable baseline for the next cleanup or delivery task.
  - Preserve the retired onboarding route only as a compatibility redirect, not as an implementation target.
- Architectural Impact:
  - The platform now has a documented canonical restart path and session log.
  - Validation is aligned to maintained source code instead of generated artifacts.
  - The onboarding surface is simpler and more consistent with the self-service direction.
- Follow-up Tasks:
  - Triage the test suite as the next discipline step.
  - Reconcile stale launch and onboarding docs against the canonical resume plan.
  - Consider setting `turbopack.root` in Next config to remove the multi-lockfile build warning.

### Entry 003

- Date/Time: 2026-03-20
- Session Label: Test Trust and Docs Reconciliation
- Trigger/Context: Follow-up stabilization after restoring the core typecheck, lint, and build baseline.
- Problem Statement: The unit test suite needed to be restored to clean trusted-green status, stale onboarding and roadmap documents still contradicted live implementation, and the build/test output still showed a multi-lockfile root warning that needed to be removed before the next Vercel refresh.
- Initial Hypothesis: The remaining failures would be localized to outdated tests and stale assumptions rather than broad product regressions.
- Actions Taken:
  - Ran the Jest suite and isolated the failing cases.
  - Fixed the `TrialBanner` test to match the component's accessible decorative icon behavior.
  - Updated the webhook regression test to match the intended stale-lock reclamation behavior.
  - Silenced direct console chatter in the webhook tests so passing runs are clean and readable.
  - Scoped Next.js root settings in `next.config.ts` to the actual app root.
  - Reconciled stale roadmap and onboarding docs so they point to the canonical resume plan and reflect implemented checkout, webhook, and gating behavior.
  - Re-ran `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.
- Evidence/Output:
  - `npm test` completed with 10 passing suites and 36 passing tests.
  - The previous multi-lockfile warning no longer appeared in the Jest or build output.
  - `npm run typecheck`, `npm run lint`, and `npm run build` all completed successfully.
  - Build output still includes non-failing dynamic route logging tied to pages that use `cookies`, but that is separate from the resolved lockfile warning.
- Decision:
  - Treat the unit test suite as restored to trusted-green status.
  - Treat the canonical resume plan as the single source of current direction, with older roadmap and onboarding docs kept only as reconciled historical/supporting references.
- Architectural Impact:
  - Build and test output is cleaner and more reliable for release preparation.
  - Documentation drift around onboarding and launch readiness is materially reduced.
  - The app root is now explicitly configured for Next.js tracing and Turbopack behavior.
- Follow-up Tasks:
  - Triage the dynamic route logging during build and decide whether to mark affected routes explicitly dynamic.
  - Expand coverage into E2E flows for self-service onboarding, checkout, and gating.
  - Continue reconciling remaining stale audit documents as they are touched.

### Entry 004

- Date/Time: 2026-03-20
- Session Label: Dynamic Route Logging + E2E Stabilization + Ship Preflight
- Trigger/Context: Final hardening pass requested before Vercel refresh.
- Problem Statement: Build logs were noisy around dynamic-route behavior, E2E coverage needed to explicitly validate the modern self-service onboarding and gating path, and shipping needed a repeatable preflight process.
- Initial Hypothesis: A combination of explicit dynamic layout declarations, removal of noisy auth/session logs, and updated Playwright scenarios aligned to `/get-started` would restore reliable signal in both build and test outputs.
- Actions Taken:
  - Added explicit dynamic rendering declarations to portal and admin layouts.
  - Filtered expected `DYNAMIC_SERVER_USAGE` session exceptions from error logging.
  - Removed debug `console.log` noise from `getCurrentClient`.
  - Replaced stale onboarding E2E with modern `/get-started` onboarding, checkout handoff, and portal-gating coverage.
  - Installed Chromium for Playwright in the local environment.
  - Added `test:e2e:ci` and `preflight:release` scripts to automate release validation.
  - Added a Vercel refresh preflight checklist document and linked it from docs index.
  - Ran `npm run preflight:release` end-to-end.
- Evidence/Output:
  - `npm run preflight:release` passed fully:
    - typecheck ✅
    - lint ✅
    - unit tests ✅ (10/10 suites)
    - Playwright ✅ (13/13 tests)
    - build ✅
  - Previous multi-lockfile warning remained resolved.
  - Build completed without earlier dynamic-session noise flooding output.
- Decision:
  - Treat this baseline as ship-ready for Vercel refresh.
  - Keep `preflight:release` as the required local gate before deployment.
- Architectural Impact:
  - Auth-protected route groups are explicitly dynamic by design.
  - E2E suite now validates the current canonical onboarding flow rather than deprecated route assumptions.
  - Deployment readiness is now documented and script-backed.
- Follow-up Tasks:
  - Run the post-deploy smoke + test checkout verification from the Vercel preflight checklist.
  - Optionally silence Sanity live-preview token warnings in local/dev if desired.
