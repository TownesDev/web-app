# Stripe Webhooks Runbook

Purpose: increase reliability and observability of Stripe webhook handling. This runbook explains retry behavior, safe replay, alerting, and operational guidance.

1) Failure modes & detection
  - Signature verification failures: frequent failures often indicate rotated webhook secret or invalid forwarder. Alert when signature failures spike above a threshold (e.g., >5/minute over 5m).
  - Sanity persistence failures: if writes to `stripeEvent` fail repeatedly, webhook processing may be non-idempotent. Alert on write error rate (>1% of webhooks over 10m).
  - Processing errors: errors during business logic (retainer creation, entitlement mapping). Alert on repeated `webhook.processing_error` logs per correlationId.

2) Retry handling
  - Stripe will retry webhook delivery automatically on 5xx and network failures. Our handler should return 2xx only when processing is successful or safely suppressed (duplicate).
  - On transient downstream failures (Sanity write or third-party APIs), prefer returning 5xx to let Stripe retry, unless partial work was done and is idempotent.
  - Use `stripeEvent` record to mark in-flight processing (`processing`) and final state (`success`/`failed`) so replays are safe.

3) Safe replay procedure
  - Inspect `stripeEvent` documents in Sanity by `eventId`. If status is `failed` or missing, you may safely replay the Stripe event by:
    1. Retrieve original event JSON from `stripe` (Stripe dashboard -> Events -> Select event -> Click 'Send test webhook' or use CLI `stripe events resend` or `stripe trigger`).
    2. If the original `stripeEvent` doc exists and is `processing` for a long time, manually set `status` to `failed` with a note to allow replay.
    3. From a trusted environment, resend the event to the webhook endpoint (use `stripe events resend` or the stripe CLI `stripe trigger` with the exact payload). Monitor logs for `correlationId` and `eventId`.
    4. Confirm outcome in Sanity and that idempotent downstream artifacts (retainers, entitlements) were created exactly once.

4) Observability
  - Structured logs emitted with `correlationId`, `eventId`, `eventType` and `outcome`. Ingest these into your log platform and create dashboards:
    - Webhook volume and success rate by event type
    - Signature verification failure rate
    - Sanity write error alerts
    - Latency distribution for webhook processing

5) Alerting recommendations
  - High signature verification failures: P1 — investigate webhook secret and forwarding configuration
  - High Sanity write failure rate: P1 — check Sanity tokens, rate limits, and network
  - Repeated processing_error for same eventId: P2 — investigate business logic and downstream services

6) Incident playbook
  - If duplicates are causing double-provisioning: stop automated provisioning flows, mark affected `stripeEvent` docs as `failed`, replay events one-by-one and verify idempotent handlers.
  - If Sanity is down: enable fail-open queue (temporary) to store event JSON in durable queue (S3/SQS) for later replay and route webhooks to return 202 to Stripe until repairs complete.

7) Notes
  - Keep `stripeEvent.raw` minimal or redact PII; prefer storing a digest if concerns exist.
  - Consider adding a small background job to reconcile Stripe events vs Sanity documents on a schedule to detect missing/failed records.
