# CLIENT ONBOARDING (WEB-APP + DISCORD) — A→Z IMPLEMENTATION PLAN

This document defines the end-to-end client onboarding flow, pricing/plan structure (base retainer + service add-ons), Sanity schemas, Stripe integration, RBAC, site generation, and operational considerations. It is designed to work for any client vertical (musician, bakery, thrift store, etc.) and to scale to higher-demand clients.

## 1) Goals and scope

- Provide a clear, guided onboarding wizard for all clients (not just plan pickers)
- Support a base monthly retainer plus add-on services (Discord apps, web-app services, maintenance tiers)
- Generate a working site/app skeleton from onboarding inputs, then enable customization via CMS
- Ensure all billing/state is single source of truth (Stripe + Sanity), with robust RBAC entitlements
- Keep the experience simple for clients; keep operations standardized for TownesDev

## 2) User journey overview

1. Discover: public site → Start Project / Contact → brief intake
2. Account & Checkout: signup → pick base retainer → select add-ons → pay
3. Onboarding Wizard (Portal): brand, vertical, service selection, content basics, domain
4. Provisioning: create tenant, initialize content, set entitlements, create preview
5. Review & Launch: client previews, requests tweaks → connect domain → go live
6. Ongoing: manage content (Sanity), subscriptions (Stripe portal), support (portal)

## 3) Onboarding wizard (Portal) — steps and data

- Step 1: Client basics
  - Company/Artist name, contact email, short elevator pitch
  - Vertical: musician, bakery, thrift store, other (free text)
- Step 2: Brand & theme
  - Logo upload, color accent selection, typography (from a curated set)
  - Accessibility reminder; preview tokenized theme
- Step 3: Services selection
  - Base retainer (required)
  - Add-ons:
    - Web-App: hosting/maintenance tier (Starter/Pro/Plus)
    - Discord Application: hosting + maintenance tier; guilds count; feature flags
    - Consulting blocks (one-time)
- Step 4: Web-App content basics
  - Pages toggles: Home, About, Contact, Music/Releases, Shows/Events, Blog, etc.
  - Links: Spotify, Apple Music, YouTube, Instagram, Bandcamp (if musician)
  - Domain intent: “Own z8phyr.com” (connect later) — or custom domain provided
- Step 5: Discord basics (if selected)
  - Bot name, intents, initial features (welcome messages, slash commands, moderation subset)
  - Hosting region preferences
- Step 6: Review & confirm
  - Summary of selections → generate checkout if not already handled → finalize provisioning

UX principles

- Keep each step short; progressive disclosure
- Save state incrementally; allow resume
- Provide helpful defaults and examples

## 4) Pricing & plans model

- Base Retainer (Subscription)
  - SKU: base-retainer (monthly)
  - Covers account management, support SLA, minor updates, admin portal access
- Service Add-ons (Subscription)
  - Web-App Hosting/Maintenance: starter, pro, plus tiers
  - Discord App Hosting/Maintenance: bronze, silver, gold tiers
  - Each add-on has its own Stripe Product/Prices and can be toggled independently
- One-time Fees
  - Web-App initial build/setup, Discord bot setup, migrations
- Billing mechanics
  - One Stripe Checkout session can include base + selected add-ons + one-time line items
  - Stripe Customer ID stored on Client
  - Manage add-ons via Stripe Customer Portal link in portal

## 5) Sanity schema changes (high level)

New/updated document types

- Plan (exists — extend if needed)
  - fields: name, slug, category (base|addon|one-time), stripeProductId, stripePriceId(s), interval, description, features[], visibility (public|internal)
- Service (new)
  - fields: name, type (web-app|discord|consulting), defaultAddons[] (refs to Plan), onboardingSteps[], notes
- Client (exists — extend)
  - fields: name, slug, contact email, stripeCustomerId, maintenanceWindow, onboardingStatus, selectedPlans[] (refs), selectedAddons[] (refs), tenantKey/siteSlug
- WebsiteProject (new)
  - fields: client ref, siteSlug, theme tokens, pagesEnabled[], social/music links, nav config, releasedAt, status
- DiscordProject (new)
  - fields: client ref, botName, features[], guilds[], hostingTier (ref to Plan), status
- Proposal / Contract (optional now, useful soon)
  - fields: client ref, scope, payout schedule, acceptance state

Email templates

- Welcome, Onboarding reminder, Provisioned, Launch success, Invoice due/paid, Add-on upgraded/downgraded

### 5.a) Schema impact matrix (Existing vs New)

