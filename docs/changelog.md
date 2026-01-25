# OpCore v2 Changelog

## [2.0.0] - 2026-01-15

### 🎉 Complete Platform Rewrite

OpCore v2 is a complete rewrite of the platform, migrating from Vite + React + Express to a Next.js 15 monorepo architecture with Prisma ORM.

---

## Architecture Changes

### From → To
| v1 | v2 |
|----|-----|
| Vite + React 18 | Next.js 15 (App Router) |
| Express.js backend | Next.js API Routes + Server Actions |
| WatermelonDB (offline-first) | Prisma ORM (PostgreSQL) |
| React Context (monolithic) | Server-first + minimal client state |
| Manual JWT handling | `@opcore/auth` package with middleware |
| Manual file uploads | `@opcore/storage` with S3 presigned URLs |

### Monorepo Structure
```
v2/
├── apps/
│   ├── web/          # Main user app (Next.js 15)
│   └── admin/        # Admin panel (Next.js 15)
└── packages/
    ├── db/           # Prisma ORM + schema
    ├── auth/         # JWT authentication
    ├── services/     # Business logic (Tax, Email)
    ├── storage/      # S3/R2 file handling
    ├── ui/           # Shared React components
    └── types/        # TypeScript definitions
```

---

## Migration Summary

### Components Migrated (23/23) ✅

| v1 Component | v2 Location | Status |
|--------------|-------------|--------|
| `Layout.tsx` | `(app)/layout.tsx`, `Sidebar.tsx`, `TopBar.tsx` | ✅ |
| `LandingPage.tsx` | `page.tsx` | ✅ |
| `LoginScreen.tsx` | `(auth)/login/page.tsx` | ✅ |
| `OnboardingScreen.tsx` | `(auth)/onboarding/page.tsx` | ✅ |
| `Dashboard.tsx` | `(app)/dashboard/page.tsx` | ✅ |
| `AdvancedLedger.tsx` | `(app)/transactions/` (page + components) | ✅ |
| `InvoiceGenerator.tsx` | `(app)/invoices/` (page + form + preview) | ✅ |
| `ReceiptScanner.tsx` | `transactions/_components/ReceiptScanner.tsx` | ✅ |
| `TaxOptimizer.tsx` | `(app)/optimizer/page.tsx` | ✅ |
| `CorporateTaxEngine.tsx` | `(app)/tax-engine/page.tsx` | ✅ |
| `ProAnalytics.tsx` | `(app)/analytics/page.tsx` | ✅ |
| `BrandConfigurator.tsx` | `(app)/settings/branding/` | ✅ |
| `SubscriptionScreen.tsx` | `(app)/settings/subscription/page.tsx` | ✅ |
| `AdminLayout.tsx` | `admin/(admin)/layout.tsx` | ✅ |
| `TaxCliffMonitor.tsx` | Integrated into `optimizer/page.tsx` | ✅ |
| `ComplianceTips.tsx` | Integrated into `optimizer/page.tsx` | ✅ |
| `RentReliefCard.tsx` | Integrated into `tax-engine/page.tsx` | ✅ |
| `OptimizationScanner.tsx` | Integrated into `optimizer/page.tsx` | ✅ |
| `LoadingScreen.tsx` | Next.js `loading.tsx` conventions | ✅ |
| `ErrorBoundary.tsx` | Next.js `error.tsx` conventions | ✅ |
| `SyncIndicator.tsx` | Removed (server-first, no local sync) | ✅ |
| `ProcessingQueue.tsx` | Removed (server-first processing) | ✅ |
| `ui/Skeleton.tsx` | `@opcore/ui` package | ✅ |

### API Endpoints Migrated

| v1 Endpoint | v2 Location |
|-------------|-------------|
| `/api/auth/login` | `api/auth/login/route.ts` |
| `/api/auth/register` | `api/auth/register/route.ts` |
| `/api/auth/logout` | `api/auth/logout/route.ts` |
| `/api/auth/me` | `api/auth/me/route.ts` |
| `/api/tenants/:id` | Server Actions in `_actions.ts` |
| `/api/sync/transactions` | Server Actions |
| `/api/sync/invoices` | Server Actions |
| `/api/upload` | `api/upload/route.ts` |

### New Features in v2

