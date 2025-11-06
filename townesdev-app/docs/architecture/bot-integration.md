# Bot Platform Integration

## Overview

This document outlines the integration between TownesDev (the SaaS orchestration platform) and the Bot Platform (the Discord bot execution engine). TownesDev serves as the control plane handling billing, user management, and UX, while the Bot Platform manages Discord bot execution and real-time feature synchronization.

## Architecture Overview

### System Components

**TownesDev (Control Plane)**

- Next.js 15 application with App Router
- Sanity CMS for content and data management
- Stripe for billing and payment processing
- Custom JWT authentication with RBAC
- Client Portal and Admin Portal UX

**Bot Platform (Execution Engine)**

- Fastify REST API server
- Prisma + PostgreSQL database
- Discord.js bot runner with sharding
- Feature marketplace with real-time synchronization
- Webhook-based API-to-bot communication

### Integration Pattern

The integration follows a **thin API wrapper** pattern where TownesDev exposes minimal endpoints that:

1. Call the Bot Platform API
2. Update Sanity records for persistence
3. Handle error cases and user feedback
4. Maintain server-side security (API keys never exposed to client)

## Data Model Mapping

### Client → Tenant

**TownesDev Client Schema Extensions:**

```typescript
interface Client {
  // ... existing fields
  botTenantId?: string // Bot Platform tenant ID
  botApiKey?: string // Server-only: Bot Platform API key
}
```

**Bot Platform Tenant:**

```sql
CREATE TABLE tenants (
  id TEXT PRIMARY KEY,
  license_key TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'trial',
  owner_user_id TEXT UNIQUE,
  -- ... other fields
);
```

**Provisioning Flow:**

1. Admin creates client in TownesDev
2. System calls Bot API `POST /tenants` to create tenant
3. Bot API returns `{tenantId, apiKey}`
4. TownesDev stores `botTenantId` and `botApiKey` on client record

### ServiceAsset → Guild

**TownesDev ServiceAsset Schema:**

```typescript
interface ServiceAsset {
  _type: 'serviceAsset'
  type: 'discord_bot' // Asset type enum
  client: Reference // Owning client
  name: string // Guild name
  externalIds: string[] // ["guild:123456789"]
  status: 'active' | 'inactive'
  // ... other fields
}
```

**Bot Platform Guild:**

```sql
CREATE TABLE guilds (
  id TEXT PRIMARY KEY, -- Discord guild ID
  tenant_id TEXT REFERENCES tenants(id),
  name TEXT NOT NULL,
  -- ... other fields
);
```

**Registration Flow:**

1. Admin enters Discord guild ID
2. TownesDev creates `serviceAsset` with `type: 'discord_bot'`
3. System calls Bot API `POST /tenants/{tenantId}/guilds` to register
4. Bot Platform validates guild access and creates guild record

### Feature/Entitlement → Guild Features

**TownesDev Feature Schema:**

```typescript
interface Feature {
  _type: 'feature'
  key: string // e.g., "welcome", "moderation"
  name: string
  description: string
  category: string
  sku?: string // Stripe SKU for paid features
  isPremium: boolean
  // ... other fields
}
```

**TownesDev Entitlement Schema:**

```typescript
interface Entitlement {
  _type: 'entitlement'
  client: Reference
  asset: Reference // ServiceAsset reference
  feature: Reference
  status: 'active' | 'inactive'
  stripePaymentIntentId?: string // For paid features
  // ... other fields
}
```

**Bot Platform Features:**

```sql
CREATE TABLE features (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_premium BOOLEAN DEFAULT false,
  -- ... other fields
);

CREATE TABLE guild_features (
  id TEXT PRIMARY KEY,
  guild_id TEXT REFERENCES guilds(id),
  feature_id TEXT REFERENCES features(id),
  is_enabled BOOLEAN DEFAULT false,
  config JSONB, -- Feature-specific configuration
  UNIQUE(guild_id, feature_id)
);
```

**Toggle Flow:**

1. User enables feature in TownesDev UI
2. System creates/updates `entitlement` in Sanity
3. Calls Bot API `POST /assets/{guildId}/features/{key}/enable`
4. Bot Platform updates database and sends webhook to bot runner
5. Bot runner toggles feature live in Discord

## API Endpoints

### Authentication

