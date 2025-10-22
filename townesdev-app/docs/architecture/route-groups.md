# Route Groups Architecture

## Overview

TownesDev uses Next.js route groups to create isolated portals with distinct user experiences, security contexts, and bundle optimization. This architecture provides clean separation between public marketing, client dashboard, and admin interfaces.

## Route Group Structure

```
src/app/
├── (public)/          # Public marketing pages
├── (portal)/          # Client dashboard (/app/*)
├── (admin)/           # Admin interface (/admin/*)
└── api/               # Shared API routes
```

## Public Routes `(public)`

### Purpose
Marketing and informational pages accessible to all users.

### Route Structure
```
(public)/
├── page.tsx           # Homepage with pricing overview
├── plans/             # Detailed pricing and plans
│   └── page.tsx
├── status/            # System status page
│   └── page.tsx
└── layout.tsx         # Public layout with navigation
```

### Key Features
- **SEO Optimized**: Static generation with meta tags
- **Performance**: CDN delivery with 1-hour revalidation
- **Responsive Design**: Mobile-first responsive layouts
- **Brand Consistency**: Unified design system

### URL Pattern
- `/` - Homepage
- `/plans` - Pricing page
- `/status` - System status

## Portal Routes `(portal)`

### Purpose
Client dashboard for managing digital services and subscriptions.

### Route Structure
```
(portal)/
└── app/
    ├── page.tsx           # Dashboard overview
    ├── assets/            # Service asset management
    │   └── page.tsx
    ├── features/          # Feature configuration
    │   └── page.tsx
    ├── entitlements/      # Subscription management
    │   └── page.tsx
    ├── invoices/          # Billing history
    │   └── page.tsx
    ├── profile/           # Account settings
    │   └── page.tsx
    └── layout.tsx         # Portal layout with sidebar
```

### Key Features
- **Authentication Required**: All routes protected
- **User-Specific Data**: Personalized content
- **Real-Time Updates**: Fresh data on every request
- **Service Management**: Multi-service asset support

### URL Pattern
- `/app` - Dashboard
- `/app/assets` - Asset management
- `/app/features?asset=:id` - Feature configuration
- `/app/entitlements` - Subscription details
- `/app/invoices` - Billing history

## Admin Routes `(admin)`

### Purpose
Administrative interface for platform management and client oversight.

### Route Structure
```
(admin)/
└── admin/
    ├── page.tsx           # Admin dashboard
    ├── clients/           # Client management
    │   ├── page.tsx
    │   └── [clientId]/
    │       ├── page.tsx
    │       └── rhythm/
    │           └── page.tsx
    ├── settings/          # System configuration
    │   └── page.tsx
    ├── email-templates/   # Email management
    │   ├── page.tsx
    │   ├── [id]/
    │   │   └── page.tsx
    │   └── new/
    │       └── page.tsx
    ├── invoices/          # Billing administration
    │   └── page.tsx
    └── layout.tsx         # Admin layout with navigation
```

### Key Features
- **Role-Based Access**: Admin permissions required
- **System Management**: Platform configuration
- **Client Oversight**: Multi-tenant administration
- **Advanced Tools**: Email templates, billing, analytics

### URL Pattern
- `/admin` - Admin dashboard
- `/admin/clients` - Client management
- `/admin/clients/:id` - Client details
- `/admin/settings` - System configuration
- `/admin/email-templates` - Email management

## Security Architecture

### Access Control

#### Public Routes
- **Open Access**: No authentication required
- **Rate Limiting**: Basic protection against abuse
- **Content Security**: Static content only

#### Portal Routes
- **Client Authentication**: Valid session required
- **User Context**: Data filtered by client ownership
- **Fresh Data**: No caching to prevent data leakage

#### Admin Routes
- **Admin Authentication**: Admin role required
- **Elevated Permissions**: Full system access
- **Audit Logging**: Administrative actions tracked

### Authentication Flow

