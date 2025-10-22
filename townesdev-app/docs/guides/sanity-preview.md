# Sanity Preview Mode

## Overview

TownesDev includes Sanity preview mode functionality that allows content editors to preview draft content on public pages before publishing. This is particularly useful for marketing pages and other public content.

## How Preview Mode Works

1. **Draft Content**: Content editors create and edit documents in Sanity Studio
2. **Preview URL**: From Sanity Studio, editors can access a preview URL with draft content
3. **Preview Banner**: A yellow banner appears at the top of pages when in preview mode
4. **Exit Preview**: Editors can exit preview mode to return to published content

## API Endpoints

### Enable Preview Mode

**Endpoint**: `GET /api/preview`

**Parameters**:
- `secret` (required) - Preview secret from environment variables
- `redirect` (optional) - URL to redirect to after enabling preview (default: `/`)

**Example**:
```
http://localhost:3000/api/preview?secret=your_secret&redirect=/plans
```

### Disable Preview Mode

**Endpoint**: `GET /api/preview/disable`

Disables preview mode and redirects to the homepage.

**Example**:
```
http://localhost:3000/api/preview/disable
```

## Environment Configuration

### Required Environment Variable

```env
SANITY_PREVIEW_SECRET=your_secure_random_string
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

### Sanity Token Requirements

Preview mode requires a Sanity auth token with read permissions:

```env
SANITY_AUTH_TOKEN=skw_...  # Write token with draft access
```

## Usage in Pages

### Public Pages

Public pages automatically support preview mode when using the standard data fetching pattern:

```typescript
import { draftMode } from 'next/headers'
import { runPublicQuery } from '../lib/public/client'

async function getData() {
  const { isEnabled } = await draftMode()
  return await runPublicQuery(query, params, isEnabled)
}

export default async function Page() {
  const data = await getData()
  // ... render content
}
```

### Preview Banner

The preview banner is automatically shown on public pages when preview mode is active. It includes:

- Visual indicator that preview mode is enabled
- "Exit Preview" link to disable preview mode
- Yellow background for high visibility

## Implementation Details

### Client Configuration

Three Sanity clients are configured:

1. **Public Client** (`publicSanity`)
   - CDN enabled for performance
   - Published content only
   - Used for normal public pages

2. **Preview Client** (`previewClient`)
   - CDN disabled for fresh content
   - Draft content enabled
   - Used when preview mode is active

3. **Admin Client** (`sanity`)
   - Server-side operations
   - Authentication required

### Data Fetching Pattern

```typescript
// lib/public/client.ts
export async function runPublicQuery(
  query: string,
  params?: { [key: string]: unknown },
  preview?: boolean
) {
  const client = preview ? previewClient : publicSanity
  return client.fetch(query, params)
}
```

## Security Considerations

1. **Secret Protection**: The preview secret should be kept secure and not exposed to client-side code
2. **Token Security**: The auth token has broader permissions and should only be used server-side
3. **Access Control**: Only trusted content editors should have access to the preview URL
4. **Environment Separation**: Use different secrets for development, staging, and production

## Content Editor Workflow

### From Sanity Studio

1. **Create/Edit Content**: Create or modify documents in Sanity Studio
2. **Generate Preview URL**: Use the preview functionality in Studio (if configured)
3. **Manual Preview URL**: Construct preview URL manually:
   ```
   https://yourdomain.com/api/preview?secret=YOUR_SECRET&redirect=/target-page
   ```

### Preview URL Structure

```
/api/preview?secret=<PREVIEW_SECRET>&redirect=<TARGET_PAGE>
```

**Examples**:
- Preview homepage: `/api/preview?secret=abc123&redirect=/`
- Preview plans page: `/api/preview?secret=abc123&redirect=/plans`
- Preview specific content: `/api/preview?secret=abc123&redirect=/blog/draft-post`

## Troubleshooting

### Common Issues

1. **"Invalid secret" Error**
   - Verify `SANITY_PREVIEW_SECRET` environment variable
   - Check that the secret in the URL matches the environment variable
   - Ensure the secret is properly URL-encoded if it contains special characters

2. **Draft Content Not Showing**
   - Verify `SANITY_AUTH_TOKEN` is set and has proper permissions
   - Check that the Sanity client is configured with `perspective: 'previewDrafts'`
   - Ensure the content is actually in draft state in Sanity

3. **Preview Banner Not Appearing**
   - Check that the page is using the public layout
   - Verify that `draftMode()` is being called correctly
   - Ensure the preview banner component is included in the layout

4. **Exit Preview Not Working**
   - Verify the `/api/preview/disable` route exists
   - Check that cookies are enabled in the browser
   - Ensure the route handler correctly calls `draftMode().disable()`

### Debug Steps

1. **Check Environment Variables**:
   ```bash
   echo $SANITY_PREVIEW_SECRET
   echo $SANITY_AUTH_TOKEN
   ```

2. **Test Preview URL**:
   ```bash
   curl -i "http://localhost:3000/api/preview?secret=YOUR_SECRET"
   ```

3. **Check Draft Mode Status**:
   ```typescript
   // Add to page component for debugging
   const { isEnabled } = await draftMode()
   console.log('Preview mode enabled:', isEnabled)
   ```

## Best Practices

1. **Content Strategy**: Use preview mode for reviewing content changes before publishing
2. **Testing**: Test preview functionality across different page types
3. **Performance**: Preview mode bypasses CDN caching, so performance may be slower
4. **Security**: Regularly rotate preview secrets and auth tokens
5. **Documentation**: Keep preview URLs documented for content editors

## Integration with Sanity Studio

### Document Actions

You can add preview actions to Sanity Studio documents:

```typescript
// sanity/structure.ts
export const previewAction: DocumentActionComponent = (props) => {
  const { draft, published } = props
  const doc = draft || published

  return {
    label: 'Preview',
    onHandle: () => {
      const url = `/api/preview?secret=${process.env.SANITY_PREVIEW_SECRET}&redirect=/`
      window.open(url, '_blank')
    },
  }
}
```

### Studio Configuration

Configure preview URLs in Studio for easier access:

```typescript
// sanity.config.ts
export default defineConfig({
  // ... other config
  document: {
    productionUrl: (prev, { document }) => {
      return `/api/preview?secret=${process.env.SANITY_PREVIEW_SECRET}&redirect=/`
    },
  },
})
```