# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Bot Platform Integration**: Complete Discord bot management system integration
  - Environment variables: `BOT_API_URL`, `BOT_API_KEY`, `BOT_WEBHOOK_SECRET`
  - Extended Sanity schemas: `botTenantId`/`botApiKey` on client, `status` on serviceAsset, `key` on feature
  - API endpoints: `/api/bot/tenants/provision`, `/api/bot/assets/:guildId/register`, `/api/bot/features/:guildId/:key/toggle`, `/api/bot/sync/:guildId`
  - RBAC capabilities: `bot:tenants:provision`, `bot:tenants:manage`, `bot:assets:register`, `bot:assets:manage`, `bot:features:toggle`
  - Client Portal: Enhanced features page with toggle buttons for Discord bot features, Discord Assets navigation
  - Admin Portal: Complete client bot management (tenant provisioning, guild registration, feature matrix)
  - Components: `ToggleFeatureButton`, `TenantProvisioning`, `GuildManagement`, `FeatureManagement`, `BotManagementSection`
  - Bot utilities: `getClient()`, `updateClientBotData()` in `src/lib/bot.ts`
  - Documentation: Comprehensive integration guide in `refs/bot-platform-integration.md`

- **Email API Integration**: Template-based email sending system with Sanity CMS
  - `POST /api/email` endpoint for sending emails by template name
  - Portable Text to HTML/text conversion with variable interpolation
  - Resend integration with verified sender support
  - Query helper `getEmailTemplateByName()` for fetching templates from Sanity
  - Email utilities for rendering and variable merging (`src/lib/email.ts`)
  - Resend client configuration (`src/lib/resendClient.ts`)
  - Fallback to plain text when HTML generation fails
  - Environment variable `EMAIL_FROM` for verified sender configuration
  - Documentation in README.md with usage examples and API reference
  - **Welcome Email on Subscription**: Automatic email sending on new Stripe subscriptions
    - Webhook handler sends "Welcome Activation" email to new clients
    - Includes plan details, start date, SLA start time, and maintenance window
    - Error logging and graceful failure handling (doesn't break subscription creation)
    - Variable interpolation for personalized client communications

- **RBAC System**: Role-Based Access Control with types, guards, and utilities in `src/lib/rbac/`
  - Support for admin, staff, client, and user roles
  - Capability-based permissions (clients:read/write, content:read/write, etc.)
  - `requireStaff()`, `requireCapability()`, and `hasCapability()` guard functions
- **Admin Portal**: Staff-only admin interface at `/admin`
  - Route protection via middleware for authenticated users only
  - Admin dashboard with clients table (Name | Status | Plan | Actions)
  - Client detail page stub at `/admin/clients/[clientId]`
  - `AdminClientsTable` component with status filtering
  - Admin layout with consistent header/footer styling (`src/app/(admin)/layout.tsx`)
- **Enhanced Header Component**: Improved navigation and section awareness
  - Section-specific badges (Client/Staff indicators)
  - Quick navigation links for portal and admin sections
  - Better visual hierarchy and spacing
  - Contextual information display
  - 403 Forbidden page for insufficient permissions
- **Query Functions**: `getAllClients()` in `src/queries/clients.ts` for admin use
- **Database Queries**: `qUserById` query for fetching user roles
- Client-aware invoices page at `/client` for authenticated users.
- `runQuery` function in `src/lib/client.ts` for executing GROQ queries.
- `getCurrentClient` function in `src/lib/auth.ts` to fetch client data from session.
- `qClientByUserId` query in `src/sanity/lib/queries.tsx` for fetching client by user ID.
- `getInvoicesByClient` helper in `src/queries/invoices.ts` using `qInvoicesByClient`.
- `InvoiceTable` component in `src/components/invoices/InvoiceTable.tsx` displaying invoices with required columns.
- "Invoices" link in header (`AuthStatus`) for authenticated users, directing to `/client`.
- Empty state in `InvoiceTable` when no invoices exist.
- Server-side sorting of invoices by `issueDate` desc via GROQ query.
- Error handling with `notFound()` if no client is found.
- **New Sanity Schemas**: Added schemas for Email & Payments integration
  - `serviceAsset`: Tracks client-owned assets (Discord bots, web apps) with external IDs
  - `feature`: Catalog of sellable features with pricing, SKUs, and config keys
  - `entitlement`: Links purchases to enabled features on specific assets
  - `retainer`: Optional richer subscription tracking with Stripe integration
- **New GROQ Queries**: Added queries for asset and feature management
  - `qAssetsByClient`: Fetch service assets for a specific client
  - `qFeaturesByType`: Fetch public features filtered by asset type
  - `qEntitlementsByAsset`: Fetch active entitlements for a specific asset
- **Stripe Checkout API Routes**: Added routes for payment processing
  - `/api/checkout/feature`: Creates checkout session for one-time feature purchases
  - `/api/checkout/plan`: Creates checkout session for recurring plan subscriptions
- **Stripe Webhook Handler**: Added `/api/stripe/webhook` to process payment events
  - Handles `checkout.session.completed` for feature purchases and plan subscriptions
  - Handles `invoice.payment_succeeded` for invoice status updates
  - Handles `customer.subscription.updated` for subscription changes
- **New Portal Pages**: Added asset and feature management pages
  - `/app/assets`: Lists client's service assets (Discord bots, web apps)
  - `/app/features`: Shows available features for a specific asset with purchase options
- **Updated Portal Dashboard**: Enhanced `/app` page with plan card and maintenance window
  - Added current plan display with asset management link
  - Added next maintenance window card
  - Added Assets quick link to navigation
- **Asset Config API**: Added `/api/assets/:id/config` endpoint
  - Returns feature flags object based on active entitlements
  - Enables bots/web apps to check enabled features dynamically
- **Sanity Studio Structure**: Updated content structure to include new schemas
  - Added Service Assets, Features, Entitlements, and Retainers to Business Management section
  - Added appropriate icons for each document type
- **Email Templates Admin**: Implemented complete email templates management system
  - `/admin/email-templates`: Lists all email templates with Name | Subject | Purpose | Actions columns
  - `/admin/email-templates/[id]`: Detail/edit page for individual templates
  - `EmailTemplatesTable` component for displaying templates
  - `EmailTemplateForm` component with validation for name, subject, body, and purpose fields
  - `PUT /api/admin/email-templates/[id]`: API route for saving template changes to Sanity
  - Added support for HTML body (Portable Text) alongside text body
  - Improved accessibility with better text contrast
- **Complete Email Templates CRUD**: Full create, read, update, delete functionality
  - **Create**: `/admin/email-templates/new` page with form for new templates
  - **Read**: Preview modal showing formatted email content with markdown rendering
  - **Update**: Edit existing templates with rich markdown editor (@uiw/react-md-editor)
  - **Delete**: Delete with confirmation modal and proper error handling
  - **API Endpoints**:
    - `POST /api/admin/email-templates`: Create new templates
    - `DELETE /api/admin/email-templates/[id]`: Delete templates
  - **Data Refresh**: Fixed caching issues with `runQueryFresh` for real-time updates
  - **Schema Updates**: Added `createdAt`, `lastModified` fields and proper Portable Text validation
  - **UI Enhancements**: Toast notifications, loading states, confirmation dialogs
  - **Markdown Integration**: Bidirectional conversion between markdown and Portable Text
  - **Preview Feature**: Modal preview of email templates with formatted HTML rendering
- **Complete Stripe Billing Portal Integration**: Full billing management system for clients
  - **Billing Portal Access**: `/app/plans` page with "Open Billing Portal" button
  - **Portal API Route**: `POST /api/stripe/portal` creates Stripe billing portal sessions
  - **Client Component Architecture**: `BillingPortalButton` client component for interactivity
  - **Portal Configuration**: Stripe dashboard setup for customer portal features
  - **Webhook Integration**: Real-time synchronization via Stripe webhooks
  - **Webhook Handler**: `/api/stripe/webhook` processes billing events (200 OK responses)
  - **Event Processing**: Handles `customer.subscription.updated`, `invoice.payment_succeeded`, etc.
  - **Database Synchronization**: Automatic retainer and invoice updates from Stripe events
  - **Invoice Creation**: Automatic invoice generation on successful payments with unique numbering
  - **Unique Invoice IDs**: Stripe invoice ID-based numbering format (`INV-YYYYMMDD-XXXXXX`)
  - **Success Page Fallback**: Alternative synchronization when webhooks fail
  - **Portal Features**: Update payment methods, download invoices, manage subscriptions
  - **Error Handling**: Proper error states and user feedback for portal access failures
- **Complete Client Incident Management System**: Full CRUD operations for client support incidents
  - **Incident Portal Page**: `/app/incidents` page for authenticated clients to manage their incidents
  - **IncidentManager Component**: State management and API integration for incident operations
  - **IncidentForm Component**: Form for creating new incidents with title, severity, and description fields
  - **IncidentList Component**: Table display with status indicators, action buttons, and responsive design
  - **ConfirmationModal Component**: Reusable modal for safe resolve/delete operations with proper warnings
  - **RESTful API Endpoints**: `/api/incidents` with GET/POST/PUT/DELETE methods and authentication
  - **Sanity Schema Updates**: Added `incident` schema with required fields (title, severity, status, timestamps)
  - **GROQ Queries**: `qIncidentsByClient` and `qIncidentById` for efficient data fetching
  - **UI/UX Enhancements**: Vertical button layout, disabled states for resolved incidents, toast notifications
  - **Error Handling**: Comprehensive error states, validation, and user feedback
  - **Accessibility**: Proper ARIA labels, keyboard navigation, and screen reader support
- **Admin Incident Management System**: Complete incident oversight for staff/admin users
  - **Admin Incidents Page**: `/admin/incidents` with comprehensive incident table and filtering
  - **AdminIncidentsTable Component**: Advanced table with Client | Title | Severity | Status | Timestamps | Assignee columns
  - **Inline Assignee Editing**: Click-to-edit assignee field with save/cancel functionality and API persistence
  - **Advanced Filtering**: Severity and status dropdown filters with result counts
  - **API Endpoint**: `PUT /api/admin/incidents/[id]` for assignee updates with RBAC protection
  - **Schema Enhancement**: Added `assignee` field to incident schema with preview configuration
  - **GROQ Query**: `qAllIncidents` for fetching all incidents with client name joins
  - **Query Function**: `getAllIncidents()` in `src/queries/incidents.ts` for admin data fetching
- **Enhanced Admin Dashboard**: Comprehensive overview with metrics and quick access
  - **Quick Stats Cards**: Active clients, open incidents, in-progress incidents, and critical issues counts
  - **Recent Incidents Preview**: Latest 5 incidents with status indicators and client information
  - **Navigation Links**: Direct access to incidents management and clients overview
  - **Improved Layout**: Multi-section dashboard replacing single clients table
  - **Brand Compliance**: Nile-blue color scheme and consistent styling
- **Sanity Schema Updates**: Enhanced incident management in CMS
  - **Incident Preview**: Rich preview showing client, title, severity, status, assignee, and report date
  - **Assignee Field**: String field for tracking incident assignment in incident schema
  - **TypeScript Fixes**: Resolved `any` type issues in schema prepare functions
- **Client Status Filtering Fix**: Corrected case sensitivity mismatch in admin interfaces
  - **Dashboard Calculation**: Fixed active clients count to match schema values ("Active" vs "active")
  - **AdminClientsTable**: Updated filter options and logic to use "Active", "Inactive", "Cancelled"
  - **Status Color Mapping**: Updated color coding for cancelled client status
- **Monthly Rhythm Timeline**: Complete client portal feature for viewing maintenance cycles
  - **RhythmTimeline Component**: Expandable accordion UI showing monthly maintenance entries
  - **Schema Enhancement**: Added `monthDate` field to `monthlyRhythm` schema for stable sorting
  - **Query Updates**: Modified `qMonthlyRhythmByClient` to sort newest months first using `coalesce(monthDate, _createdAt) desc`
  - **Query Helper**: Created `getMonthlyRhythmByClient()` function in `src/queries/monthlyRhythm.ts`
  - **Hours Tracking**: Visual progress bars showing hours used vs included from client plan
  - **Overage Indicators**: Red badges when hours exceed retainer limits with exact overage amounts
  - **Week Breakdown**: Expandable sections showing Week 1-4 content (Patch & Review, Observability, Hardening, Report)
  - **Portal Integration**: Updated `/app/rhythm` page with authentication and client-specific data fetching
  - **Empty State**: Proper handling when no rhythm entries exist with descriptive messaging

### Changed

- Updated `findUserByEmail` and `findUserById` in `src/lib/auth.ts` to query Sanity `user` collection.
- Removed invalid filter from `user` reference in client schema to allow associating users.
- Modified client dashboard page to display invoices instead of placeholder content.

### Fixed

- Authentication flow now properly links users to clients via session.
- Reference field in Sanity Studio for associating users to clients.

### Acceptance Criteria Status

- ✅ Invoices sorted by issueDate desc: Implemented via `qInvoicesByClient` GROQ query.
- ✅ Columns: number, status, total, preview link: All present in `InvoiceTable`.
- ✅ Empty state shown when none: Added in `InvoiceTable` component.
- ✅ No direct @sanity/client usage: Uses `runQuery` and query helpers.
- ✅ Fetch clientId from session: `getCurrentClient` uses `getSession` and fetches client by user ID.
- ✅ Use qInvoicesByClient: Yes, in `getInvoicesByClient`.
- ✅ Build InvoiceTable component: Created as client component.
- Portal layout (`src/app/(portal)/layout.tsx`) with dedicated header and footer.
- Loading and error states for client dashboard (`loading.tsx` and `error.tsx` in `src/app/(portal)/app/`).
- Brand-compliant colors using nile-blue and sandy-brown from brand-kit.
- Enhanced empty state with brand motif SVG icon.
- Plan card with features preview and modal trigger.
- Quick links section with navigation to /app/invoices, /app/incidents, /app/rhythm.
- Placeholder pages for incidents and rhythm.
- Dedicated invoices page at /app/invoices.
- **Admin Monthly Rhythm Editor**: Complete CRUD interface for managing client monthly rhythm entries
  - **Admin Route**: `/admin/clients/[id]/rhythm` page for editing monthly rhythm per client
  - **Query Enhancement**: Added `qMonthlyRhythmForClientMonth` query for fetching specific month entries
  - **Server Actions**: Created `createMonthlyRhythm` and `updateMonthlyRhythm` server actions with Sanity write operations
  - **MonthlyRhythmEditor Component**: Form component with month selection, hours tracking, and week-by-week content editing
  - **Form Validation**: Required month field, non-negative hours validation, and proper error handling
  - **Toast Notifications**: Success/error feedback using sonner for save operations
  - **Create-or-Edit Logic**: Automatically handles both creating new entries and updating existing ones
  - **RBAC Integration**: Protected under existing admin route structure with staff authentication
- **Admin Portal Monthly Rhythm Integration**: Connected rhythm editor to admin dashboard and client management
  - **Clients Table Enhancement**: Added "Rhythm" link in AdminClientsTable Actions column for quick access to rhythm editing
  - **Dashboard Rhythm Overview**: Added "Recent Monthly Rhythms" section showing latest 5 rhythm entries across all clients
  - **Rhythm Activity Stats**: Added "Active Rhythms" stat card showing current month rhythm entries
  - **Quick Access Links**: Direct links from dashboard rhythm preview to individual client rhythm editors
  - **Navigation Integration**: Seamless workflow from client table → rhythm editor with proper breadcrumbs

### Remaining Tasks

- None identified. All acceptance criteria met.
- Optional: Enhance preview page at `/app/invoice/[id]/preview` if needed beyond stub.
   
   
