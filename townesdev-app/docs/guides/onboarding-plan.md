---

title: "Client Onboarding (Web App + Discord)"
slug: "/onboarding-plan"

---

<!-- Canonical onboarding plan. Created 2025-10-31 from CLIENT_ONBOARDING_ISSUES.md -->

# Onboarding Plan — Client Onboarding (Web App + Discord)

This document defines the end-to-end client onboarding flow, pricing/plan structure (base retainer + service add-ons), Sanity schemas, Stripe integration, RBAC, site generation, and operational considerations. It is designed to work for any client vertical (musician, bakery, thrift store, etc.) and to scale to higher-demand clients.

## 1) Goals and scope

## 2) User journey overview

1. Discover: public site → Start Project / Contact → brief intake
2. Account & Checkout: signup → pick base retainer → select add-ons → pay
3. Onboarding Wizard (Portal): brand, vertical, service selection, content basics, domain
4. Provisioning: create tenant, initialize content, set entitlements, create preview
5. Review & Launch: client previews, requests tweaks → connect domain → go live
6. Ongoing: manage content (Sanity), subscriptions (Stripe portal), support (portal)

## 3) Onboarding wizard (Portal) — steps and data

- Company/Artist name, contact email, short elevator pitch
- Vertical: musician, bakery, thrift store, other (free text)
- Logo upload, color accent selection, typography (from a curated set)
- Accessibility reminder; preview tokenized theme
- Base retainer (required)
- Add-ons:
  - Web-App: hosting/maintenance tier (Starter/Pro/Plus)
  - Discord Application: hosting + maintenance tier; guilds count; feature flags
  - Consulting blocks (one-time)
- Pages toggles: Home, About, Contact, Music/Releases, Shows/Events, Blog, etc.
- Links: Spotify, Apple Music, YouTube, Instagram, Bandcamp (if musician)
- Domain intent: “Own z8phyr.com” (connect later) — or custom domain provided
- Bot name, intents, initial features (welcome messages, slash commands, moderation subset)
- Hosting region preferences
- Summary of selections → generate checkout if not already handled → finalize provisioning

UX principles

## 4) Pricing & plans model

- SKU: base-retainer (monthly)
- Covers account management, support SLA, minor updates, admin portal access
- Web-App Hosting/Maintenance: starter, pro, plus tiers
- Discord App Hosting/Maintenance: bronze, silver, gold tiers
- Each add-on has its own Stripe Product/Prices and can be toggled independently
- Web-App initial build/setup, Discord bot setup, migrations
- One Stripe Checkout session can include base + selected add-ons + one-time line items
- Stripe Customer ID stored on Client
- Manage add-ons via Stripe Customer Portal link in portal

## 5) Sanity schema changes (high level)

New/updated document types

- fields: name, slug, category (base|addon|one-time), stripeProductId, stripePriceId(s), interval, description, features[], visibility (public|internal)
- fields: name, type (web-app|discord|consulting), defaultAddons[] (refs to Plan), onboardingSteps[], notes
- fields: name, slug, contact email, stripeCustomerId, maintenanceWindow, onboardingStatus, selectedPlans[] (refs), selectedAddons[] (refs), tenantKey/siteSlug
- fields: client ref, siteSlug, theme tokens, pagesEnabled[], social/music links, nav config, releasedAt, status
- fields: client ref, botName, features[], guilds[], hostingTier (ref to Plan), status
- fields: client ref, scope, payout schedule, acceptance state

Email templates

### 5.a) Schema impact matrix (Existing vs New)

- client: onboardingStatus (not_started|in_progress|awaiting_payment|completed), tenantKey/siteSlug, selectedPlans[]/selectedAddons[] (refs), hasActiveSubscription (derived or denormalized boolean).
- plan: category, visibility, interval; ensure stripeProductId/stripePriceId(s) present.
- serviceAsset: optional link to project and entitlement mapping.

Rationale for Project modeling: prefer separate documents for WebsiteProject and DiscordProject (not embedded sub-objects) so each can evolve independently, be permissioned, and referenced by incidents, reports, and assets. Reuse a shared object (projectCommon) for common fields.

