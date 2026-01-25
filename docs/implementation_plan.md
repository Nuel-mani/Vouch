# OpCore: Migration & Implementation Plan (Next.js Architecture)

> **Version**: 2.0  
> **Date**: January 15, 2026  
> **Architecture**: Next.js Monorepo with Custom Auth, Supabase PostgreSQL, S3 Storage

---

## Overview

This plan migrates OpCore from the current Vite + Express stack to a Next.js-based architecture with:

- **Turborepo monorepo** with separate web and admin apps
- **Custom JWT auth** (no Supabase Auth dependency)
- **Supabase PostgreSQL** (with migration path to self-hosted)
- **Cloudflare R2 / AWS S3** for file storage
- **Dexie.js** for offline-first capabilities

---

## Phase 0: Project Setup (Day 1-2)

### 0.1 Initialize Turborepo

```bash
npx create-turbo@latest opcore-next
```

### 0.2 Project Structure

```
opcore-next/
├── apps/
│   ├── web/          # Main app (Next.js 15)
│   └── admin/        # Admin panel (Next.js 15)
├── packages/
│   ├── db/           # Drizzle ORM + schema
│   ├── auth/         # Custom JWT auth
│   ├── services/     # Business logic
│   ├── storage/      # S3 wrapper
│   ├── ui/           # Shared components (shadcn)
│   └── types/        # Shared TypeScript types
├── turbo.json
└── package.json
```

### 0.3 Install Core Dependencies

| Package | Purpose | App |
|---------|---------|-----|
| `next@15` | Framework | web, admin |
| `drizzle-orm` | Database ORM | db |
| `postgres` | PostgreSQL driver | db |
| `bcryptjs` | Password hashing | auth |
| `jose` | JWT library | auth |
| `dexie` | Offline IndexedDB | web |
| `@aws-sdk/client-s3` | S3 storage | storage |
| `@paystack/inline-js` | Payments | web |
| `resend` | Transactional emails | services |

### Tasks

- [ ] 0.1 Create Turborepo project
- [ ] 0.2 Set up apps/web and apps/admin
- [ ] 0.3 Create package structure
- [ ] 0.4 Configure shared tsconfig
- [ ] 0.5 Set up ESLint + Prettier

---

## Phase 1: Database Layer (Day 2-3)

### 1.1 Set Up Drizzle ORM

```typescript
// packages/db/src/client.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
```

### 1.2 Create Schema

Migrate existing `server/schema.sql` to Drizzle TypeScript schema:

| Table | Status |
|-------|--------|
| `users` (was `tenants`) | New schema |
| `transactions` | Migrate |
| `invoices` | Migrate |
| `subscriptions` | Migrate |
| `audit_logs` | New |
| `system_settings` | Migrate |

### 1.3 Keep PostgreSQL Triggers

The NTA 2025 triggers will be added via Drizzle migrations:

```typescript
// packages/db/src/migrations/0002_add_triggers.ts
export async function up(db) {
  await db.execute(`
    CREATE OR REPLACE FUNCTION check_turnover_threshold()
    RETURNS TRIGGER AS $$
    -- ... existing trigger logic
    $$ LANGUAGE plpgsql;
  `);
}
```

### Tasks

- [ ] 1.1 Set up packages/db with Drizzle
- [ ] 1.2 Create schema.ts with all tables
- [ ] 1.3 Run initial migration on Supabase
- [ ] 1.4 Add PostgreSQL triggers via migration
- [ ] 1.5 Seed initial data (system_settings, admin user)

---

## Phase 2: Authentication System (Day 3-5)

### 2.1 Custom Auth Architecture

```
┌─────────────────────────────────────────────────┐
│                   AUTH FLOW                      │
├─────────────────────────────────────────────────┤
│  1. User submits email/password                  │
│  2. Server validates credentials (bcrypt)        │
│  3. Server creates JWT + Refresh Token           │
│  4. JWT in httpOnly cookie (7 days)              │
│  5. Refresh token in DB (30 days)                │
│  6. Middleware validates JWT on protected routes │
└─────────────────────────────────────────────────┘
```

### 2.2 Auth Package Structure