```typescript
// Middleware protection
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public routes - no auth required
  if (pathname.startsWith('/(public)')) {
    return NextResponse.next()
  }
  
  // Portal routes - client auth required
  if (pathname.startsWith('/app')) {
    const session = await getSession(request)
    if (!session?.user) {
      return redirect('/auth/signin')
    }
  }
  
  // Admin routes - admin role required
  if (pathname.startsWith('/admin')) {
    const session = await getSession(request)
    if (!session?.user || session.user.role !== 'admin') {
      return redirect('/403')
    }
  }
}
```

## Bundle Optimization

### Route-Specific Bundles

Each route group loads only its required dependencies:

#### Public Bundle
- **Shared Core**: 137kB base bundle
- **Marketing Components**: Homepage, pricing, status
- **Static Assets**: Images, fonts, icons
- **CDN Optimized**: Global edge delivery

#### Portal Bundle
- **Client Components**: Dashboard, asset management
- **User Interface**: Tables, forms, modals
- **Dynamic Loading**: Feature-specific code
- **Authentication**: Session management

#### Admin Bundle
- **Admin Components**: Client management, settings
- **Advanced UI**: Data tables, configuration forms
- **Management Tools**: Email templates, analytics
- **Isolated Security**: Admin-only code

### Code Splitting Strategy

```typescript
// Dynamic imports for heavy components
const AssetManager = dynamic(() => import('./AssetManager'), {
  loading: () => <LoadingSpinner />,
  ssr: false
})

// Route-specific client imports
import { runPortalQuery } from '@/lib/portal/client'  // Portal only
import { runAdminQuery } from '@/lib/admin/client'    // Admin only
import { runPublicQuery } from '@/lib/public/client'  // Public only
```

## Layout Architecture

### Shared Elements

#### Root Layout (`app/layout.tsx`)
- **Global Styles**: Tailwind CSS, fonts
- **Meta Tags**: SEO configuration
- **Providers**: Context providers
- **Analytics**: Tracking scripts

#### Route Group Layouts

```typescript
// Public Layout - Marketing navigation
export default function PublicLayout({ children }) {
  return (
    <div className="public-layout">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  )
}

// Portal Layout - Client sidebar
export default function PortalLayout({ children }) {
  return (
    <div className="portal-layout">
      <ClientSidebar />
      <main className="portal-content">{children}</main>
    </div>
  )
}

// Admin Layout - Admin navigation
export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">{children}</main>
    </div>
  )
}
```

## Data Fetching Patterns

### Route-Specific Queries

Each route group uses optimized data fetching:

```typescript
// Public: Cached marketing content
export const revalidate = 3600 // 1 hour
const plans = await runPublicQuery(qPlans)

// Portal: Fresh user data
const assets = await runPortalQuery(qAssetsByClient, { clientId })

// Admin: Fresh admin data
const clients = await runAdminQuery(qAllClients)
```

### Error Boundaries

Route-specific error handling:

```typescript
// Portal error boundary
export default function PortalError({ error, reset }) {
  return (
    <div className="portal-error">
      <h2>Dashboard Error</h2>
      <p>Unable to load your dashboard data.</p>
      <button onClick={reset}>Try Again</button>
    </div>
  )
}
```

## Development Guidelines

### Adding New Routes

1. **Choose Route Group**: Determine appropriate portal
2. **Create Page Component**: Follow naming conventions
3. **Add Authentication**: Apply proper protection
4. **Use Route Client**: Import correct data fetching client
5. **Update Navigation**: Add to appropriate sidebar/header

### Best Practices

1. **Route Isolation**: Keep portal-specific code separate
2. **Authentication First**: Always check user context
3. **Performance**: Use appropriate caching strategy
4. **Security**: Never expose sensitive data across portals
5. **Testing**: Include route-specific test scenarios

### Common Patterns

```typescript
// Portal page pattern
export default async function PortalPage() {
  const client = await getCurrentClient()
  if (!client) redirect('/auth/signin')
  
  const data = await runPortalQuery(query, { clientId: client._id })
  return <PortalContent data={data} />
}

// Admin page pattern
export default async function AdminPage() {
  await requireAdmin() // Throws if not admin
  
  const data = await runAdminQuery(query)
  return <AdminContent data={data} />
}
```

This route group architecture provides scalable separation of concerns while maintaining optimal performance and security for each user context.