# OpCore AI Agent Guide

## context
You are working on **OpCore**, an offline-first, "Local-Centric" accounting platform for Nigerian businesses. It is built to automate compliance with the **NTA 2025 (Nigerian Tax Act)**.

## Core Directives
1.  **Compliance is King:** Every feature must consider tax implications. (e.g., An invoice isn't just a PDF; it's a tax document that needs a TIN and VAT breakdown).
2.  **Offline-First:** uses WatermelonDB. Assume the user has no internet. Writes go to local DB first, then sync.
3.  **Trust-Based UI:** The design must feel professional and secure. Use "Lagos Blue" logic.

## Key Terminology
-   **TIN:** Tax Identification Number.
-   **NTA 2025:** The regulatory framework we strictly follow.
-   **Turnover Band:** Micro (<25M), Small (<100M), Medium (<500M), Large (>500M). This determines VAT liability.
-   **Brand Studio:** The settings area where business identity is managed.

## Code Standards
-   **Tech:** Next.js 14, Prisma, PostgreSQL, WatermelonDB, Tailwind CSS.
-   **Strict Types:** No `any`. Define interfaces for all DTOs.
-   **Safe Formatting:** Always use helper functions for currency (Naira) formatting to ensure consistency (`₦`).

## Common Tasks & Patterns
-   **Creating User:** Use `@opcore/auth` `register()` function.
-   **Fetching Data:** server-side: `db.user.findUnique()`. client-side: `useUser()` hook or WatermelonDB queries.
-   **Syncing:** The `SyncEngine` handles background synchronization. Do not manually trigger API pushes unless it's a critical immediate action.
