# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Development
pnpm dev              # Start dev server with Turbopack

# Build
pnpm build            # Production build
pnpm build:fast       # Build with increased memory (4GB)

# Linting & Formatting
pnpm lint             # Run ESLint
pnpm format           # Format with Prettier
pnpm format:check     # Check formatting

# Database (Drizzle)
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema changes directly
pnpm db:studio        # Open Drizzle Studio GUI

# Auth
pnpm auth:generate    # Generate Better-Auth types

# RBAC
pnpm rbac:init        # Initialize RBAC permissions
pnpm rbac:assign      # Assign roles to users

# Cloudflare Deployment
pnpm cf:deploy        # Build and deploy to CF Workers
pnpm cf:preview       # Build and preview locally
```

## Architecture Overview

This is a PopJoyLab Template Two project - an AI SaaS boilerplate built with Next.js 15 (App Router).

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # i18n wrapper (next-intl)
│   │   ├── (landing)/     # Public landing pages
│   │   ├── (auth)/        # Auth pages (login/signup)
│   │   ├── (chat)/        # Chat interface
│   │   ├── (admin)/       # Admin panel (protected)
│   │   └── (docs)/        # Documentation
│   └── api/               # API routes
├── config/                # Global configuration
│   ├── db/               # Multi-dialect schemas (postgres/mysql/sqlite)
│   ├── locale/           # i18n messages and config
│   └── index.ts          # Environment config
├── core/                  # Core infrastructure
│   ├── auth/             # Better-Auth setup
│   ├── db/               # Drizzle ORM setup
│   ├── i18n/             # next-intl setup
│   └── rbac/             # Permission definitions
├── shared/                # Shared code
│   ├── blocks/           # Reusable page sections
│   ├── components/       # UI components (Radix + shadcn)
│   ├── models/           # Database queries/mutations
│   └── services/         # Business logic
├── extensions/            # Pluggable providers
│   ├── ai/              # AI (Gemini, Replicate, FAL)
│   ├── payment/         # Payment (Stripe, PayPal, Creem)
│   ├── storage/         # Storage (S3, R2)
│   └── email/           # Email (Resend)
└── themes/              # Theme templates
```

### Key Systems

**Database**: Multi-dialect Drizzle ORM supporting PostgreSQL, MySQL, and SQLite/Turso. Configure via `DATABASE_PROVIDER` env var. Schemas are in `src/config/db/schema.{dialect}.ts`.

**Auth**: Better-Auth with email/password, social OAuth, and email verification. Config at `src/core/auth/`.

**i18n**: next-intl with locale prefix 'as-needed'. Supported locales: `en`, `zh`. Messages in `src/config/locale/messages/`.

**Payments**: PaymentManager pattern supporting multiple providers. Webhook handlers at `/api/payment/notify/[provider]`.

**RBAC**: Permission-based access control. Use `requirePermission()` for guards, `hasPermission()` for checks. Permissions defined in `src/core/rbac/permissions.ts`.

### Common Patterns

**API Routes**: Use `getAuth()` from `@/core/auth` for authentication. Return `Response.json()` with standardized format.

**Database Changes**:
1. Update schema in `src/config/db/schema.postgres.ts` (and mysql/sqlite if needed)
2. Run `pnpm db:generate && pnpm db:migrate`

**Adding i18n Messages**:
1. Add JSON to `src/config/locale/messages/{locale}/`
2. Register path in `localeMessagesPaths` array in `src/config/locale/index.ts`

**New Dynamic Pages**: Use JSON-driven page builder. Create page JSON in `src/config/locale/messages/{locale}/pages/` and register in `localeMessagesPaths`.

### Database Compatibility Notes

The DB layer includes polyfills for cross-dialect compatibility:
- MySQL: Polyfill for `.returning()` and `onConflictDoUpdate()`
- SQLite: Polyfill for `.for('update')` locking

Always test queries against your target `DATABASE_PROVIDER`.

### Skills Available

- `/PopJoyLab-quick-start` - Bootstrap new project from brief
- `/PopJoyLab-page-builder` - Create new dynamic pages from spec
