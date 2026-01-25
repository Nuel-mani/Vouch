# OpCore AI Agent Guide

## Core Directives
1. **Compliance-First**: Every transaction and invoice must align with NTA 2025 regulations.
2. **Local-First**: Respect the "Sync Handshake" between frontend state and the backend database.
3. **Lagos Blue**: Adhere to the design tokens defined in the Branding Guide.
4. **Audit Defense**: Never allow a transaction to be "validated" without a `proofUrl` or verified `receiptUrls`.

## Technical Patterns for Agents
- **Server Actions**: Always check for user sessions using `validateSession` before performing operations.
- **Prisma**: When modifying the database, ensure you run `npx prisma generate` and verify types.
- **Soft Deletes**: Use `deletedAt` for transactions. Never perform hard deletes in code.
- **UI Consistency**: Use `TransactionList.tsx` and `InvoiceList.tsx` as the source of truth for table patterns.

## Domain Knowledge
- **VAT Evidence**: Required for all business expenses > ₦0.
- **R&D Expenses**: Incentivized under NTA 2025; ensure they are flagged in the optimizer.
- **Payee Payee**: Ensure payee names are Business Names, not individuals, for compliance.

---
*Instructional prompt for future Antigravity iterations.*