```
packages/auth/
├── src/
│   ├── index.ts           # Public exports
│   ├── password.ts        # bcrypt hash/verify
│   ├── jwt.ts             # Sign/verify JWT
│   ├── session.ts         # Session management
│   ├── middleware.ts      # Next.js middleware helper
│   └── types.ts           # Auth types
└── package.json
```

### 2.3 Key Functions

```typescript
// packages/auth/src/index.ts
export async function hashPassword(password: string): Promise<string>;
export async function verifyPassword(password: string, hash: string): Promise<boolean>;
export async function signToken(payload: TokenPayload): Promise<string>;
export async function verifyToken(token: string): Promise<TokenPayload | null>;
export async function createSession(userId: string): Promise<Session>;
export async function validateSession(sessionId: string): Promise<User | null>;
```

### 2.4 Role-Based Access

| Role | Access |
|------|--------|
| `user` | Own data only |
| `staff` | Read all users, approve compliance |
| `admin` | Full access, system config |

### Tasks

- [ ] 2.1 Create packages/auth structure
- [ ] 2.2 Implement password hashing (bcrypt)
- [ ] 2.3 Implement JWT sign/verify (jose)
- [ ] 2.4 Create session management
- [ ] 2.5 Build auth middleware for Next.js
- [ ] 2.6 Implement role-based access control
- [ ] 2.7 Add audit logging for auth events

---

## Phase 3: Main Web App (Day 5-10)

### 3.1 Route Structure

```
apps/web/app/
├── (marketing)/              # Public pages
│   ├── page.tsx              # Landing page
│   ├── pricing/page.tsx      # Pricing
│   └── about/page.tsx        # About
├── (auth)/                   # Auth pages
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── forgot-password/page.tsx
├── (app)/                    # Protected app
│   ├── layout.tsx            # Dashboard layout
│   ├── dashboard/page.tsx
│   ├── ledger/page.tsx
│   ├── invoices/
│   │   ├── page.tsx          # List
│   │   ├── new/page.tsx      # Create
│   │   └── [id]/page.tsx     # View/Edit
│   ├── tax-engine/page.tsx
│   ├── optimizer/page.tsx
│   ├── subscription/page.tsx
│   └── settings/page.tsx
└── api/                      # API routes
    ├── auth/
    │   ├── login/route.ts
    │   ├── register/route.ts
    │   └── logout/route.ts
    ├── transactions/route.ts
    ├── invoices/route.ts
    ├── sync/route.ts
    └── subscription/
        ├── upgrade/route.ts
        └── webhook/route.ts
```

### 3.2 Component Migration

| Current Component | New Location | Changes |
|-------------------|--------------|---------|
| `LandingPage.tsx` | `(marketing)/page.tsx` | SSR, metadata |
| `Dashboard.tsx` | `(app)/dashboard/page.tsx` | Server component + client islands |
| `CorporateTaxEngine.tsx` | `(app)/tax-engine/page.tsx` | Logic to services |
| `InvoiceGenerator.tsx` | `(app)/invoices/new/page.tsx` | Logic to services |
| `AdvancedLedger.tsx` | `(app)/ledger/page.tsx` | Pagination, server actions |

### 3.3 Offline Support

```typescript
// apps/web/lib/offline/provider.tsx
'use client';

import { offlineDb, syncPendingData } from './db';

export function OfflineProvider({ children }) {
  useEffect(() => {
    // Sync when coming online
    window.addEventListener('online', syncPendingData);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }

    return () => window.removeEventListener('online', syncPendingData);
  }, []);

  return children;
}
```

### Tasks

- [ ] 3.1 Create apps/web with Next.js 15
- [ ] 3.2 Set up Tailwind + shadcn/ui
- [ ] 3.3 Implement marketing pages (SSR)
- [ ] 3.4 Implement auth pages
- [ ] 3.5 Implement dashboard layout
- [ ] 3.6 Migrate each feature page
- [ ] 3.7 Implement API routes
- [ ] 3.8 Set up Dexie.js offline DB
- [ ] 3.9 Implement sync logic
- [ ] 3.10 Add service worker for background sync

---

