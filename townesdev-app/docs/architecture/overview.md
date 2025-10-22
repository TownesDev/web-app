# Architecture Overview

## Introduction

TownesDev is a multi-tenant SaaS platform for digital service management, built with Next.js 15 and TypeScript. The platform manages Discord bots, websites, e-commerce stores, and mobile applications through a unified architecture with separate client and admin portals.

## Technology Stack

### Core Framework
- **Next.js 15.5.5** with App Router and Turbopack
- **TypeScript 5.6.2** in strict mode
- **React 19.1.0** with Server Components
- **Tailwind CSS** for styling

### Data & Backend
- **Sanity CMS** - Headless CMS with GROQ queries
- **Stripe** - Payment processing and subscriptions
- **Resend** - Transactional email service
- **Custom JWT** - Session-based authentication

### Development & Testing
- **Jest + React Testing Library** - Unit testing
- **Playwright** - End-to-end testing
- **ESLint + Prettier** - Code quality and formatting
- **Vercel** - Deployment platform

## Application Structure

### Route Groups Architecture

The application uses Next.js route groups for clean separation of concerns:

```
src/app/
├── (public)/          # Marketing pages (/, /plans, /status)
│   ├── page.tsx       # Homepage with pricing
│   ├── plans/         # Detailed pricing page
│   └── status/        # System status page
├── (portal)/          # Client dashboard (/app/*)
│   └── app/
│       ├── assets/    # Service asset management
│       ├── features/  # Feature configuration
│       ├── invoices/  # Billing history
│       └── profile/   # Account settings
├── (admin)/           # Administrative interface (/admin/*)
│   └── admin/
│       ├── clients/   # Client management
│       ├── settings/  # System configuration
│       └── invoices/  # Billing administration
└── api/               # REST API endpoints
    ├── auth/          # Authentication endpoints
    ├── stripe/        # Payment webhooks
    └── bot/           # Discord bot integration
```

### Multi-Service Architecture

The platform supports multiple digital service types:

#### Service Types
- **Discord Bots** - Server automation and moderation
- **Websites** - Frontend web applications
- **E-commerce** - Online stores with shopping cart
- **Mobile Apps** - iOS and Android applications

#### Pricing Model
- **Base Retainer** - Monthly subscription for core services
- **Asset Add-ons** - Additional services with per-asset pricing
- **Feature Purchases** - One-time feature unlocks per asset

## Data Architecture

### Sanity CMS Integration

The platform uses Sanity as a headless CMS with a structured schema:

#### Core Content Types
- `client` - Customer accounts and profiles
- `serviceAsset` - Digital services (bots, websites, etc.)
- `plan` - Subscription tiers and pricing
- `feature` - Purchasable add-on features
- `entitlement` - Customer feature access records
- `invoice` - Billing and payment history

#### Query Patterns
- **Route-specific clients** for optimal caching
- **Server-only data fetching** for security
- **Preview mode** for content management

### Authentication & Sessions

#### Session Management
- **JWT-based sessions** stored in HTTP-only cookies
- **Role-based access control** (admin, staff, client, user)
- **Capability-based permissions** for granular access

#### Security Features
- **Server-only authentication** helpers
- **Route protection** with middleware
- **Session validation** on every request

## Performance Architecture

### Caching Strategy

The platform implements a three-tier caching strategy:

#### Public Routes (Marketing)
- **Static Site Generation** with 1-hour revalidation
- **CDN optimization** for global performance
- **Shared bundle optimization** for common code

#### Portal Routes (Client Dashboard)
- **Server-Side Rendering** with no caching
- **Fresh data guarantee** for user-sensitive information
- **Route-specific bundles** for code splitting

#### Admin Routes (Administration)
- **Server-Side Rendering** with no caching
- **Real-time data** for administrative operations
- **Isolated bundles** for security separation

### Bundle Optimization

#### Code Splitting Strategy
- **Route group isolation** - Separate bundles per portal
- **Dynamic imports** - Heavy dependencies loaded on-demand
- **Tree shaking** - Unused code elimination
- **Shared bundle** - Optimized to 137kB core size

#### Performance Results
- **24.8% bundle reduction** through route-specific clients
- **Optimal loading** - Only required code per route
- **CDN delivery** - Public content served globally

## Deployment Architecture

### Environment Configuration
- **Multi-environment support** (development, staging, production)
- **Environment variable validation** at runtime
- **Secure token management** with server-only access

### Vercel Integration
- **Automatic deployments** from Git branches
- **Preview deployments** for pull requests
- **Edge functions** for API routes
- **Global CDN** for static assets

## Security Considerations

### Data Protection
- **Server-only tokens** - No client-side exposure
- **Route-based isolation** - Portal separation
- **Fresh data fetching** - No cache contamination
- **Session validation** - Every request verified

### API Security
- **Webhook validation** - Stripe signature verification
- **Rate limiting** - Protection against abuse
- **CORS configuration** - Controlled cross-origin access
- **Environment isolation** - Secure variable management

## Development Patterns

### Code Organization
- **Absolute imports** with `src/` prefix
- **Feature-based grouping** for related functionality
- **Shared utilities** in `lib/` directory
- **Type safety** with strict TypeScript

### Query Helpers
- **Route-specific clients** - `runPublicQuery`, `runPortalQuery`, `runAdminQuery`
- **Cached vs fresh** - Optimal for each use case
- **Error handling** - Comprehensive try/catch patterns
- **Type generation** - Sanity schema to TypeScript

This architecture provides a scalable, secure, and performant foundation for the multi-service platform while maintaining clear separation of concerns and optimal user experience.