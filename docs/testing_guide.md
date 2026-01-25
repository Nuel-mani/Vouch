# 🧪 OpCore Testing Guide

This guide provides everything you need to test the OpCore platform effectively, including test credentials and key scenarios to verify.

## 🔑 Test Accounts
All passwords for standard test users are `Test@123`. The admin password is `Admin@123`.

| Role | Email | Password | Account Type | Subscription |
|------|-------|----------|--------------|--------------|
| **Admin** | `admin@fulrez.com` | `Admin@123` | Business | Enterprise |
| **Demo User** | `demo@opcore.ng` | `Test@123` | Business | Pro (Active) |
| **Test User 1** | `john@testcompany.com` | `Test@123` | Business | Pro |
| **Test User 2** | `mary@freelancer.com` | `Test@123` | Personal | Pro |
| **Test User 3** | `tech@startup.io` | `Test@123` | Business | Free |

---

## 🚀 Testing Scenarios

### 1. Authentication Flow
- **Goal**: Verify login security and error handling.
- **Steps**:
  1. Go to `http://localhost:3000/login`.
  2. Try logging in with an invalid email. -> *Expect error toast.*
  3. Log in with `demo@opcore.ng`. -> *Expect redirect to /dashboard.*
  4. Click "Logout" in the sidebar. -> *Expect redirect to login.*

### 2. Dashboard & Analytics
- **Goal**: Verify real-time data aggregation.
- **Steps**:
  1. Log in as **Demo User**.
  2. Check the cards: **Balance**, **Income**, and **Expenses**.
  3. Note the values.
  4. Go to **Transactions** → Add a new **Income** of ₦50,000.
  5. Return to Dashboard.
  6. **Verify**: Income and Balance should increase by ₦50,000 immediately.

### 3. Transaction Management
- **Goal**: Test CRUD operations and categorization.
- **Steps**:
  1. Go to the **Transactions** page.
  2. Click "Add Transaction".
  3. Create an **Expense**:
     - Amount: ₦15,000
     - Category: Transport
     - Description: "Uber to client meeting"
  4. **Verify**: The transaction appears in the list with the correct red (-) formatting.

### 4. Invoicing
- **Goal**: Test invoice generation and PDF preview.
- **Steps**:
  1. Go to **Invoices** → "New Invoice".
  2. Select Customer: "ABC Corp" (or enter new).
  3. Add Line Items: "Consulting", Qty: 2, Price: ₦50,000.
  4. Save as **Sent**.
  5. Click on the invoice in the list to view details.
  6. Click "Download PDF" or "Print". -> *Expect a formatted invoice styling.*

### 5. Admin Panel (Separate App)
- **Goal**: Verify admin oversight capabilities.
- **Steps**:
  1. Open a new tab at `http://localhost:3001` (Admin runs on port 3001).
  2. Log in with **Admin** credentials (`admin@fulrez.com`).
  3. Go to **Users**.
  4. **Verify**: You should see "OpCore Demo Account" (the user you just modified) in the list.
  5. Go to **Compliance**.
  6. **Verify**: Any compliance requests submitted by users appear here.

---

## 🛠️ Troubleshooting

**"Login Failed" or Redirect Loop**
- Clear your browser cookies or try Incognito mode.
- Ensure the dev server is running (`npm run dev`).
- Check `apps/web/.env.local` exists and has `JWT_SECRET`.

**"Database Error"**
- Ensure your internet connection is active (database is hosted on Supabase).
- Check `DATABASE_URL` in `.env`.

**Resetting Data**
To wipe and re-seed the database:
```bash
npx prisma db push --force-reset
npx tsx packages/db/prisma/seed.ts
```