- 📷 **AI Receipt Scanning** - Gemini Vision API integration
- 💳 **Paystack Payments** - Subscription billing
- 📧 **Email Notifications** - Resend integration
- 🎨 **Dark Mode** - System preference detection
- 📊 **PDF Invoices** - Server-side generation
- 🔒 **Enhanced Auth** - httpOnly cookies, refresh tokens

---

## Database Changes

### From WatermelonDB to Prisma

| v1 Model | v2 Model | Changes |
|----------|----------|---------|
| `Tenant` | `User` | Added tax fields (NTA 2025) |
| `Transaction` | `Transaction` | Added compliance fields |
| `Invoice` | `Invoice` | Added PDF tracking |
| `Subscription` | `Subscription` | Added Paystack fields |
| `StartingBalance` | `StartingBalance` | No changes |
| `BalanceHistory` | `BalanceHistory` | No changes |
| — | `SystemSetting` | NEW: Platform config |
| — | `SystemConfig` | NEW: Integration secrets |
| — | `AuditLog` | NEW: Activity tracking |
| — | `ComplianceRequest` | NEW: Document verification |
| — | `RefreshToken` | NEW: Token rotation |

---

## Breaking Changes

1. **No Offline Mode** - v2 is server-first; offline caching is optional via Dexie.js
2. **New Auth Flow** - JWT stored in httpOnly cookies, not localStorage
3. **API Structure** - Express routes replaced with Next.js API routes + Server Actions
4. **Sync Removed** - No push/pull sync; data is always server-authoritative

---

## Files Removed

The following v1 files are now obsolete:

```
/components/*          → Migrated to v2/apps/web/src/app/
/context/*             → Decomposed into server-side logic
/hooks/*               → Replaced with server data fetching
/db/*                  → Replaced with Prisma schema
/server/*              → Replaced with Next.js API routes
/services/*            → Migrated to v2/packages/services/
/utils/*               → Migrated to v2/packages/
App.tsx                → v2/apps/web/src/app/layout.tsx
index.tsx              → v2/apps/web/src/app/page.tsx
types.ts               → v2/packages/types/
constants.ts           → Embedded in relevant packages
vite.config.ts         → Next.js config
index.html             → Next.js handles HTML
```

---

## Environment Variables

New variables required for v2:

```env
# Required
DATABASE_URL=
JWT_SECRET=

# Optional (features degrade gracefully)
GEMINI_API_KEY=          # Receipt scanning
PAYSTACK_SECRET_KEY=     # Payments
RESEND_API_KEY=          # Emails
S3_ENDPOINT=             # File uploads
```

---

## Getting Started with v2

```bash
cd v2
npm install
cp .env.example .env.local  # Configure environment
npx prisma db push --schema=./packages/db/prisma/schema.prisma
npm run dev
```

---

## Contributors

- Migration automated with AI assistance
- Original OpCore platform design by the OpCore team

---

## [2.1.0] - 2026-01-16

### 🛡️ Admin Area Security & Enhancements

Comprehensive security overhaul of the admin panel (`apps/admin`) to ensure secure access control and granular permissions.

#### Key Features

- **🔐 Secure Authentication**
  - Dedicated admin login page (`/login`)
  - Middleware-protected routes requiring `admin` or `staff` role
  - Secure session handling with httpOnly cookies
  - Audit logging for login/logout events

- **🚦 Granular Access Control**
  - **Role-Based Access Control (RBAC)**: New `AdminRole` and `AdminPermission` models
  - **Custom Roles**: Support for custom roles like `compliance_reviewer`, `support`
  - **Allow-by-Default**: System defaults to permissive mode until permissions are explicitly configured

- **⚙️ Functional Enhancements**
  - **User Management**: Modify roles, change subscription tiers, suspend/delete users
  - **Subscription Management**: Update plans, extend subscriptions, cancel accounts
  - **Compliance Workflow**: Review, approve, and reject compliance requests with notes
  - **System Settings**: Configure platform variables, integrations, and tax rates
  - **Audit Logs**: Filterable activity timeline for security monitoring

#### New Database Models

- `AdminPermission`: Granular permission definition (e.g., `manage_users`)
- `AdminRole`: Grouping of permissions (e.g., `super_admin`)
- `AdminRolePermission`: Many-to-many relation between roles and permissions
- `UserAdminRole`: Assignment of admin roles to users

#### Security Improvements

- **CSRF Protection**: Integrated into middleware
- **Audit Logging**: Comprehensive tracking of all admin actions
- **Environment config**: Secure management of integration secrets via `SystemConfig`