- Existing (no new doc, may extend): plan, client, invoice, serviceAsset, feature, entitlement, retainer, monthlyRhythm, kickoffChecklist, incident, offboarding, emailTemplate, seoConfig, serviceOffering, heroSection, testimonial, aboutMe, contactInfo.
- New documents: service, websiteProject, discordProject, proposal/contract, verticalTemplate (for seeding vertical-specific pages/blocks), provisioningRun (log of provisioning attempts and outcomes).
- New/extended fields:
  - client: onboardingStatus (not_started|in_progress|awaiting_payment|completed), tenantKey/siteSlug, selectedPlans[]/selectedAddons[] (refs), hasActiveSubscription (derived or denormalized boolean).
  - plan: category, visibility, interval; ensure stripeProductId/stripePriceId(s) present.
  - serviceAsset: optional link to project and entitlement mapping.

Rationale for Project modeling: prefer separate documents for WebsiteProject and DiscordProject (not embedded sub-objects) so each can evolve independently, be permissioned, and referenced by incidents, reports, and assets. Reuse a shared object (projectCommon) for common fields.

## 6) RBAC & entitlements

- Capabilities are mapped from plan and add-ons to user roles
  - Example: base-retainer → clients:read, invoices:read, support:raise
  - Web-App add-on → website:edit, assets:upload
  - Discord add-on → discord:bot:manage, discord:features:toggle
- Implementation
  - On webhook events, compute entitlements and store on Client or per-user
  - requireCapability("...") guards protected routes and actions

## 7) Stripe integration

- Products/Prices
  - Define Products for Base Retainer, Web-App tiers, Discord tiers, One-time Setup
  - Store IDs in Sanity Plan docs
- Checkout
  - Construct session with selected base + add-ons (+ one-time if applicable)
  - Return to portal onboarding after success
- Webhooks
  - customer.created, checkout.session.completed, invoice.paid, customer.subscription.updated
  - Update Client selectedPlans/addons and entitlements
- Customer Portal
  - Expose a “Manage Billing” link in client portal

## 8) Next.js app updates

- Public
  - Plans page pulls Plan docs from Sanity and shows base + add-ons clearly
  - Contact/Start Project routes funnel to portal onboarding (with account creation)
- Portal (/app)
  - Onboarding wizard flow + state persistence
  - Billing page linking to Stripe Portal
  - Website preview links

### 8.a) Portal gating for incomplete onboarding

- Contract
  - Input: authenticated user; derived client via current session
  - Gate condition: client.onboardingStatus !== 'completed' OR !hasActiveSubscription
  - Behavior: redirect to /app/onboarding if wizard incomplete; if payment missing, redirect to /app/plans or the checkout resume link
  - Success: access to full portal only when onboarding is completed and subscription is active
- Minimal implementation
  - Schema: add onboardingStatus to client (enum), optional hasActiveSubscription boolean (or derive from Stripe webhook state)
  - Server check: in src/app/(portal)/layout.tsx, after getCurrentClient(), enforce gate and redirect
  - UX: show a friendly blocker page with progress and a “Resume onboarding” CTA
  - Webhooks: keep client state in sync after Stripe events
- Admin (/admin)
  - Clients listing with plan/add-ons, status, quick actions
  - Service catalog (Plans/Services) editor views

## 9) Page templates & generation

- Content blocks library (Sanity): Hero, FeatureList, Gallery, Embed, Events, CTA, Footer
- Vertical presets
  - Musician: Home (Hero + Featured Release), Music (Embeds), Releases, Shows, About, Contact
  - Bakery/Thrift: Home (Hero + Featured Items), Products/Catalog (manual or external), About, Contact
- Generation steps
  - On onboarding complete → create WebsiteProject and seed pages with chosen template
  - Tenant resolution by siteSlug or domain (host header)
  - Client customizes via Sanity; UI remains brand-themed via tokens

## 10) Operations & scalability

- Large demand handling
  - Intake remains the same; project priority & staffing added in Admin
  - SLA tiers tied to plan; queue displayed to staff
- Maintenance
  - maintenanceWindow on Client; status page; scheduled notices via email
- Backups
  - Scheduled content export; Stripe export; infra snapshots policy

## 11) Analytics & observability

- Basic: page views, CTA clicks, checkout conversions (privacy-conscious)
- Operational: deployment health, uptime, bot health (for Discord)

## 12) Security

- Server-only session & token handling; no client token leakage
- Sanity tokens kept server-side; queries via helpers only
- Principle of least privilege for RBAC

## 13) Epics, issues, acceptance criteria

EPIC A: Pricing & Plans in Sanity/Stripe

