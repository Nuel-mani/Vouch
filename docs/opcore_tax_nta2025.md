# OpCore Tax Guide (NTA 2025)

## Overview
This guide defines the business logic for Nigerian Tax Act 2025 compliance embedded in OpCore.

## 1. Value Added Tax (VAT) Logic
**Standard Rate:** 7.5%

### Exemptions
-   **Micro Businesses:** Companies with an annual turnover of less than **₦25,000,000 (25 Million Naira)** are **EXEMPT** from charging VAT.
-   **Medical/Pharmaceutical:** Goods in this sector are exempt regardless of turnover.
-   **Basic Food Items:** Exempt.

### Implementation
-   **User Flag:** `User.isVatExempt` (Boolean).
-   **Logic:**
    -   IF `TurnoverBand == 'micro'` -> `isVatExempt = true`.
    -   ELSE -> `isVatExempt = false` (unless specific goods override).

## 2. Personal Income Tax (PIT) Relief
**Consolidated Relief Allowance (CRA):**
-   The higher of ₦200,000 or 1% of Gross Income.
-   PLUS 20% of Gross Income.

### Implementation
-   We capture `Annual Income` during onboarding to estimate this relief.
-   Rent paid counts towards specialized relief in certain states (e.g., Lagos).

## 3. Company Income Tax (CIT)
-   **Rate:**
    -   **Small Co (<25M):** 0% (Tax Holiday).
    -   **Medium Co (25M - 100M):** 20%.
    -   **Large Co (>100M):** 30%.

## 4. Withholding Tax (WHT)
-   Standard logic applies based on vendor type and transaction volume.
-   OpCore tracks this via the "Vendor TIN" field in expenses.
