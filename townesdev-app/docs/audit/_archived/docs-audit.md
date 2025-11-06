# Documentation & Code Audit (snapshot)

Date: 2025-10-31

This document captures a lightweight audit of the codebase and docs from a "client + admin" product perspective. It lists overlaps, stale doc candidates, and recommended consolidation actions. Use this as the starting place for a cleanup PR and to build the public docs site.

Summary findings

- The codebase contains extensive docs under `docs/` covering architecture, setup, testing, and runbooks. Overall quality is high, but there are overlaps and a few missing index pages.
- Overlaps discovered:
  - `email-integration.md` and `email-handling-strategies.md` cover the same area (email inbound processing). Keep `email-integration.md` as canonical and merge the short strategy guide into it (Strategy section).
  - `client-onboarding-issues.md` and `docs/checkpoint-review.md` overlap; `checkpoint-review.md` is more recent and should be treated as canonical. Move any unique items from `client-onboarding-issues.md` into `checkpoint-review.md` and archive the older file.

Immediate consolidation actions (recommended)

1. Merge `email-handling-strategies.md` into `email-integration.md` (add Strategy section and example env toggles). Mark `email-handling-strategies.md` as deprecated (or delete after merge).
2. Reconcile `client-onboarding-issues.md` into `docs/checkpoint-review.md` and archive the original (keep history in git).
3. Add a short docs index and hosting README (this repo's `docs/README.md` updated to include `docs-audit.md` and `repo-issues.md`).

Docs quality notes

- Some docs reference other docs that are not present (e.g., `architecture/multi-service.md`, `architecture/auth.md`) — those links should be validated and either added or removed.
- `docs/README.md` includes entries for pages that do not exist; either create the missing pages (recommended for important topics) or remove the entries.
- Sanity: many data-layer examples are embedded in `architecture/data-layer.md` and `guides/sanity-preview.md` — ensure they stay in sync.

Client & Admin flow audit highlights (high level)

- Onboarding (client): The UX is implemented, but the checkout handoff, return/resume, and review UX are incomplete. See `docs/checkpoint-review.md` — prioritized as Critical.
- Admin: Webhook persistence now exists but needs policies for lock expiry, reconciliation, and an admin UI to inspect/repair events. An admin-side script (`scripts/list-stuck-webhooks.mjs`) was added (see runbook) — consider adding an `/admin/webhooks` route that lists events and allows controlled replays.

Hosting the docs (recommendation)

- Option A (fast): Publish the `docs/` folder as a static site using GitHub Pages or GitHub Actions that copies the markdown into a static site (mkdocs or Docsify) and hosts on `gh-pages`. Pros: quick, low-maintenance.
- Option B (richer): Use Docusaurus or MkDocs Material to create a navigable site with search, versioning, and a clean theme. Requires adding node dependencies and a build pipeline but improves developer UX.

Next immediate tasks (short list)

1. Merge overlapping docs (EMAIL + CLIENT onboarding). (I can do this automatically and open a PR.)
2. Validate and fix broken links in `docs/README.md`.
3. Create `docs/repo-issues.md` (priority list) — created alongside this file.
4. Choose a docs hosting approach; I can scaffold mkdocs or a Docusaurus config based on your preference.

If you'd like, I will perform the merges automatically (prefer `email-integration.md` and `checkpoint-review.md` as canonical) and open a PR with the consolidated docs and a small GitHub Actions workflow for publishing a docs site.