## 6) RBAC & entitlements

- Example: base-retainer → clients:read, invoices:read, support:raise
- Web-App add-on → website:edit, assets:upload
- Discord add-on → discord:bot:manage, discord:features:toggle
- On webhook events, compute entitlements and store on Client or per-user
- requireCapability("...") guards protected routes and actions

## 7) Stripe integration

- Define Products for Base Retainer, Web-App tiers, Discord tiers, One-time Setup
- Store IDs in Sanity Plan docs
- Construct session with selected base + add-ons (+ one-time if applicable)
- Return to portal onboarding after success
- customer.created, checkout.session.completed, invoice.paid, customer.subscription.updated
- Update Client selectedPlans/addons and entitlements
- Expose a “Manage Billing” link in client portal

## 8) Next.js app updates

- Plans page pulls Plan docs from Sanity and shows base + add-ons clearly
- Contact/Start Project routes funnel to portal onboarding (with account creation)
- Onboarding wizard flow + state persistence
- Billing page linking to Stripe Portal
- Website preview links

### 8.a) Portal gating for incomplete onboarding

- Input: authenticated user; derived client via current session
- Gate condition: client.onboardingStatus !== 'completed' OR !hasActiveSubscription
- Behavior: redirect to /app/onboarding if wizard incomplete; if payment missing, redirect to /app/plans or the checkout resume link
- Success: access to full portal only when onboarding is completed and subscription is active
- Schema: add onboardingStatus to client (enum), optional hasActiveSubscription boolean (or derive from Stripe webhook state)
- Server check: in src/app/(portal)/layout.tsx, after getCurrentClient(), enforce gate and redirect
- UX: show a friendly blocker page with progress and a “Resume onboarding” CTA
- Webhooks: keep client state in sync after Stripe events
- Clients listing with plan/add-ons, status, quick actions
- Service catalog (Plans/Services) editor views

## 9) Page templates & generation

- Musician: Home (Hero + Featured Release), Music (Embeds), Releases, Shows, About, Contact
- Bakery/Thrift: Home (Hero + Featured Items), Products/Catalog (manual or external), About, Contact
- On onboarding complete → create WebsiteProject and seed pages with chosen template
- Tenant resolution by siteSlug or domain (host header)
- Client customizes via Sanity; UI remains brand-themed via tokens

## 10) Operations & scalability

- Intake remains the same; project priority & staffing added in Admin
- SLA tiers tied to plan; queue displayed to staff
- maintenanceWindow on Client; status page; scheduled notices via email
- Scheduled content export; Stripe export; infra snapshots policy

## 11) Analytics & observability

## 12) Security

## 13) Epics, issues, acceptance criteria

EPIC A: Pricing & Plans in Sanity/Stripe

- Implemented: add-on plan retainers created per line item; client.selectedAddons reflects purchased add-ons
- Implemented: plan → feature entitlement mapping (heuristic on seeded plan IDs) creates asset-scoped Feature docs and Entitlement docs idempotently
- Notes: Mapping is encapsulated in src/lib/entitlements.ts; can be swapped for CMS-driven mapping later
- Acceptance: Plans visible on Plans page with base vs add-ons; checkout supports base + add-ons; successful payment reflects in Sanity and gates are lifted

## 17) Priority-ordered execution checklist

Highest priority → lower priority. We’ll keep this as the single running checklist for progress.

## 14) Migration & compatibility

## 16) Sanity Studio structure sync (current state)

- Public Website: heroSection, serviceOffering, testimonial, aboutMe, contactInfo — present
- Configuration: seoConfig, operationConfig — present
- Business Management: client, plan, serviceAsset, feature, entitlement, retainer, kickoffChecklist, monthlyRhythm, incident, offboarding, emailTemplate — present
- Users and Invoices — present (Invoices include a Preview view)
- Projects: Website Projects, Discord Projects
- Catalog: Services, Plans, Features, Entitlements, Service Assets
- Operations: Monthly Rhythm, Kickoff, Incidents, Offboarding
- Content: Public Website
- System: SEO Config, Operation Config, Email Templates

## 15) Timeline (T-shirt sizes)

Owners

Notes
