# OpCore: Recommended Tech Stack & Architecture

> **Author**: Senior Developer Perspective (10+ Years Experience)  
> **Date**: January 15, 2026  
> **Philosophy**: Ship fast, scale later, avoid vendor lock-in

---

## TL;DR - The Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Monorepo** | Turborepo | Shared code, single CI/CD, type safety |
| **Frontend** | Next.js 15 (App Router) | SSR, API routes, React Server Components |
| **Styling** | Tailwind CSS + shadcn/ui | Fast iteration, consistent design system |
| **Offline** | Dexie.js (IndexedDB) | Lighter than WatermelonDB, works with Next.js |
| **Auth** | Custom JWT + bcrypt + cookies | Full control, no vendor lock-in |
| **Database** | PostgreSQL via Supabase → Self-hosted | Start managed, migrate when ready |
| **ORM** | Drizzle ORM | Type-safe, lightweight, SQL-first |
| **Storage** | Cloudflare R2 (S3-compatible) | Cheaper than AWS S3, same API |
| **Email** | Resend | Modern, great DX, affordable |
| **Payments** | Paystack | Nigerian market standard |
| **Hosting** | Vercel (apps) + Railway (DB migration) | Zero-config deploys |

---

## Why This Stack (Opinionated Reasoning)

### 1. Next.js 15 over Vite React

| Vite React | Next.js 15 |
|------------|-----------|
| Client-side only | SSR + Client hybrid |
| No built-in API routes | API routes included |
| Manual SEO | Automatic metadata API |
| Manual code splitting | Automatic optimization |
| Need separate Express server | Server built-in |

**Verdict**: Next.js eliminates the need for your Express backend AND gives you SEO for the landing page.

### 2. Drizzle ORM over Prisma

| Prisma | Drizzle |
|--------|---------|
| Heavy bundle (2MB+) | Lightweight (~50KB) |
| Query engine required | Direct SQL |
| Schema in .prisma file | Schema in TypeScript |
| Good for simple CRUD | Better for complex tax queries |

**Verdict**: For a tax engine with complex SQL (your triggers, aggregations), Drizzle gives you more control.

### 3. Dexie.js over WatermelonDB

| WatermelonDB | Dexie.js |
|--------------|----------|
| React Native focused | Browser-native |
| Complex setup | Simple IndexedDB wrapper |
| Heavy sync protocol | You control sync logic |
| Model decorators | Plain TypeScript |

**Verdict**: Dexie.js is simpler, works perfectly with Next.js client components, and you already have custom sync logic.

### 4. Custom Auth over NextAuth/Lucia

For a Nigerian fintech dealing with money, you need:
- Full audit trail on auth events
- Custom session logic for compliance
- No dependency on external services

**Implementation**:
```typescript
// Simple, auditable, yours
export async function login(email: string, password: string) {
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    await auditLog('LOGIN_FAILED', { email });
    throw new AuthError('Invalid credentials');
  }
  const token = await signJWT({ userId: user.id, role: user.role });
  await auditLog('LOGIN_SUCCESS', { userId: user.id });
  return { token, user };
}
```

### 5. Cloudflare R2 over AWS S3

| AWS S3 | Cloudflare R2 |
|--------|---------------|
| $0.023/GB storage | $0.015/GB storage |
| $0.09/GB egress | **$0 egress** |
| Complex IAM | Simple API tokens |

**Verdict**: For receipts/invoices with frequent downloads, R2 saves 30-50% on costs.

---

## Project Structure

```
opcore/
├── apps/
│   ├── web/                    # Main user-facing app
│   │   ├── app/
│   │   │   ├── (marketing)/    # Landing, pricing (SSR)
│   │   │   ├── (app)/          # Dashboard, invoices (protected)
│   │   │   ├── (auth)/         # Login, register
│   │   │   └── api/            # API routes
│   │   └── package.json
│   │
│   └── admin/                  # Staff admin panel
│       ├── app/
│       │   ├── dashboard/
│       │   ├── users/
│       │   ├── subscriptions/
│       │   ├── compliance/
│       │   └── api/
│       └── package.json
│
├── packages/
│   ├── db/                     # Database layer
│   │   ├── src/
│   │   │   ├── schema.ts       # Drizzle schema
│   │   │   ├── client.ts       # DB connection
│   │   │   └── migrations/
│   │   └── package.json
│   │
│   ├── auth/                   # Auth logic
│   │   ├── src/
│   │   │   ├── jwt.ts
│   │   │   ├── session.ts
│   │   │   └── middleware.ts
│   │   └── package.json
│   │
│   ├── services/               # Business logic
│   │   ├── src/
│   │   │   ├── tax/
│   │   │   │   ├── taxEngine.ts
│   │   │   │   └── complianceChecker.ts
│   │   │   ├── invoice/
│   │   │   │   ├── invoiceService.ts
│   │   │   │   └── pdfGenerator.ts
│   │   │   └── subscription/
│   │   │       └── billingService.ts
│   │   └── package.json
│   │
│   ├── storage/                # S3/R2 wrapper
│   │   ├── src/
│   │   │   └── s3.ts
│   │   └── package.json
│   │
│   ├── ui/                     # Shared components
│   │   ├── src/
│   │   │   ├── button.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   └── package.json
│   │
│   └── types/                  # Shared types
│       ├── src/
│       │   ├── user.ts
│       │   ├── invoice.ts
│       │   └── transaction.ts
│       └── package.json
│
├── turbo.json                  # Turborepo config
├── package.json                # Root package.json
└── .env.example
```

