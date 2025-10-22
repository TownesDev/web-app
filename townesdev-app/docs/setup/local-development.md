# Local Development Setup

## Prerequisites

- **Node.js 18+** (LTS recommended)
- **npm** or **yarn** package manager
- **Git** for version control
- **Sanity CLI** for CMS management

## Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/TownesDev/web-app.git
   cd web-app/app/web/townesdev-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration (see below)
   ```

4. **Start development server**

   ```bash
   npm run dev --turbopack
   ```

   The application will be available at `http://localhost:3000`

## Environment Configuration

### Required Environment Variables

Create a `.env.local` file with the following variables:

```env
# Sanity CMS Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_READ_TOKEN=your_read_token
SANITY_WRITE_TOKEN=your_write_token

# Authentication
JWT_SECRET=your_jwt_secret_here
NEXTAUTH_SECRET=your_nextauth_secret

# Stripe Integration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Service (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@townesdev.com

# Application URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
```

### Environment Setup Guide

#### 1. Sanity CMS Setup

1. **Create Sanity project**

   ```bash
   npm install -g @sanity/cli
   sanity init
   ```

2. **Configure project**
   - Follow the interactive setup
   - Choose TypeScript template
   - Note your project ID and dataset name

3. **Generate API tokens**
   - Go to [Sanity Manage](https://www.sanity.io/manage)
   - Navigate to your project → API → Tokens
   - Create a "Read" token for `SANITY_READ_TOKEN`
   - Create a "Write" token for `SANITY_WRITE_TOKEN`

4. **Deploy schema**

   ```bash
   npm run sanity:deploy
   ```

#### 2. Stripe Configuration

1. **Create Stripe account**
   - Sign up at [Stripe Dashboard](https://dashboard.stripe.com)
   - Switch to "Test mode" for development

2. **Get API keys**
   - Copy "Publishable key" to `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Copy "Secret key" to `STRIPE_SECRET_KEY`

3. **Set up webhooks** (for local testing)

   ```bash
   # Install Stripe CLI
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   # Copy the webhook signing secret to STRIPE_WEBHOOK_SECRET
   ```

#### 3. Resend Email Setup

1. **Create Resend account**
   - Sign up at [Resend](https://resend.com)
   - Verify your domain (or use their testing domain)

2. **Generate API key**
   - Go to API Keys section
   - Create a new API key
   - Copy to `RESEND_API_KEY`

#### 4. Authentication Setup

1. **Generate JWT secret**

   ```bash
   # Generate a secure random string
   openssl rand -base64 32
   # Copy to JWT_SECRET and NEXTAUTH_SECRET
   ```

## Development Workflow

### Available Scripts

```bash
# Development
npm run dev                 # Start dev server with Turbopack
npm run dev:debug          # Start with debug logging

# Building
npm run build              # Production build
npm run build --turbopack  # Build with Turbopack

# Quality Assurance
npm run typecheck          # TypeScript validation
npm run lint               # ESLint checking
npm run format             # Prettier formatting
npm test                   # Jest unit tests
npm run test:e2e           # Playwright E2E tests

# Sanity CMS
npm run sanity:studio      # Open Sanity Studio
npm run sanity:deploy      # Deploy schema changes
npm run snapshot           # Update schema snapshot
```

### Development Server Features

- **Hot reloading** - Instant updates on file changes
- **TypeScript checking** - Real-time type validation
- **Error overlay** - Detailed error information
- **Turbopack** - Fast bundling and compilation

## Project Structure

### Key Directories

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public marketing pages
│   ├── (portal)/          # Client dashboard
│   ├── (admin)/           # Admin interface
│   └── api/               # API route handlers
├── components/            # Reusable React components
├── lib/                   # Utility functions and configurations
│   ├── auth.ts           # Authentication helpers
│   ├── client.ts         # Legacy Sanity client
│   ├── admin/            # Admin-specific utilities
│   ├── portal/           # Portal-specific utilities
│   └── public/           # Public page utilities
├── queries/               # Sanity GROQ query definitions
└── sanity/                # Sanity CMS configuration
```

### Development Guidelines

#### TypeScript Configuration

- **Strict mode enabled** - All type checking rules enforced
- **Absolute imports** - Use `src/` prefix for imports
- **Type generation** - Sanity schema generates TypeScript types

#### Code Quality

- **ESLint** - Enforces code quality rules
- **Prettier** - Automatic code formatting
- **Pre-commit hooks** - Quality checks before commits

#### Testing Strategy

- **Unit tests** - Jest + React Testing Library
- **E2E tests** - Playwright for user workflows
- **Type checking** - TypeScript compilation validation

## Common Development Tasks

### Adding New Pages

1. **Create page component** in appropriate route group
2. **Add route-specific data fetching** using correct client
3. **Update navigation** if needed
4. **Add tests** for new functionality

### Working with Sanity

1. **Schema changes** - Update `sanity/schema/`
2. **Deploy schema** - `npm run sanity:deploy`
3. **Update queries** - Modify files in `src/queries/`
4. **Generate types** - `npm run snapshot`

### Debugging

#### Common Issues

1. **Environment variables not loaded**
   - Ensure `.env.local` exists and is properly formatted
   - Restart dev server after changes

2. **Sanity connection errors**
   - Verify project ID and dataset name
   - Check API token permissions

3. **Build failures**
   - Run `npm run typecheck` to find type errors
   - Check for missing environment variables in production

#### Debug Tools

- **React DevTools** - Component inspection
- **Network tab** - API request debugging
- **Console logs** - Server and client debugging
- **Sanity Vision** - Query testing in Sanity Studio

## Production Deployment

### Vercel Deployment

1. **Connect repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Set build commands**:
   - Build: `npm run build --turbopack`
   - Dev: `npm run dev --turbopack`

### Environment Variables

Ensure all production environment variables are set:

- Replace test Stripe keys with live keys
- Use production Sanity dataset
- Set secure JWT secrets
- Configure production email domain

### Health Checks

The application includes health check endpoints:

- `/api/health` - Basic application health
- `/api/health/env` - Environment variable validation

## Troubleshooting

### Common Solutions

1. **Clear Next.js cache**

   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Reset dependencies**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Sanity schema issues**

   ```bash
   npm run snapshot
   npm run sanity:deploy
   ```

### Getting Help

- **Documentation** - Check this docs directory
- **Issues** - Create GitHub issue for bugs
- **Discussions** - Use GitHub Discussions for questions
