# Caching Strategy

## Overview

TownesDev implements a comprehensive caching strategy optimized for performance while maintaining data freshness and security across different user contexts.

## Route-Specific Client Architecture

### Public Client (`src/lib/public/client.ts`)

**Purpose**: Marketing and public pages  
**CDN**: Enabled for global performance  
**Caching**: Works with Next.js ISR and revalidation

```typescript
export const publicSanity = createClient({
  useCdn: true, // Optimal for public cached content
  perspective: 'published',
})

export async function runPublicQuery(query, params, preview) {
  // Uses default Next.js caching with route-level revalidation
}
```

### Portal Client (`src/lib/portal/client.ts`)

**Purpose**: User-specific dashboard data  
**CDN**: Disabled for fresh data  
**Caching**: Always bypassed with `noStore()`

```typescript
export const portalSanity = createClient({
  useCdn: false, // Always fresh for user data
  token: process.env.SANITY_READ_TOKEN,
})

export async function runPortalQuery(query, params, preview) {
  noStore() // Ensure no caching for user-sensitive data
}
```

### Admin Client (`src/lib/admin/client.ts`)

**Purpose**: Administrative operations  
**CDN**: Disabled for fresh data  
**Caching**: Always bypassed with `noStore()`

```typescript
export const adminSanity = createClient({
  useCdn: false, // Always fresh for admin data
  token: process.env.SANITY_READ_TOKEN,
})

export async function runAdminQuery(query, params, preview) {
  noStore() // Ensure no caching for admin-sensitive data
}
```

## Caching Strategies by Route Group

### Public Routes (`(public)`)

- **Strategy**: Static Site Generation (SSG) with Incremental Static Regeneration (ISR)
- **Revalidation**: 1 hour (`export const revalidate = 3600`)
- **CDN**: Enabled for global distribution
- **Use Case**: Marketing content that changes infrequently

**Routes**:
- `/` - Homepage with plans
- `/plans` - Pricing page
- `/status` - System status
- `/brand` - Brand guidelines

### Portal Routes (`(portal)`)

- **Strategy**: Server-Side Rendering (SSR) with no caching
- **Revalidation**: None (always fresh)
- **CDN**: Disabled
- **Use Case**: User-specific sensitive data

**Routes**:
- `/app/assets` - User's service assets
- `/app/entitlements` - User's subscriptions and purchases
- `/app/features` - Asset-specific feature management
- `/app/invoices` - User's billing history

### Admin Routes (`(admin)`)

- **Strategy**: Server-Side Rendering (SSR) with no caching
- **Revalidation**: None (always fresh)
- **CDN**: Disabled
- **Use Case**: Administrative sensitive data

**Routes**:
- `/admin/clients` - Client management
- `/admin/settings` - System configuration
- `/admin/email-templates` - Email template management
- `/admin/invoices` - Billing administration

## Implementation Details

### Revalidation Configuration

Public pages include explicit revalidation timers:

```typescript
// Public pages
export const revalidate = 3600 // 1 hour for marketing content

// Portal/Admin pages
// No revalidation export = always dynamic
```

### Cache Bypassing

Private pages use `noStore()` to ensure fresh data:

```typescript
import { unstable_noStore as noStore } from 'next/cache'

export async function runPortalQuery(query, params, preview) {
  noStore() // Bypasses all caching layers
  return client.fetch(query, params)
}
```

### Build Verification

The build output confirms our strategy:

- **Static (○)**: Public brand guidelines with revalidation
- **Dynamic (ƒ)**: All portal and admin routes (no caching)
- **Performance**: 137kB shared bundle optimized across route groups

## Performance Benefits

### Optimized Public Pages

- **CDN Distribution**: Public content served from global edge locations
- **Reduced Server Load**: Marketing pages cached for 1 hour
- **Fast Time to First Byte**: Pre-rendered static content

### Secure Private Data

- **No Cache Pollution**: User data never cached or shared
- **Fresh Authentication**: Session data always current
- **Data Privacy**: User-specific content always fresh

### Bundle Optimization

- **Route Isolation**: Each route group loads only required code
- **Reduced Shared Bundle**: Minimal code shared between route groups
- **Dynamic Imports**: Heavy dependencies loaded on-demand

## Migration Notes

### From Generic Client

The previous `runQuery` and `runQueryNoCache` functions have been replaced with route-specific clients:

- `runQuery` → `runPublicQuery` (public routes)
- `runQuery` → `runPortalQuery` (portal routes)
- `runQueryNoCache` → `runAdminQuery` (admin routes)

### Legacy Compatibility

The admin client maintains a `runQueryNoCache` alias for backward compatibility during transition periods.

## Best Practices

1. **Route-Specific Imports**: Always import from the appropriate route client
2. **Revalidation Timing**: Use 1-hour revalidation for marketing content
3. **No Portal Caching**: Never cache user-specific data
4. **CDN Optimization**: Enable CDN only for public content
5. **Build Verification**: Check build output for correct static/dynamic routing

## Monitoring

### Performance Metrics

- **Core Web Vitals**: Monitor public page performance
- **Cache Hit Rates**: Track CDN effectiveness
- **Build Times**: Ensure static generation remains fast

### Security Considerations

- **Data Isolation**: User data never cached
- **Token Security**: Read tokens only in server-side clients
- **Session Freshness**: Authentication always current