## Phase 4: Admin Panel (Day 10-15)

### 4.1 Route Structure

```
apps/admin/app/
├── (auth)/
│   └── login/page.tsx         # Admin login
├── (admin)/                    # Protected admin area
│   ├── layout.tsx              # Admin layout + sidebar
│   ├── dashboard/page.tsx      # KPIs, charts
│   ├── users/
│   │   ├── page.tsx            # User list
│   │   └── [id]/page.tsx       # User detail + actions
│   ├── subscriptions/
│   │   ├── page.tsx            # All subscriptions
│   │   └── [id]/page.tsx       # Subscription detail
│   ├── compliance/
│   │   ├── page.tsx            # Review queue
│   │   └── [id]/page.tsx       # Document review
│   ├── content/
│   │   ├── announcements/      # System announcements
│   │   └── feature-flags/      # Feature toggles
│   ├── system/
│   │   ├── settings/page.tsx   # Tax rates, pricing
│   │   └── branding/page.tsx   # Platform branding
│   └── audit-logs/page.tsx     # Audit trail
└── api/
    └── admin/
        ├── users/route.ts
        ├── subscriptions/route.ts
        ├── analytics/route.ts
        └── ...
```

### 4.2 Admin Features

| Feature | Priority | Effort |
|---------|----------|--------|
| Dashboard (KPIs) | High | 2 days |
| User Management | High | 2 days |
| Subscription Management | High | 2 days |
| Compliance Queue | Medium | 1 day |
| Audit Logs | High | 1 day |
| System Settings | Medium | 1 day |
| Feature Flags | Low | 0.5 day |

### Tasks

- [ ] 4.1 Create apps/admin with Next.js 15
- [ ] 4.2 Implement admin auth (staff/admin only)
- [ ] 4.3 Build admin layout with sidebar
- [ ] 4.4 Implement Dashboard with KPIs
- [ ] 4.5 Implement User Management (CRUD)
- [ ] 4.6 Add user impersonation
- [ ] 4.7 Implement Subscription Management
- [ ] 4.8 Implement Compliance Review
- [ ] 4.9 Implement Audit Logs viewer
- [ ] 4.10 Implement System Settings

---

## Phase 5: Business Logic Services (Day 8-12)

### 5.1 Services Structure

```
packages/services/
├── src/
│   ├── tax/
│   │   ├── taxEngine.ts         # NTA 2025 calculations
│   │   ├── complianceChecker.ts # WE test, VAT evidence
│   │   └── reliefScanner.ts     # Find deductions
│   ├── invoice/
│   │   ├── invoiceService.ts    # CRUD operations
│   │   └── pdfGenerator.ts      # PDF creation
│   ├── subscription/
│   │   ├── billingService.ts    # Paystack integration
│   │   └── planLimits.ts        # Feature gating
│   ├── notification/
│   │   ├── emailService.ts      # Resend integration
│   │   └── templates/           # Email templates
│   └── sync/
│       └── syncService.ts       # Offline sync logic
└── package.json
```

### 5.2 Extract from Current Code

| Current Location | New Service |
|------------------|-------------|
| `CorporateTaxEngine.tsx` calculations | `services/tax/taxEngine.ts` |
| `utils/TaxEngine.ts` | `services/tax/taxEngine.ts` |
| `InvoiceGenerator.tsx` logic | `services/invoice/invoiceService.ts` |
| `TenantContext.tsx` sync | `services/sync/syncService.ts` |

### Tasks

- [ ] 5.1 Create packages/services structure
- [ ] 5.2 Migrate TaxEngine to service
- [ ] 5.3 Create InvoiceService
- [ ] 5.4 Build PDF generator
- [ ] 5.5 Implement Paystack billing service
- [ ] 5.6 Set up Resend email service
- [ ] 5.7 Create email templates
- [ ] 5.8 Build sync service for offline

---

## Phase 6: Storage & Payments (Day 12-14)

### 6.1 S3 Storage Setup

```typescript
// packages/storage/src/s3.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

export async function uploadFile(file: Buffer, key: string, contentType: string) {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: file,
    ContentType: contentType,
  }));
  return `${process.env.S3_PUBLIC_URL}/${key}`;
}

export async function getSignedDownloadUrl(key: string) {
  const command = new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}
```

