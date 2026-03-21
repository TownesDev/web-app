# Authentication & RBAC

Last updated: 2025-11-10

## Overview

TownesDev uses a custom JWT-based authentication system with Role-Based Access Control (RBAC) and capability-based authorization. All authentication logic is server-side only, with tokens stored in HTTP-only cookies.

## Authentication Flow

### Token Generation & Storage

1. **User Authentication** (`src/lib/auth.ts`):
   - Passwords are hashed using bcrypt (12 rounds)
   - JWT tokens are generated with 7-day expiration
   - Tokens contain: `{ id, email, name }`
   - Tokens are signed with `JWT_SECRET` environment variable

2. **Token Storage**:
   - Stored in HTTP-only cookies named `auth-token`
   - Never exposed to client-side JavaScript
   - Automatically sent with requests

3. **Session Retrieval** (`src/lib/session.ts`):

   ```typescript
   // Server components only
   const session = await getSession()
   // Returns: { id, email, name, role } | null
   ```

### Middleware Protection

Edge runtime middleware (`middleware.ts`) protects routes:

- **Protected Routes**: `/admin/*` and `/app/*`
- **Exempt Routes**: `/admin/studio` (for content editors)
- **Verification**: Uses jose library for Edge runtime compatibility
- **Redirects**: Unauthenticated users → `/auth/signin`

### Onboarding & Billing Gates

Portal routes (`/app/*`) enforce additional checks:

- **Onboarding Required**: Users must complete onboarding before accessing portal
- **Active Subscription**: Completed users need active subscription
- **Exempt Paths**: `/app/onboarding`, `/app/plans`
- Redirects based on `onboardingStatus` and `hasActiveSubscription` from Sanity

## Role-Based Access Control (RBAC)

### User Roles

Four hierarchical roles defined in `src/lib/rbac/types.ts`:

| Role     | Description        | Access Level                      |
| -------- | ------------------ | --------------------------------- |
| `admin`  | Full system access | All capabilities                  |
| `staff`  | Team members       | Client/invoice/content management |
| `client` | Paying customers   | Own data only (read-only)         |
| `user`   | Basic accounts     | No special capabilities           |

### Capabilities System

Capabilities are granular permissions mapped to roles in `src/lib/rbac/util.ts`:

#### Client Management

- `clients:read` - View client data
- `clients:write` - Create/edit clients

#### Invoice Management

- `invoices:read` - View invoices
- `invoices:write` - Create/edit invoices

#### Reporting

- `reports:read` - View reports
- `reports:generate` - Generate new reports

#### Content Management

- `content:read` - View CMS content
- `content:write` - Edit CMS content

#### System Administration

- `system:read` - View system settings
- `system:write` - Modify system settings

#### Bot Platform (Multi-tenant SaaS)

- `bot:tenants:provision` - Create new bot tenants
- `bot:tenants:manage` - Manage tenant settings
- `bot:assets:register` - Register bot assets
- `bot:assets:manage` - Manage bot assets
- `bot:features:toggle` - Enable/disable features

### Role-Capability Mapping

```typescript
// From src/lib/rbac/util.ts
ROLE_CAPABILITIES = {
  admin: [
    /* all capabilities */
  ],
  staff: [
    /* client/invoice/content/bot management */
  ],
  client: ['clients:read', 'invoices:read', 'reports:read'],
  user: [], // No special capabilities
}
```

## Authorization Guards

### Server Component Guards

Located in `src/lib/rbac/guards.ts`:

#### 1. Basic Authentication

```typescript
// Require any authenticated user
const user = await requireAuth()
// Redirects to /auth/signin if not authenticated
```

#### 2. Staff-Only Access

```typescript
// Require admin or staff role
const user = await requireStaff()
// Redirects to /403 if not staff
```

#### 3. Capability-Based Access

```typescript
// Require specific capability
const user = await requireCapability('invoices:write')
// Throws AccessControlError if unauthorized
```

#### 4. Non-Throwing Checks

```typescript
// Check without throwing
const isStaff = await isCurrentUserStaff()
const canManageClients = await hasCapability('clients:write')
// Returns boolean
```

### Error Handling

```typescript
interface AccessControlError extends Error {
  code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND'
  requiredCapability?: Capability
  userRole?: UserRole
}
```

## Implementation Patterns

### Server Components (Recommended)

```typescript
// app/(admin)/admin/clients/page.tsx
export default async function ClientsPage() {
  // Enforce capability at page level
  await requireCapability('clients:read')

  const clients = await runQuery(qClients)
  return <ClientsList clients={clients} />
}
```

### API Routes

```typescript
// app/api/invoices/route.ts
export async function POST(request: Request) {
  try {
    await requireCapability('invoices:write')
    // ... handle invoice creation
  } catch (error) {
    if (error.code === 'FORBIDDEN') {
      return new Response('Unauthorized', { status: 403 })
    }
    return new Response('Unauthorized', { status: 401 })
  }
}
```

### Conditional Rendering

```typescript
// Show admin features only to staff
const isStaff = await isCurrentUserStaff()
return (
  <div>
    <UserContent />
    {isStaff && <AdminPanel />}
  </div>
)
```

## Security Best Practices

### ✅ DO

- Use `requireCapability()` for fine-grained access control
- Use `requireStaff()` for admin-only pages
- Keep all auth logic server-side (Server Components, API Routes)
- Use `runQuery()` helpers instead of direct Sanity client
- Store sensitive tokens in environment variables
- Use HTTP-only cookies for session tokens

### ❌ AVOID

- Client-side token storage (localStorage, sessionStorage)
- Exposing JWT secrets or Sanity tokens
- Direct `@sanity/client` imports (use `runQuery()` helpers)
- Role checks without capability verification
- Bypassing middleware protection

## Data Layer Integration

### User Queries

```typescript
// src/sanity/lib/queries.ts
qUserById = `*[_type == "user" && _id == $id][0]{
  _id, email, name, role
}`
```

### Session Verification

1. Extract token from HTTP-only cookie
2. Verify JWT signature
3. Query Sanity to confirm user exists and get role
4. Return `SessionUser` with current role

This ensures role changes take effect immediately without requiring re-login.

## Environment Variables

Required server-side variables:

- `JWT_SECRET` - JWT signing key (never expose to client)
- `SANITY_READ_TOKEN` - Sanity API token for middleware
- `SANITY_AUTH_TOKEN` - Sanity write token for user management

## Testing Considerations

- Mock `getSession()` in unit tests
- Use test users with specific roles for E2E tests
- Verify RBAC guards with different role scenarios
- Test middleware redirects for protected routes

## Related Documentation

- `src/lib/session.ts` - Session management
- `src/lib/auth.ts` - Token generation and verification
- `src/lib/rbac/guards.ts` - Authorization guards
- `src/lib/rbac/types.ts` - Role and capability types
- `src/lib/rbac/util.ts` - Role-capability mapping
- `middleware.ts` - Edge runtime route protection