All bot platform API calls use `X-API-Key` header with the client's `botApiKey`.

### TownesDev Wrapper Endpoints

**POST /api/bot/tenants/provision**

- Creates bot platform tenant for a client
- Stores tenant ID and API key on client record
- Called during client creation workflow

**POST /api/bot/assets/:guildId/register**

- Registers a Discord guild as a service asset
- Creates serviceAsset record in Sanity
- Calls bot platform guild registration

**POST /api/bot/features/:guildId/:key/toggle**

- Enables/disables features for a guild
- Updates entitlement status in Sanity
- Wraps bot platform feature enable/disable API

**POST /api/bot/sync/:guildId**

- Manual synchronization of guild state
- Useful for recovery from webhook failures

### Bot Platform Webhooks

**POST /webhooks/bot/status**

- Bot platform sends status updates
- TownesDev updates serviceAsset status
- Used for health monitoring and error recovery

## User Experience

### Client Portal

**Discord Assets Page** (`/portal/assets/discord`)

- Lists all Discord guilds for the client
- Shows enabled features with toggle buttons
- Displays sync status and last updated time
- "Sync Now" button for manual synchronization

**Navigation Integration:**

- Added to ClientSidebar: "Discord Assets" menu item
- Accessible to clients with active retainers

### Admin Portal

**Client Management Page** (`/admin/clients/[id]/bot`)

- Tenant provisioning status and API key management
- Guild registration form (enter Discord guild ID)
- Feature matrix showing entitlements across all guilds
- Key rotation and emergency disable options

**Settings Page Enhancements** (`/admin/settings`)

- Bot platform health check status
- API key rotation workflows
- Webhook secret management

## Billing Integration

### Plan-Gated Features

Features automatically enabled based on retainer plan:

- Trial plan: Basic features only
- Professional plan: All non-premium features
- Enterprise plan: All features including premium

**Implementation:**

```typescript
// In entitlement logic
const isPlanGated = feature.isPremium && retainer.plan === 'enterprise'
if (isPlanGated) {
  // Auto-enable for enterprise clients
}
```

### Add-on SKU Features

Premium features sold as one-time or subscription purchases:

- Stripe SKU created for each premium feature
- Purchase creates entitlement with `stripePaymentIntentId`
- Feature enabled only after successful payment

**Webhook Handler:**

```typescript
// In /api/stripe/webhooks
if (event.type === 'payment_intent.succeeded') {
  const { featureKey, guildId } = metadata
  // Create entitlement and enable feature
}
```

## Security & RBAC

### API Security

- Bot API keys stored server-only, never exposed to client
- All bot platform calls made server-side in API routes
- Rate limiting on TownesDev bot API endpoints
- Input validation using Zod schemas

### Permission Model

**Client Portal Permissions:**

- `discord.assets.view`: View Discord assets and features
- `discord.assets.manage`: Toggle features and sync assets

**Admin Portal Permissions:**

- `bot.tenants.provision`: Create bot platform tenants
- `bot.tenants.manage`: Rotate keys and manage tenant settings
- `bot.assets.register`: Register new Discord guilds
- `bot.features.toggle`: Enable/disable features for any client

### Audit Logging

All bot platform operations logged:

- Tenant provisioning/deprovisioning
- Guild registration/removal
- Feature enable/disable actions
- API key rotations
- Failed operations and error recovery

## Error Handling & Resilience

### Bot Platform Downtime

- Graceful degradation: Show "Service Unavailable" status
- Retry logic with exponential backoff
- Queue failed operations for later retry
- User notifications for extended outages

### Webhook Reliability

- Idempotent webhook processing
- Signature validation using shared secret
- Retry failed webhook deliveries
- Manual sync fallback for missed updates

### Data Consistency

- Transactional updates: Sanity + Bot API calls wrapped in transactions
- Reconciliation jobs to detect and fix inconsistencies
- Manual sync endpoints for emergency recovery

## Testing Strategy

### Unit Tests

- API route handlers with mocked bot platform responses
- Schema validation and error handling
- Permission checking logic
- Billing integration edge cases

### Integration Tests

- Full provisioning flow: Client → Tenant → Guild → Features
- Webhook processing and state synchronization
- Stripe webhook handling for paid features
- Error scenarios and recovery flows

### End-to-End Tests