- [x] Plan schema: Stripe fields (stripeProductId, stripePriceId) and hoursIncluded exist
- [x] Plan schema: Add category (base|addon|one-time), interval (month|year), visibility (public|internal)
- [x] Service schema (catalog): type (web_app|discord|consulting), defaultAddons[]
- [ ] Seed initial plan/service documents (Base Retainer; Web-App Starter/Pro/Plus; Discord Bronze/Silver/Gold)
- [ ] Plans page: surface Plan categories (base vs add-ons) clearly
- [x] Checkout endpoint for base plan (subscription)
- [ ] Compose checkout with base + selected add-ons (multiple line_items)
- [x] Webhooks: set client.hasActiveSubscription on subscription lifecycle, set selectedPlan on checkout
- [ ] Webhooks: sync add-on entitlements (features/services) as they are purchased
  - Acceptance: Plans visible on Plans page with base vs add-ons; checkout supports base + add-ons; successful payment reflects in Sanity and gates are lifted

EPIC B: Onboarding Wizard

- [x] Build multi-step wizard in /app/onboarding (MVP scaffold; localStorage persistence)
- [ ] Persist state; resumable; simple preview of theme
- [ ] Branch per service selection; validate minimum fields
- Acceptance: Client completes wizard and lands on confirmation with preview link

EPIC C: Provisioning Pipeline

- [ ] Create Client, WebsiteProject/DiscordProject, entitlements
- [ ] Seed default content per vertical; enable pages
- [ ] Generate preview environment link
- Acceptance: New client sees preview with seeded content and brand

EPIC D: Billing Integration

- [ ] Checkout session for base + selected add-ons (+ one-time)
- [ ] Webhooks update Sanity and entitlements; customer portal link in /app
- Acceptance: Subscription is active, add-ons reflected in portal and enforced

EPIC E: Admin Views

- [ ] Manage Plans/Services, Clients, Projects, Entitlements
- Acceptance: Staff can adjust plans, view client state, and trigger actions

EPIC F: Vertical Templates

- [ ] Create musician preset; expand to general presets (bakery, thrift)
- Acceptance: Selecting a vertical seeds the right pages/blocks

## 17) Priority-ordered execution checklist

Highest priority → lower priority. We’ll keep this as the single running checklist for progress.

- [x] Audit Studio structure vs schema types; note gaps and safe future additions
- [x] Decide Project modeling approach (separate WebsiteProject and DiscordProject)
- [x] Define portal gating contract and minimal implementation
- [x] Add onboardingStatus and hasActiveSubscription to Client schema
- [x] Update getCurrentClient() to return onboardingStatus/hasActiveSubscription
- [x] Add placeholder /app/onboarding page with CTAs
- [x] Implement path-aware gating in middleware (exempt /app/onboarding and /app/plans)
- [x] Remove layout-level redirects to prevent loops
- [ ] Add Service schema (catalog) with type and defaultAddons[]
- [x] Add Service schema (catalog) with type and defaultAddons[]
- [x] Add WebsiteProject and DiscordProject schemas (+ shared projectCommon object)
- [ ] Wire Studio structure groups when new docs land (Projects, Catalog)
- [ ] Plans page: surface Plan categories (base/add-on/one-time)
- [ ] Stripe: map Products/Prices to Plan docs; seed IDs
- [ ] Webhooks: set Client.hasActiveSubscription and entitlements
- [ ] Wizard scaffolding: initial step flow and state persistence
- [ ] Provisioning: seed WebsiteProject content from vertical template
- [ ] Admin: add tables for Plans, Services, Projects with minimal CRUD
- [ ] E2E smoke: gating, wizard path, billing happy-path

## 14) Migration & compatibility

- Migrate placeholder plans to new Plan docs; map existing subscriptions when possible
- Mark old plan references deprecated; backfill Client selectedPlans

## 16) Sanity Studio structure sync (current state)

- Verified against src/sanity/schemaTypes/index.ts and src/sanity/structure.ts:
  - Public Website: heroSection, serviceOffering, testimonial, aboutMe, contactInfo — present
  - Configuration: seoConfig, operationConfig — present
  - Business Management: client, plan, serviceAsset, feature, entitlement, retainer, kickoffChecklist, monthlyRhythm, incident, offboarding, emailTemplate — present
  - Users and Invoices — present (Invoices include a Preview view)
- Not yet modeled (to be added later, then referenced by structure): service, websiteProject, discordProject, verticalTemplate, proposal/contract, provisioningRun
- When we add these docs, update Studio navigation with groups:
  - Projects: Website Projects, Discord Projects
  - Catalog: Services, Plans, Features, Entitlements, Service Assets
  - Operations: Monthly Rhythm, Kickoff, Incidents, Offboarding
  - Content: Public Website
  - System: SEO Config, Operation Config, Email Templates

## 15) Timeline (T-shirt sizes)

- A (Plans/Stripe): M
- B (Wizard): L
- C (Provisioning): M
- D (Billing glue): M
- E (Admin): M
- F (Templates): M

Owners

- Product/Implementation: TownesDev core
- Billing: Stripe ops
- CMS: Content modeling

Notes

- Keep the client experience simple, business operations sane, and future-proof for additional services.
