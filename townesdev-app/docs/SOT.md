# Source of Truth (SOT) - TownesDev Platform

**Last Updated**: November 4, 2025  
**Maintainer**: Primary Developer + AI Agents  
**Purpose**: Single authoritative reference for platform architecture, patterns, and decisions

---

## What is This Document?

This is the **Source of Truth** for TownesDev - a multi-tenant SaaS platform for digital service management. When code and documentation conflict, this document (and the architecture docs it references) are authoritative.

**For the next 30-40 years**, this SOT will guide:

- Solo developer making decisions
- AI coding agents making changes
- Future maintainers understanding the system
- Audits ensuring architectural integrity

---

## Core Principles

### 1. Multi-Tenant Architecture

**Pattern**: Route-based isolation with shared backend

```
(public)/     → Marketing, anonymous access
(portal)/     → Client dashboard, authenticated
(admin)/      → Admin tools, elevated permissions
```

**Never**: Mix portal and admin logic. Keep route groups isolated.

**Rationale**: Security, code splitting, performance optimization

**Reference**: [Route Groups Architecture](./architecture/route-groups.md)

### 2. Data Layer: Sanity CMS

**Pattern**: Route-specific clients for optimal caching

```typescript
// Public routes (CDN cached)
runPublicQuery(query, params) // 1hr revalidation

// Portal routes (always fresh)
runPortalQuery(query, params) // noStore()

// Admin routes (always fresh)
runAdminQuery(query, params) // noStore()
```

**Never**: Use direct `@sanity/client` imports. Always use helpers.

**Rationale**: Consistent caching, security, performance

**Reference**: [Data Layer Patterns](./architecture/data-layer.md)

### 3. Authentication & RBAC

**Pattern**: JWT sessions + capability-based access control

```typescript
// Get session (server-only)
const session = await getSession()

// Require authentication
const user = await requireAuth()

// Check permissions
await requireCapability('clients:read')
```

**Never**: Expose auth tokens to client-side. Never skip RBAC checks.

**Rationale**: Security, multi-tenant isolation, audit trail

**Reference**: [Auth & RBAC](./architecture/auth.md)

### 4. Payment Integration

**Pattern**: Stripe webhooks with idempotent handlers

```typescript
// Webhook uses stripeEvent docs for deduplication
const docId = `stripeEvent.${event.id}`
await sanityWrite.mutate([{ createIfNotExists: { _id: docId, ...} }])
```

**Never**: Process payments without webhook verification. Never skip duplicate checks.

**Rationale**: Reliability, audit trail, idempotency

**Reference**: [Payment Integration](./architecture/payments.md)

---

## Technology Stack

### Core Framework

- **Next.js 15**: App Router, React Server Components
- **TypeScript**: Strict mode enabled
- **React 18**: Server + Client Components

**Why**: Modern, performant, excellent DX, long-term support

### Data & Auth

- **Sanity CMS**: Content + application data
- **Custom JWT**: Session management
- **Zod**: Runtime validation

**Why**: Flexibility, developer experience, type safety

### Payments & Email

- **Stripe**: Billing, subscriptions, webhooks
- **Resend**: Transactional email with templates

**Why**: Industry standard, reliable, excellent APIs

### Testing & Quality

- **Jest**: Unit and integration tests
- **Playwright**: End-to-end testing
- **ESLint + Prettier**: Code quality
- **TypeScript**: Compile-time safety

**Why**: Comprehensive coverage, industry standard tools

---

## File Structure Conventions

### Application Code

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/          # Marketing, no auth
│   ├── (portal)/          # Client dashboard
│   ├── (admin)/           # Admin tools
│   └── api/               # API routes
├── components/            # Reusable React components
├── lib/                   # Utilities, helpers
│   ├── client.ts          # ✅ SOT: Sanity client helpers
│   ├── session.ts         # ✅ SOT: Auth session management
│   ├── auth.ts            # ✅ SOT: Authentication logic
│   └── rbac/              # ✅ SOT: Role-based access control
├── queries/               # Sanity GROQ queries
├── sanity/                # Sanity CMS configuration
│   └── schemaTypes/       # ✅ SOT: Data schemas
└── styles/                # Global styles
```

**Legend**:

- ✅ SOT: Critical file - changes require review
- Regular: Standard development files

### Documentation

```
docs/
├── architecture/          # ✅ SOT: System design
├── setup/                 # Getting started guides
├── guides/                # Operational runbooks
├── development/           # Dev-specific docs
├── audit/                 # Historical checkpoints
│   └── _archived/         # Completed audits
└── accessibility/         # A11y documentation
```

---

## Naming Conventions

### Files

```
PascalCase.tsx         # React components
camelCase.ts           # Utilities, helpers
kebab-case.md          # Documentation
route.ts               # Next.js API routes
page.tsx               # Next.js pages
layout.tsx             # Next.js layouts
```

### Code

```typescript
// Components
export function ClientDashboard() {}