- Client portal Discord asset management
- Admin portal tenant and guild management
- Feature toggle UX and real-time updates
- Billing flow from purchase to feature activation

## Operational Monitoring

### Health Checks

- Bot platform API connectivity
- Webhook delivery success rates
- Feature synchronization status
- Queue depths and processing times

### Metrics & Alerts

- Failed bot API calls
- Webhook processing errors
- Feature toggle latency
- Client-reported sync issues

### Dashboard Integration

- Bot platform status on admin settings page
- Per-client bot health indicators
- Alert notifications for service issues

## Future Extensibility

### Multi-Asset Pattern

This Discord bot integration establishes patterns for future asset types:

**Generic Asset Registration:**

```typescript
// /api/assets/:type/:externalId/register
POST / api / assets / discord_bot / 123456789 / register
POST / api / assets / web_app / myapp.com / register
POST / api / assets / mobile_app / com.example.app / register
```

**Unified Entitlement System:**

- Single entitlement schema works across all asset types
- Feature catalog shared but filtered by asset type
- Billing and permission models remain consistent

### Additional Bot Platforms

Future Discord bot platforms can integrate using the same pattern:

- Different API endpoints but same data model
- Competing bot services as alternative entitlements
- Migration tools between bot platforms

### Non-Discord Assets

The pattern extends to web applications, mobile apps, and other services:

- ServiceAsset type enum expanded
- External ID formats standardized
- Feature marketplace becomes multi-platform

## Implementation Phases

### Phase 1: Foundation (Current)

- Environment configuration
- Schema extensions
- Basic API wrapper endpoints
- Authentication and security

### Phase 2: Core UX

- Client portal Discord assets page
- Admin portal management interface
- Basic feature toggling
- Health monitoring

### Phase 3: Advanced Features

- Billing integration for paid features
- Webhook processing and real-time sync
- Error handling and recovery
- Comprehensive testing

### Phase 4: Production Readiness

- Monitoring and alerting
- Performance optimization
- Documentation and training
- Multi-asset pattern generalization

## Configuration

### Environment Variables

```env
# Bot Platform Integration
BOT_API_URL=https://api.bot-platform.com
BOT_API_KEY=your-bot-platform-api-key
BOT_WEBHOOK_SECRET=your-shared-webhook-secret

# Optional: Development overrides
BOT_API_URL_DEV=http://localhost:3000
BOT_WEBHOOK_SECRET_DEV=dev-webhook-secret
```

### Sanity Schema Updates

**Client Schema:**

```typescript
export const client = defineType({
  name: 'client',
  type: 'document',
  fields: [
    // ... existing fields
    defineField({
      name: 'botTenantId',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'botApiKey',
      type: 'string',
      readOnly: true,
      hidden: true, // Server-only field
    }),
  ],
})
```

**ServiceAsset Schema:**

```typescript
export const serviceAsset = defineType({
  name: 'serviceAsset',
  type: 'document',
  fields: [
    defineField({
      name: 'type',
      type: 'string',
      options: {
        list: ['discord_bot' /* future: 'web_app', 'mobile_app' */],
      },
    }),
    defineField({
      name: 'externalIds',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule) =>
        Rule.custom((ids: string[]) => {
          // Validate format based on type
          return true // Implementation depends on type
        }),
    }),
    // ... other fields
  ],
})
```

## Deployment Considerations

### Staging Environment

- Separate bot platform tenant for staging
- Test Discord server for integration testing
- Mock bot API responses for development

### Production Rollout

- Gradual rollout with feature flags
- Monitoring dashboards for key metrics
- Rollback plan for critical issues
- Client communication for new features

### Migration Strategy

For existing clients:

1. Provision bot platform tenants
2. Import existing Discord guilds as service assets
3. Migrate feature entitlements
4. Enable features based on current plans

## Conclusion

This integration transforms TownesDev from a billing platform into a comprehensive SaaS orchestration layer capable of managing multiple service assets. The Discord bot integration serves as the foundation for future asset types while maintaining clean separation of concerns between orchestration (TownesDev) and execution (Bot Platform).

The thin API wrapper approach ensures maintainability, the generic data models enable extensibility, and the comprehensive error handling provides production reliability. This architecture positions TownesDev as a true multi-asset management platform with Discord bots as the first integrated service.
