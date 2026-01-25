# OpCore Development Guide

## Architecture Overview
OpCore is a Turborepo-powered monorepo:
- `apps/web`: Next.js 14+ (App Router, Server Actions)
- `packages/db`: Prisma & PostgreSQL
- `packages/auth`: Custom session management
- `packages/logic`: Shared business rules (NTA 2025 Tax Engine)

## Standards & Patterns

### 1. Data Persistence
- **Prisma**: All server-side operations must use the centralized `db` client from `@opcore/db`.
- **Soft Deletes**: Always use the `deletedAt` column. Never delete rows permanently unless in a cleanup trigger.
- **Sync Handshake**: Transactions must maintain `serialId` parity between local and backend stores.

### 2. UI Development
- **Tailwind CSS**: Use standard utility classes. Avoid inline styles.
- **Client Components**: Mark interactive components (Modals, Forms) with `'use client'`.
- **Server Actions**: Prefer Server Actions for form submissions and data mutations.

### 3. Error Handling
- Use `try/catch` blocks in Server Actions.
- Provide descriptive `toast` notifications for user feedback.
- Implement `Loading` states with spinners or skeleton screens.

## Common Workflows
- **Schema Changes**:
  1. Modify `schema.prisma`.
  2. Run `npx prisma db push`.
  3. Run `npx prisma generate`.
  4. *Note*: If EPERM occurs, stop the dev server and retry.

---
*Maintained by the Core Team*
