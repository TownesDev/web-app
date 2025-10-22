# Environment Configuration

## Overview

TownesDev requires several environment variables for proper operation. This guide covers all required and optional configuration variables for development and production environments.

## Environment File Setup

Create a `.env.local` file in the project root with the required variables:

```bash
cp .env.example .env.local
# Edit .env.local with your specific configuration
```

## Required Environment Variables

### Sanity CMS Configuration

```env
# Required for all environments
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01

# Server-side tokens (never use NEXT_PUBLIC prefix)
SANITY_READ_TOKEN=skr_...  # Read-only token for queries
SANITY_AUTH_TOKEN=skw_...  # Write token for mutations (admin only)
```

**Setup Steps:**

1. Create Sanity project at [sanity.io](https://sanity.io)
2. Copy project ID from project settings
3. Generate API tokens in project settings → API
4. Use `production` dataset for live data, `staging` for development

### Authentication Configuration

```env
# Session management
JWT_SECRET=your_secure_random_string_here
NEXTAUTH_SECRET=another_secure_random_string

# Application URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
```

**Setup Steps:**

1. Generate secure random strings for secrets:
   ```bash
   openssl rand -base64 32
   ```
2. Use localhost URLs for development
3. Update BASE_URL and NEXTAUTH_URL for production deployment

### Stripe Payment Configuration

```env
# Stripe API keys
STRIPE_SECRET_KEY=sk_test_...           # Test key for development
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Client-side key
STRIPE_WEBHOOK_SECRET=whsec_...         # Webhook endpoint secret
```

**Setup Steps:**

1. Create Stripe account at [stripe.com](https://stripe.com)
2. Navigate to Developers → API Keys
3. Copy test keys for development
4. Set up webhook endpoint:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`
   - Copy webhook secret

### Email Service (Resend)

```env
# Email configuration
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
```

**Setup Steps:**

1. Create Resend account at [resend.com](https://resend.com)
2. Add and verify your sending domain
3. Generate API key in settings
4. Use verified email address for EMAIL_FROM

## Optional Environment Variables

### Database Configuration

```env
# For future database integration
DATABASE_URL=postgresql://...
```

### Development Options

```env
# Debug and development flags
DEBUG=true
NODE_ENV=development
TURBOPACK=1
```

### Analytics and Monitoring

```env
# Optional analytics integration
VERCEL_ANALYTICS_ID=your_analytics_id
SENTRY_DSN=your_sentry_dsn
```

## Environment Validation

The application includes runtime validation for required environment variables. Missing or invalid variables will cause startup errors with helpful messages.

### Validation Script

```bash
npm run validate-env  # Check environment configuration
```

### Common Issues

1. **Sanity Connection Failed**
   - Verify project ID and dataset name
   - Check API token permissions
   - Ensure CORS settings allow your domain

2. **Stripe Webhook Errors**
   - Verify webhook secret matches Stripe dashboard
   - Check endpoint URL is accessible
   - Ensure webhook events are configured

3. **Email Sending Failed**
   - Verify domain ownership in Resend
   - Check API key permissions
   - Ensure FROM address is verified

## Production Environment

### Vercel Deployment

Set environment variables in Vercel dashboard:

1. Navigate to Project Settings → Environment Variables
2. Add all required variables
3. Use production API keys and tokens
4. Set NEXT_PUBLIC_BASE_URL to your domain

### Security Considerations

- Never commit `.env.local` to version control
- Use different API keys for development/production
- Rotate secrets regularly
- Use read-only tokens where possible
- Enable webhook signature verification

## Testing Environment Variables

For testing, you can use a separate `.env.test` file:

```env
# Test-specific overrides
SANITY_DATASET=test
STRIPE_SECRET_KEY=sk_test_...
EMAIL_FROM=test@example.com
```

## Environment Troubleshooting

### Debug Environment Issues

```bash
# Check environment loading
npm run dev:debug

# Validate all variables
npm run typecheck
```

### Common Error Messages

- `SANITY_PROJECT_ID is required` - Add Sanity project configuration
- `STRIPE_SECRET_KEY missing` - Add Stripe API keys
- `JWT_SECRET not found` - Generate and add JWT secret
- `Invalid email configuration` - Verify Resend setup