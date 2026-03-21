# Vercel Refresh Preflight

Use this checklist before promoting the cleaned baseline.

## 1) Local quality gates (required)

Run the release preflight:

```bash
npm run preflight:release
```

This runs:

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run test:e2e:ci`
- `npm run build`

If any step fails, do not ship.

## 2) Route behavior sanity checks

- Confirm `/get-started` is the canonical onboarding entry.
- Confirm unauthenticated `/app` redirects to `/auth/signin`.
- Confirm subscription-gated portal behavior still routes blocked users through onboarding/payment flow.

## 3) Environment parity check (Vercel)

Validate these are present and correct in the target Vercel environment:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_API_VERSION`
- `SANITY_READ_TOKEN`
- `SANITY_AUTH_TOKEN`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY`
- `EMAIL_FROM`

## 4) Stripe integration sanity

- Confirm checkout success URL and cancel URL match deployed domain expectations.
- Confirm webhook endpoint is active in Stripe and pointing at deployed URL.
- Confirm webhook signing secret in Vercel matches Stripe dashboard.

## 5) Deployment and verification

After deploy:

- Run a smoke pass on `/`, `/plans`, `/get-started`, `/auth/signin`.
- Run protected route check on `/app` and `/admin`.
- Run one full self-service checkout in test mode and verify:
  - webhook event received
  - client activation
  - portal access granted

## 6) Post-deploy log update

Append the outcome in `docs/development/development-log.md` with:

- deployment timestamp
- commit/branch
- gate results
- environment used (preview/production)
- rollback notes (if needed)
