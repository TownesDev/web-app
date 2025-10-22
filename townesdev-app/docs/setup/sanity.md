# Sanity CMS Setup

## Overview

TownesDev uses Sanity as a headless CMS for content management and data storage. This guide covers setting up Sanity for development and production environments.

## Prerequisites

- Node.js 18+ installed
- Sanity CLI installed globally
- Git repository access

## Installation

### 1. Install Sanity CLI

```bash
npm install -g @sanity/cli
```

### 2. Authenticate with Sanity

```bash
sanity login
```

This will open a browser window for authentication.

## Project Setup

### Option A: Use Existing Project

If you're joining an existing TownesDev project:

1. **Get project credentials** from team lead
2. **Add environment variables** to `.env.local`:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=abc123def
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_READ_TOKEN=skr_...
SANITY_AUTH_TOKEN=skw_...
```

3. **Install dependencies**:

```bash
npm install
```

4. **Deploy schema** (if needed):

```bash
npm run sanity:deploy
```

### Option B: Create New Project

For new installations:

1. **Initialize Sanity project**:

```bash
sanity init
```

Follow the prompts:
- Create new project or select existing
- Choose project name
- Select dataset name (usually "production")
- Choose template (select "Clean project")

2. **Configure project** in `sanity.config.ts`:

```typescript
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './src/sanity/schema'

export default defineConfig({
  name: 'townesdev',
  title: 'TownesDev Platform',
  projectId: 'your-project-id',
  dataset: 'production',
  plugins: [deskTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
})
```

## Schema Management

### Core Schema Types

TownesDev uses the following content types:

```typescript
// Core entities
- client          // Customer accounts
- serviceAsset    // Digital services (Discord bots, websites, etc.)
- plan           // Subscription tiers
- feature        // Purchasable add-ons
- entitlement    // Customer access records
- invoice        // Billing history
- incident       // Support tickets

// Content entities
- emailTemplate  // Email templates
- seoConfig     // SEO settings
- systemStatus  // Status page content
```

### Schema Deployment

1. **Deploy schema changes**:

```bash
npm run sanity:deploy
```

2. **Update TypeScript types**:

```bash
npm run snapshot
```

This generates type definitions from your Sanity schema.

### Schema Development

Schema files are located in `src/sanity/schema/`:

```
src/sanity/schema/
├── index.ts           # Schema registry
├── client.ts          # Client document type
├── serviceAsset.ts    # Service asset type
├── plan.ts           # Subscription plans
├── feature.ts        # Add-on features
├── entitlement.ts    # Access records
├── invoice.ts        # Billing documents
├── incident.ts       # Support tickets
└── objects/          # Reusable schema objects
    ├── address.ts
    ├── pricing.ts
    └── externalIds.ts
```

## Data Management

### Sanity Studio

Access the content management interface:

```bash
npm run sanity:studio
```

This opens the Sanity Studio at `http://localhost:3333`

### GROQ Query Development

Use the Vision plugin in Studio to test GROQ queries:

1. Open Studio
2. Navigate to Vision tool
3. Test queries interactively

Example query:

```groq
*[_type=="client" && status=="Active"] {
  _id,
  name,
  email,
  selectedPlan->{
    name,
    price
  }
}
```

### Data Import/Export

Export data:

```bash
sanity dataset export production backup.tar.gz
```

Import data:

```bash
sanity dataset import backup.tar.gz production
```

## API Configuration

### API Tokens

Generate API tokens in Sanity project settings:

1. **Read Token** (`SANITY_READ_TOKEN`)
   - Used for public queries
   - Read-only permissions
   - Safe for server-side use

2. **Write Token** (`SANITY_AUTH_TOKEN`)
   - Used for mutations (create/update/delete)
   - Full permissions
   - Admin operations only

### CORS Configuration

Configure CORS in Sanity project settings:

1. Navigate to project settings → API
2. Add allowed origins:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
3. Enable credentials if needed

### API Versioning

Use API versioning for stability:

```env
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

Pin to a specific date to ensure consistent behavior.

## Query Patterns

### Client Configuration

TownesDev uses route-specific Sanity clients:

```typescript
// Public client (cached)
import { runQuery } from '../lib/client'

// Portal/Admin client (fresh data)
import { runQueryNoCache } from '../lib/client'
```

### Query Helpers

Centralized queries in `src/queries/`:

```typescript
// src/queries/clients.ts
export const qClientsByStatus = groq`
  *[_type=="client" && status==$status] | order(_createdAt desc) {
    _id,
    name,
    email,
    status,
    selectedPlan->{
      name,
      price
    }
  }
`
```

Usage:

```typescript
const activeClients = await runQuery(qClientsByStatus, { status: 'Active' })
```

## Development Workflow

### Local Development

1. **Start development server**:

```bash
npm run dev
```

2. **Run Sanity Studio** (in separate terminal):

```bash
npm run sanity:studio
```

3. **Make schema changes** in `src/sanity/schema/`

4. **Deploy and update types**:

```bash
npm run sanity:deploy
npm run snapshot
```

### Testing

Test Sanity integration:

```bash
npm test -- sanity
```

## Production Deployment

### Environment Variables

Set production environment variables:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=production_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_READ_TOKEN=production_read_token
SANITY_AUTH_TOKEN=production_write_token
```

### Schema Deployment

Deploy schema to production:

```bash
sanity deploy --source-maps
```

### Content Migration

For data migration between environments:

```bash
# Export from staging
sanity dataset export staging staging-backup.tar.gz

# Import to production (be careful!)
sanity dataset import staging-backup.tar.gz production
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   ```bash
   sanity logout
   sanity login
   ```

2. **Schema Deployment Failed**
   - Check for validation errors
   - Ensure proper field types
   - Verify schema syntax

3. **Query Errors**
   - Use Vision tool to test queries
   - Check field references
   - Verify parameter types

4. **CORS Errors**
   - Add domain to allowed origins
   - Check protocol (http vs https)
   - Verify credentials setting

### Debug Mode

Enable debug logging:

```bash
DEBUG=sanity npm run dev
```

### Health Check

Verify Sanity connection:

```typescript
// Test query
const health = await sanity.fetch('*[_type=="client"][0]')
console.log('Sanity connected:', !!health)
```

## Performance Optimization

### Query Optimization

- Use projection to limit fields
- Implement pagination for large datasets
- Cache public queries appropriately
- Use CDN for image assets

### Monitoring

Monitor API usage in Sanity dashboard:
- Request volume
- Response times
- Error rates
- Bandwidth usage

## Security Best Practices

1. **Use read-only tokens** where possible
2. **Restrict CORS origins** to known domains
3. **Implement rate limiting** for public queries
4. **Validate input parameters** in queries
5. **Monitor API usage** for anomalies
6. **Rotate API tokens** regularly

## Additional Resources

- [Sanity Documentation](https://www.sanity.io/docs)
- [GROQ Language Reference](https://www.sanity.io/docs/groq)
- [Vision Plugin Guide](https://www.sanity.io/docs/the-vision-plugin)
- [Schema Reference](https://www.sanity.io/docs/schema-types)