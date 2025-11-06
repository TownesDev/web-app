# TownesDev Documentation

> **Note**: This documentation is for developers working on the TownesDev platform. For client portal usage, see the in-app help system.

## First Time Here?

**New to this codebase? Start here:**

1. **Setup** (30 min): [Local Development](./setup/local-development.md) → [Environment](./setup/environment.md)
2. **Understand** (20 min): [Architecture Overview](./architecture/overview.md) → [Route Groups](./architecture/route-groups.md)
3. **Build** (10 min): [Development Workflow](./guides/workflow.md) → [Testing](./guides/testing.md)
4. **Current Work**: [Checkpoint Review](./audit/checkpoint-review.md) - What's next

---

## Quick Start

- [**Local Setup**](./setup/local-development.md) - Get the platform running locally
- [**Architecture Overview**](./architecture/overview.md) - Understand the codebase structure
- [**Route Groups**](./architecture/route-groups.md) - Multi-tenant routing architecture
- [**Data Layer**](./architecture/data-layer.md) - Sanity CMS integration patterns

## Development Guides

- [**🚀 Launch Roadmap 2026**](./guides/launch-roadmap-2026.md) - **START HERE** - 8-week plan to launch by Jan 1, 2026
- [**Environment Configuration**](./setup/environment.md) - Required environment variables
- [**Database Setup**](./setup/sanity.md) - Sanity CMS configuration
- [**Testing**](./guides/testing.md) - Running unit and E2E tests
- [**Testing PDF & Email**](./development/testing-pdf-email.md) - Specific testing for reports and incidents
- [**Caching Strategy**](./architecture/caching.md) - Performance optimization patterns
- [**Client Portal Flow**](./guides/portal-flow.md) - Portal user experience and features
- [**Onboarding Plan**](./guides/onboarding-plan.md) - Full onboarding implementation details
- [**Sanity Preview Mode**](./guides/sanity-preview.md) - Content preview functionality
- [**PDF Reports**](./development/pdf-reports.md) - Monthly report generation
- [**Advanced Features**](./development/advanced-features.md) - Complex platform features
- [**Performance Optimization**](./development/performance-optimization.md) - Bundle and runtime optimization

## Architecture

- [**✨ Source of Truth (SOT)**](./SOT.md) - Core principles and authoritative patterns
- [**Multi-Service Platform**](./architecture/multi-service.md) - Discord bots, websites, e-commerce, mobile
- [**Bot Platform Integration**](./architecture/bot-integration.md) - Discord bot execution engine integration
- [**Authentication & RBAC**](./architecture/auth.md) - Session management and permissions
- [**Payment Integration**](./architecture/payments.md) - Stripe billing and subscriptions
- [**Performance**](./architecture/performance.md) - Bundle optimization and caching

## Deployment

- [**Production Deployment**](./setup/deployment.md) - Vercel and environment setup
- [**Monitoring**](./guides/monitoring.md) - Health checks and observability
- [**Security**](./guides/security.md) - Authentication and data protection

## Contributing

- [**Development Workflow**](./guides/workflow.md) - Git flow and testing requirements
- [**Code Standards**](./guides/standards.md) - TypeScript, linting, and formatting
- [**API Guidelines**](./guides/api-guidelines.md) - REST endpoint patterns and conventions
- [**AI Agent Guidelines**](./development/ai-agents.md) - Safe operation rules for AI coding agents
- [**Onboarding Status**](./development/onboarding-status.md) - Implementation tracking

## Audit & Updates

- [**Comprehensive Docs Audit**](./audit/DOCS_AUDIT_COMPREHENSIVE.md) - Full documentation analysis and cleanup plan
- [**Checkpoint Review**](./audit/checkpoint-review.md) - Current state and forward-looking tasks
- [**Repository Issues**](./audit/repo-issues.md) - Prioritized actionable tasks
- [**Archived Audits**](./audit/_archived/README.md) - Historical audit documents

---

**Last Updated**: November 4, 2025  
**Platform Version**: Next.js 15.5.5 with App Router