---

## Database Schema (Drizzle)

```typescript
// packages/db/src/schema.ts
import { pgTable, uuid, varchar, decimal, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  businessName: varchar('business_name', { length: 255 }),
  accountType: varchar('account_type', { length: 50 }).default('personal'),
  subscriptionTier: varchar('subscription_tier', { length: 50 }).default('free'),
  role: varchar('role', { length: 20 }).default('user'), // 'user' | 'staff' | 'admin'
  // ... rest of tenant fields
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'income' | 'expense'
  amount: decimal('amount', { precision: 19, scale: 2 }).notNull(),
  categoryName: varchar('category_name', { length: 100 }),
  description: varchar('description', { length: 500 }),
  isDeductible: boolean('is_deductible').default(false),
  hasVatEvidence: boolean('has_vat_evidence').default(false),
  receiptUrls: jsonb('receipt_urls').default([]),
  syncStatus: varchar('sync_status', { length: 20 }).default('synced'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  amount: decimal('amount', { precision: 19, scale: 2 }).notNull(),
  vatAmount: decimal('vat_amount', { precision: 19, scale: 2 }).default('0'),
  status: varchar('status', { length: 20 }).default('draft'),
  items: jsonb('items').default([]),
  dateIssued: timestamp('date_issued').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  planType: varchar('plan_type', { length: 20 }).default('free'),
  status: varchar('status', { length: 20 }).default('active'),
  paystackCustomerId: varchar('paystack_customer_id', { length: 100 }),
  paystackSubscriptionCode: varchar('paystack_subscription_code', { length: 100 }),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id'),
  action: varchar('action', { length: 100 }).notNull(),
  details: jsonb('details'),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: varchar('user_agent', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
});
```

---

## Offline Strategy (Hybrid Approach)

### What Needs Offline Support

| Feature | Offline? | Why |
|---------|----------|-----|
| Dashboard view | ✅ Yes | Show cached data when offline |
| Create transaction | ✅ Yes | Core use case |
| Create invoice | ✅ Yes | Need to invoice without internet |
| Tax calculations | ✅ Yes | Must work offline |
| Admin panel | ❌ No | Staff always online |
| User management | ❌ No | Requires live data |

### Implementation with Dexie.js

```typescript
// apps/web/lib/offline/db.ts
import Dexie, { Table } from 'dexie';

interface OfflineTransaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  categoryName: string;
  description: string;
  syncStatus: 'pending' | 'synced';
}

class OpCoreOfflineDB extends Dexie {
  transactions!: Table<OfflineTransaction>;
  invoices!: Table<OfflineInvoice>;

  constructor() {
    super('opcore-offline');
    this.version(1).stores({
      transactions: 'id, date, type, syncStatus',
      invoices: 'id, date, status, syncStatus',
    });
  }
}

export const offlineDb = new OpCoreOfflineDB();
```

```typescript
// apps/web/lib/offline/sync.ts
export async function syncPendingTransactions() {
  const pending = await offlineDb.transactions
    .where('syncStatus')
    .equals('pending')
    .toArray();

  for (const tx of pending) {
    try {
      await fetch('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(tx),
      });
      await offlineDb.transactions.update(tx.id, { syncStatus: 'synced' });
    } catch (e) {
      console.log('Sync failed, will retry later');
    }
  }
}

// Register service worker for background sync
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.sync.register('sync-transactions');
  });
}
```

---

## Migration Path: Supabase → Self-Hosted PostgreSQL

### Phase 1: Start with Supabase (Day 1)

```env
# .env
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
```

### Phase 2: Scale to Self-Hosted (When needed)

```env
# .env
DATABASE_URL="postgresql://postgres:password@your-server.com:5432/opcore"
```

**That's it.** Because we use Drizzle with standard PostgreSQL, the switch is just a connection string change.

### When to Migrate

| Trigger | Action |
|---------|--------|
| >10,000 users | Consider migration |
| >$500/mo Supabase bill | Definitely migrate |
| Need custom extensions | Migrate to self-hosted |
| Compliance requirements | Migrate to private cloud |

---

## Environment Variables

```env
# .env.example

# Database (Supabase to start, swap for self-hosted later)
DATABASE_URL="postgresql://..."

# Auth
JWT_SECRET="your-256-bit-secret"
JWT_EXPIRES_IN="7d"

# Storage (Cloudflare R2)
S3_ENDPOINT="https://[account-id].r2.cloudflarestorage.com"
S3_ACCESS_KEY="..."
S3_SECRET_KEY="..."
S3_BUCKET="opcore-uploads"

# Payments
PAYSTACK_SECRET_KEY="sk_live_..."
PAYSTACK_PUBLIC_KEY="pk_live_..."

# Email
RESEND_API_KEY="re_..."

# App
NEXT_PUBLIC_APP_URL="https://opcore.ng"
NEXT_PUBLIC_ADMIN_URL="https://admin.opcore.ng"
```

---

## Summary

This stack gives you:

1. **Speed**: Next.js + Turborepo = ship features fast
2. **Control**: Custom auth, no vendor lock-in
3. **Scalability**: Supabase → Self-hosted path is trivial
4. **Offline**: Dexie.js for critical features
5. **Cost Efficiency**: R2 storage, Supabase free tier to start
6. **Maintainability**: Monorepo with shared packages

**Total estimated migration effort**: 2-3 weeks to rebuild on this stack, but you get a production-ready foundation.
