# Data Layer Architecture

## Overview

TownesDev uses Sanity CMS as a headless content management system with GROQ queries for efficient data fetching. The data layer implements route-specific clients for optimal caching and security.

## Sanity CMS Integration

### Schema Design

The platform uses a structured content schema:

```typescript
// Core entity types
;-client - // Customer accounts and profiles
  serviceAsset - // Digital services (bots, websites, etc.)
  plan - // Subscription tiers and pricing
  feature - // Purchasable add-on features
  entitlement - // Customer feature access records
  invoice - // Billing and payment history
  incident // Support tickets and issues
```

### Query Patterns

#### GROQ Query Structure

```groq
// Example: Get client assets with features
*[_type=="serviceAsset" && client._ref==$clientId] {
  _id,
  name,
  type,
  status,
  externalIds,
  features[]->{
    _id,
    name,
    price,
    sku
  }
}
```

#### Query Helpers

Centralized query definitions in `src/queries/`:

```typescript
// src/queries/assets.ts
export const qAssetsByClient = `
  *[_type=="serviceAsset" && client._ref==$clientId] | order(name asc) {
    _id,
    name,
    type,
    status,
    externalIds,
    notes
  }
`

export const qAssetById = `
  *[_type=="serviceAsset" && _id==$assetId][0] {
    _id,
    name,
    type,
    client->{_id, name},
    externalIds
  }
`
```

## Client Architecture

### Route-Specific Clients

#### Public Client

```typescript
// src/lib/public/client.ts
export const publicSanity = createClient({
  useCdn: true, // CDN for performance
  perspective: 'published',
})

export async function runPublicQuery(query, params, preview) {
  const client = preview ? previewClient : publicSanity
  return client.fetch(query, params)
}
```

#### Portal Client

```typescript
// src/lib/portal/client.ts
export const portalSanity = createClient({
  useCdn: false, // Always fresh for user data
  token: process.env.SANITY_READ_TOKEN,
})

export async function runPortalQuery(query, params, preview) {
  noStore() // Bypass Next.js cache
  const client = preview ? previewClient : portalSanity
  return client.fetch(query, params)
}
```

#### Admin Client

```typescript
// src/lib/admin/client.ts
export const adminSanity = createClient({
  useCdn: false, // Always fresh for admin data
  token: process.env.SANITY_READ_TOKEN,
})

export async function runAdminQuery(query, params, preview) {
  noStore() // Bypass Next.js cache
  const client = preview ? previewClient : adminSanity
  return client.fetch(query, params)
}
```

## Data Fetching Patterns

### Page-Level Data Fetching

```typescript
// Portal page example
export default async function AssetsPage() {
  const client = await getCurrentClient()
  if (!client) redirect('/auth/signin')

  // Use portal client for user-specific data
  const assets = await runPortalQuery(qAssetsByClient, {
    clientId: client._id
  })

  return <AssetsList assets={assets} />
}
```

### Error Handling

```typescript
async function fetchWithErrorHandling(query, params) {
  try {
    return await runPortalQuery(query, params)
  } catch (error) {
    console.error('Query failed:', error)
    throw new Error('Failed to load data')
  }
}
```

### Type Safety

```typescript
// Generated types from Sanity schema
interface ServiceAsset {
  _id: string
  name: string
  type: 'discord_bot' | 'website' | 'ecommerce' | 'mobile_app'
  status?: string
  externalIds?: string[]
  client: {
    _ref: string
    _type: 'reference'
  }
}

// Usage with type safety
const assets: ServiceAsset[] = await runPortalQuery(qAssetsByClient, params)
```

## Authentication Context

### User Context Resolution

```typescript
// src/lib/auth.ts
export async function getCurrentClient() {
  const session = await getSession()
  if (!session?.user) return null

  // Get full client data
  return await runPortalQuery(qClientByUserId, {
    userId: session.user.id,
  })
}

export async function requireAuth() {
  const client = await getCurrentClient()
  if (!client) {
    redirect('/auth/signin')
  }
  return client
}
```

### Role-Based Data Access

```typescript
// Admin-only data access
export async function requireAdminContext() {
  const session = await getSession()
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Admin access required')
  }
  return session.user
}
```

## Performance Considerations

### Caching Strategy

1. **Public Routes**: Static generation with 1-hour revalidation
2. **Portal Routes**: Fresh data on every request
3. **Admin Routes**: Fresh data for administrative accuracy

### Query Optimization

```typescript
// Efficient field selection
const optimizedQuery = `
  *[_type=="serviceAsset" && client._ref==$clientId] {
    _id,
    name,
    type,
    // Only select needed fields
    status
  }
`

// Avoid over-fetching
const assetCount = `count(*[_type=="serviceAsset" && client._ref==$clientId])`
```

### Connection Management

```typescript
// Reuse client instances
const clients = {
  public: publicSanity,
  portal: portalSanity,
  admin: adminSanity,
}

// Connection pooling handled by Sanity client
```

## Development Patterns

### Query Development

1. **Test in Sanity Vision**: Validate GROQ syntax
2. **Create Query Helper**: Add to appropriate query file
3. **Add Type Definition**: Ensure type safety
4. **Implement Data Fetching**: Use correct route client

### Common Query Patterns

```typescript
// Filtering by reference
*[_type=="entitlement" && client._ref==$clientId]

// Joining related data
*[_type=="invoice" && client._ref==$clientId] {
  _id,
  amount,
  status,
  client->{name, email}
}

// Counting and aggregation
{
  "totalAssets": count(*[_type=="serviceAsset" && client._ref==$clientId]),
  "activeAssets": count(*[_type=="serviceAsset" && client._ref==$clientId && status=="active"])
}

// Ordering and pagination
*[_type=="incident" && client._ref==$clientId] | order(createdAt desc) [0..10]
```

### Error Boundaries

```typescript
// Route-level error handling
export default function DataError({ error, reset }) {
  return (
    <div className="error-boundary">
      <h2>Data Loading Error</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  )
}
```

## Preview Mode

### Content Preview

```typescript
// Enable preview for content editing
export async function enablePreview(token: string) {
  const client = createClient({
    ...sanityConfig,
    token,
    perspective: 'previewDrafts',
  })

  return client
}
```

### Draft Content

```typescript
// Preview mode in pages
export default async function PreviewPage({ searchParams }) {
  const { isEnabled } = await draftMode()
  const content = await runPublicQuery(query, params, isEnabled)

  return <ContentRenderer content={content} preview={isEnabled} />
}
```

This data layer architecture provides efficient, secure, and scalable data access patterns while maintaining clear separation between different user contexts and optimal performance characteristics.