// Hooks
export function useClientData() {}

// Utilities
export function formatCurrency() {}

// Constants
export const MAX_UPLOAD_SIZE = 5MB

// Types/Interfaces
interface ClientData {}
type UserRole = 'admin' | 'staff' | 'client'
```

### Sanity

```typescript
// Document types
client, serviceAsset, feature, plan

// Query helpers
qClientsByUser, qAssetsForClient

// Schema fields
camelCase (e.g., firstName, onboardingStatus)
```

---

## Critical Patterns to Maintain

### 1. Error Handling

**Pattern**: Try-catch with structured logging

```typescript
try {
  const data = await runQuery(query, params)
  if (!data) {
    return { error: 'Not found' }
  }
  return { data }
} catch (error) {
  logError('operation.failed', {
    error: String(error),
    context: { params },
  })
  return { error: 'Operation failed' }
}
```

**Never**: Silent failures, unhandled promises

### 2. Input Validation

**Pattern**: Zod schemas at API boundaries

```typescript
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
})

const result = schema.safeParse(input)
if (!result.success) {
  return { error: result.error.flatten() }
}
```

**Never**: Trust user input, skip validation

### 3. Type Safety

**Pattern**: Strict TypeScript, no `any`

```typescript
// ✅ Good
interface Client {
  _id: string
  name: string
  email: string
}

const client = await runQuery<Client>(query)

// ❌ Bad
const client: any = await runQuery(query)
```

**Never**: Use `any`, `@ts-ignore`, or bypass types

### 4. RBAC Guards

**Pattern**: Check permissions before operations

```typescript
// In API route
await requireCapability('clients:write')

// In component (server)
const session = await getSession()
const hasAccess = session.capabilities.includes('clients:read')
```

**Never**: Skip permission checks, assume access

---

## Data Model Patterns

### Document Structure

```typescript
// All documents have these base fields
{
  _id: string // Unique identifier
  _type: string // Document type
  _createdAt: string // ISO timestamp
  _updatedAt: string // ISO timestamp
}
```

### Common Patterns

```typescript
// References
{
  client: {
    _type: 'reference',
    _ref: 'client.abc123'
  }
}

// Arrays
features: ['feature1', 'feature2']

// Nested objects
metadata: {
    key: 'value',
    timestamp: '2025-11-04T...'
}
```

### Status Fields

Standard status enumerations:

```typescript
// Service assets
status: 'active' | 'inactive' | 'archived'

// Projects
status: 'draft' | 'provisioning' | 'ready' | 'live' | 'archived'

// Onboarding
onboardingStatus: 'not_started' | 'in_progress' | 'completed'

// Webhooks
status: 'processing' | 'success' | 'failed'
```

---

## Performance Patterns

### 1. Route-Based Code Splitting

**Automatic**: Next.js splits by route groups

```
Public bundle:   No Sanity CMS, minimal JS
Portal bundle:   Portal-specific code
Admin bundle:    Admin-specific code
```

**Result**: 24.8% bundle size reduction achieved

### 2. Caching Strategy

**Public**: 1-hour ISR with CDN
**Portal**: No caching (fresh user data)
**Admin**: No caching (fresh admin data)

**Reference**: [Caching Strategy](./architecture/caching.md)

### 3. Server Components by Default

```typescript
// ✅ Default: Server Component
export default async function Page() {
  const data = await runQuery(query)
  return <Display data={data} />
}

// Only add 'use client' when needed
'use client'
export function InteractiveWidget() {}
```

---

## Security Patterns

### 1. Server-Only Secrets

```typescript
// ✅ Server-only
process.env.SANITY_AUTH_TOKEN
process.env.STRIPE_SECRET_KEY

// ✅ Public (safe to expose)
process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

**Never**: Expose auth tokens or API keys to client

### 2. Input Sanitization

```typescript
// Validate before using in queries
const id = z.string().uuid().parse(input.id)

// Escape for GROQ
const safe = param.replace(/[^a-zA-Z0-9-]/g, '')
```

### 3. CORS & CSRF

```typescript
// API routes validate origin
const origin = request.headers.get('origin')
if (!isAllowedOrigin(origin)) {
  return new Response('Forbidden', { status: 403 })
}
```

---

## Testing Patterns

### Unit Tests

```typescript
// Test utilities and queries
describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1000)).toBe('$10.00')
  })
})
```

### Integration Tests

```typescript
// Test API routes with mocks
describe('POST /api/clients', () => {
  it('creates client with valid data', async () => {
    const response = await POST(mockRequest)
    expect(response.status).toBe(201)
  })
})
```

### E2E Tests

```typescript
// Test user flows with Playwright
test('user can complete onboarding', async ({ page }) => {
  await page.goto('/app/onboarding')
  await page.fill('[name="email"]', 'test@example.com')
  // ... complete flow
})
```

