# TownesDev Web Application

[![CI](https://github.com/TownesDev/web-app/actions/workflows/ci.yml/badge.svg)](https://github.com/TownesDev/web-app/actions/workflows/ci.yml)

A multi-tenant SaaS platform for digital service management built with Next.js 15, supporting Discord bots, websites, e-commerce stores, and mobile applications.

## 📚 Documentation

**[Complete Documentation](./townesdev-app/docs/README.md)** - Architecture, setup guides, and development patterns

### Quick Links

- **[Local Setup](./townesdev-app/docs/setup/local-development.md)** - Get started with development
- **[Architecture Overview](./townesdev-app/docs/architecture/overview.md)** - Platform structure and patterns
- **[Route Groups](./townesdev-app/docs/architecture/route-groups.md)** - Multi-tenant routing architecture
- **[Caching Strategy](./townesdev-app/docs/architecture/caching.md)** - Performance optimization

## 🚀 Quick Start

1. **Clone and install**

   ```bash
   git clone https://github.com/TownesDev/web-app.git
   cd web-app/townesdev-app
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start development**

   ```bash
   npm run dev --turbopack
   ```

   The application will be available at `http://localhost:3000`

## 🏗️ Architecture

- **Next.js 15** with App Router and Turbopack
- **Multi-tenant** route groups: `(public)`, `(portal)`, `(admin)`
- **Sanity CMS** with route-specific clients for optimal caching
- **Stripe** integration for subscriptions and payments
- **TypeScript** strict mode with comprehensive testing

## 🗂️ Repository Structure

```
web-app/
├── townesdev-app/          # Main Next.js application
│   ├── src/                # Application source code
│   ├── docs/               # Developer documentation
│   ├── public/             # Static assets
│   └── README.md           # Application-specific README
└── README.md               # This file - repository overview
```

## 🔧 Development

### Prerequisites

- **Node.js 18+** (LTS recommended)
- **npm** or **yarn** package manager
- **Git** for version control

### Environment Setup

The application requires several environment variables for Sanity CMS, Stripe payments, and email services. See the [local development guide](./townesdev-app/docs/setup/local-development.md) for complete setup instructions.

### Available Scripts

```bash
# From townesdev-app directory
npm run dev                 # Start development server
npm run build              # Production build
npm run typecheck          # TypeScript validation
npm run lint               # ESLint checking
npm test                   # Run tests
```

## 🌟 Features

### Multi-Service Platform

- **Discord Bots** - Server automation and moderation
- **Websites** - Frontend web applications
- **E-commerce** - Online stores with shopping cart
- **Mobile Apps** - iOS and Android applications

### Business Model

- **Base Retainer** - Monthly subscription for core services
- **Asset Add-ons** - Additional services with per-asset pricing
- **Feature Purchases** - One-time feature unlocks per asset

### Technical Features

- **Route Groups** - Clean separation between public, client, and admin portals
- **Performance Optimized** - Route-specific caching and bundle optimization
- **Security First** - RBAC, session management, and data isolation
- **Developer Experience** - TypeScript strict mode, comprehensive testing

## 🚀 Deployment

The application is optimized for deployment on Vercel with automatic deployments from Git branches. See the [deployment documentation](./townesdev-app/docs/setup/local-development.md#production-deployment) for complete instructions.

## 📖 Additional Resources

- **[Architecture Documentation](./townesdev-app/docs/architecture/overview.md)** - Deep dive into platform structure
- **[API Documentation](./townesdev-app/docs/guides/api.md)** - REST endpoint patterns
- **[Testing Guide](./townesdev-app/docs/guides/testing.md)** - Unit and E2E testing
- **[Contributing Guidelines](./townesdev-app/docs/guides/workflow.md)** - Development workflow

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

---

**Built with** ❤️ **by TownesDev**