### 6.2 Paystack Integration

```typescript
// packages/services/src/subscription/billingService.ts
import Paystack from 'paystack-node';

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);

export async function initializePayment(email: string, amount: number, plan: string) {
  const response = await paystack.transaction.initialize({
    email,
    amount: amount * 100, // Kobo
    plan, // Paystack plan code for recurring
    callback_url: `${process.env.APP_URL}/subscription/callback`,
  });
  return response.data;
}

export async function verifyPayment(reference: string) {
  const response = await paystack.transaction.verify(reference);
  return response.data;
}
```

### Tasks

- [ ] 6.1 Create packages/storage
- [ ] 6.2 Implement S3 upload/download
- [ ] 6.3 Add signed URL generation
- [ ] 6.4 Integrate Paystack SDK
- [ ] 6.5 Create subscription plans in Paystack
- [ ] 6.6 Implement webhook handler
- [ ] 6.7 Add subscription status tracking

---

## Phase 7: Testing & Migration (Day 14-17)

### 7.1 Data Migration Script

```typescript
// scripts/migrate-data.ts
import { oldDb } from './old-db';
import { db, users, transactions, invoices } from '@opcore/db';

async function migrateUsers() {
  const oldTenants = await oldDb.query('SELECT * FROM tenants');
  for (const tenant of oldTenants.rows) {
    await db.insert(users).values({
      id: tenant.id,
      email: tenant.email,
      passwordHash: tenant.password_hash,
      businessName: tenant.business_name,
      // ... map all fields
    });
  }
}
```

### 7.2 Testing Strategy

| Test Type | Tool | Coverage |
|-----------|------|----------|
| Unit Tests | Vitest | Services, auth |
| Integration | Vitest | API routes |
| E2E | Playwright | Critical flows |

### Tasks

- [ ] 7.1 Write data migration script
- [ ] 7.2 Test migration on staging
- [ ] 7.3 Write unit tests for services
- [ ] 7.4 Write E2E tests for critical flows
- [ ] 7.5 Performance testing
- [ ] 7.6 Security audit

---

## Phase 8: Deployment (Day 17-18)

### 8.1 Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│                   VERCEL                         │
├─────────────────────────────────────────────────┤
│  apps/web    → opcore.ng                        │
│  apps/admin  → admin.opcore.ng                  │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│               SUPABASE                           │
├─────────────────────────────────────────────────┤
│  PostgreSQL database                             │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│            CLOUDFLARE R2                         │
├─────────────────────────────────────────────────┤
│  File storage (receipts, invoices)              │
└─────────────────────────────────────────────────┘
```

### Tasks

- [ ] 8.1 Set up Vercel project
- [ ] 8.2 Configure environment variables
- [ ] 8.3 Set up custom domains
- [ ] 8.4 Configure Cloudflare R2
- [ ] 8.5 Run production migration
- [ ] 8.6 DNS configuration
- [ ] 8.7 SSL certificates
- [ ] 8.8 Monitoring setup (Sentry)

---

## Timeline Summary

| Phase | Duration | Days |
|-------|----------|------|
| Phase 0: Setup | Day 1-2 | 2 |
| Phase 1: Database | Day 2-3 | 2 |
| Phase 2: Auth | Day 3-5 | 3 |
| Phase 3: Web App | Day 5-10 | 5 |
| Phase 4: Admin | Day 10-15 | 5 |
| Phase 5: Services | Day 8-12 | 4 |
| Phase 6: Storage/Payments | Day 12-14 | 3 |
| Phase 7: Testing | Day 14-17 | 3 |
| Phase 8: Deployment | Day 17-18 | 2 |

**Total: ~18 working days (3.5 weeks)**

---

## Success Criteria

- [ ] All features from current app work in new stack
- [ ] Offline mode works for transactions and invoices
- [ ] Admin panel fully functional
- [ ] Payment flow works end-to-end
- [ ] Page load < 2s on 3G
- [ ] Lighthouse score > 90
- [ ] Zero data loss in migration