**Coverage Target**: >80% for critical paths

---

## Deployment Architecture

### Hosting

- **Platform**: Vercel
- **Region**: US East (primary)
- **CDN**: Vercel Edge Network

### Environment Strategy

```
Development  → Local (.env.local)
Preview      → Vercel preview branches
Production   → Vercel production (main branch)
```

### Required Environment Variables

See [Environment Configuration](./setup/environment.md) for complete list.

Critical:

- `SANITY_AUTH_TOKEN` (write operations)
- `SANITY_READ_TOKEN` (read operations)
- `STRIPE_SECRET_KEY` (payments)
- `STRIPE_WEBHOOK_SECRET` (webhook verification)
- `JWT_SECRET` (session signing)

---

## Change Management

### When to Update SOT

1. **Architecture changes** - New patterns adopted
2. **Technology changes** - Stack updates
3. **Breaking changes** - Backward incompatible updates
4. **Pattern evolution** - Better practices discovered

### How to Update SOT

1. Discuss change with team (or solo dev + AI agents)
2. Update relevant architecture docs
3. Update this SOT document
4. Add to `CHANGELOG.md`
5. Communicate to all agents

### Version History

| Date       | Version | Changes                      |
| ---------- | ------- | ---------------------------- |
| 2025-11-04 | 1.0     | Initial SOT document created |

---

## Common Pitfalls (Learn from Mistakes)

### ❌ Avoid These

1. **Direct Sanity client usage** - Always use query helpers
2. **Client-side auth tokens** - Keep tokens server-only
3. **Skipping RBAC** - Always check permissions
4. **Hardcoded values** - Use environment variables
5. **Any types** - Use proper TypeScript types
6. **Silent failures** - Always handle and log errors
7. **Unvalidated input** - Validate with Zod schemas
8. **Missing tests** - Test critical paths

---

## Quick Decision Tree

### Should I add a new dependency?

1. Is it actively maintained? (updates in last 6 months)
2. Does it have TypeScript types?
3. Is bundle size acceptable? (&lt;100KB added)
4. Are there existing alternatives in the stack?
5. Is long-term support likely?

**If all yes**: Propose to human, document rationale

### Should I modify schema?

1. Is this a breaking change? → Human approval required
2. Can it be backward compatible? → Add optional field
3. Does it affect existing data? → Migration plan needed
4. Is it documented? → Update schema docs

**Always**: Get human approval for schema changes

### Should I change architecture docs?

**No.** Create proposal in `docs/proposals/` instead.

### Should I bypass tests?

**Never.** Fix the root cause.

---

## SOT Maintenance Schedule

### Weekly

- [ ] Review open PRs for SOT violations
- [ ] Check test coverage hasn't degraded
- [ ] Verify docs match code reality

### Monthly

- [ ] Review architecture docs for accuracy
- [ ] Update "Last Updated" dates
- [ ] Check for deprecated patterns in use

### Quarterly

- [ ] Full docs audit (like this one!)
- [ ] Dependency updates review
- [ ] Security audit
- [ ] Performance benchmarks

### Annually

- [ ] Major version planning
- [ ] Technology stack review
- [ ] Long-term roadmap update
- [ ] SOT document comprehensive review

---

## Emergency Contacts

### When Things Break

1. **Check**: Recent changes (git log)
2. **Revert**: Last known good state
3. **Investigate**: Error logs (Vercel dashboard)
4. **Fix**: Root cause, not symptoms
5. **Test**: Full test suite before redeploying
6. **Document**: Add to runbook if new pattern

### Critical Systems

| System          | Monitoring       | Runbook                                                |
| --------------- | ---------------- | ------------------------------------------------------ |
| Stripe Webhooks | Stripe Dashboard | [Webhook Runbook](./guides/stripe-webhooks-runbook.md) |
| Sanity CMS      | Sanity Manage    | [Sanity Setup](./setup/sanity.md)                      |
| Authentication  | Error logs       | [Auth Architecture](./architecture/auth.md)            |
| Deployment      | Vercel Dashboard | [Deployment Guide](./setup/deployment.md)              |

---

## Final Word

This platform is built to last 30-40 years. Every decision should consider:

1. **Maintainability**: Can future dev (human or AI) understand this?
2. **Scalability**: Will this pattern work at 10x scale?
3. **Security**: Are we protecting user data?
4. **Reliability**: Can we recover from failures?
5. **Documentation**: Is this pattern documented?

**When in doubt, favor boring technology and clear patterns over clever solutions.**

**The SOT is sacred. Protect it.**

---

**Document Version**: 1.0  
**Next Review**: 2026-02-04 (Quarterly)  
**Maintained By**: Primary Developer + AI Agents  
**Questions**: See [AI Agent Guidelines](./development/ai-agents.md)
