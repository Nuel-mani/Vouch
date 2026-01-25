# Admin Panel Testing Guide

This guide outlines the steps to verify the functionality and security of the OpCore Admin Panel.

## Prerequisites

Ensure you have run the following commands:
```bash
# 1. Generate Prisma client
cd packages/db && npx prisma generate

# 2. Run migrations
npx prisma migrate dev

# 3. Seed database (default credentials)
npx prisma db seed

# 4. Start the admin app
cd ../../apps/admin && npm run dev
```

---

## 🔐 1. Authentication & Authorization

### Test Case 1.1: Unauthorized Access
1. Open a private/incognito window.
2. Navigate to `http://localhost:3001/dashboard` (or `http://localhost:3000/admin` if using rewrite).
3. **Expected:** Redirected to `/login`.

### Test Case 1.2: Login as Admin
1. Navigate to `/login`.
2. Login with `admin@fulrez.com` / `Admin@123`.
3. **Expected:** Redirected to `/dashboard`. Sidebar should show "Super Admin" role.

### Test Case 1.3: Login as Staff (Restricted)
1. Logout.
2. Login with `staff@opcore.ng` / `Staff@123`.
3. **Expected:** Redirected to `/dashboard`. Sidebar should show "Support" role.
4. Try to access restricted actions (e.g., Delete User).
5. **Expected:** Action should fail or button should be disabled (depending on UI implementation).

### Test Case 1.4: Login Failure
1. Try logging in with invalid credentials.
2. **Expected:** Error message "Invalid email or password".

---

## 👥 2. User Management

Navigate to **Users** page.

### Test Case 2.1: View User Details
1. Locate "Demo User" (demo@opcore.ng).
2. Verify email, role, and subscription tier are displayed correctly.

### Test Case 2.2: Change User Role
1. Click "Manage" on a user.
2. Change role from `User` to `Staff`.
3. Click "Update Role".
4. **Expected:** Role updates in the table. Check Audit Logs for record.

### Test Case 2.3: Change Subscription Tier
1. Click "Manage".
2. Change tier from `Pro` to `Enterprise`.
3. Click "Update Tier".
4. **Expected:** Tier updates in the table.

### Test Case 2.4: Suspend User
1. Click "Manage".
2. Click "Suspend" (Danger Zone).
3. **Expected:** User status/role might change or log generated.

---

## 💳 3. Subscription Management

Navigate to **Subscriptions** page.

### Test Case 3.1: Cancel Subscription
1. Find an active subscription.
2. Click "Manage".
3. Click "Cancel Subscription".
4. **Expected:** Status changes to `cancelled`. User tier downgraded to `free`.

### Test Case 3.2: Extend Subscription
1. Click "Manage".
2. Enter `30` days in "Extend Subscription".
3. Click "+30 days".
4. **Expected:** "Current Period End" date increases by 30 days.

---

## ⚖️ 4. Compliance Workflow

Navigate to **Compliance** page.

### Test Case 4.1: Approve Request
1. Find a "Pending" request (you may need to create one via DB or seed).
2. Click "Approve".
3. **Expected:** Status changes to `approved`.

### Test Case 4.2: Reject Request
1. Find a "Pending" request.
2. Click "Reject".
3. Enter reason: "Document unclear".
4. Click "Confirm Reject".
5. **Expected:** Status changes to `rejected`.

---

## 🔌 5. Integrations

Navigate to **Integrations** page.

### Test Case 5.1: Configure Integration
1. Click "Configure" on "Paystack".
2. Enter a dummy secret key.
3. Click "Save Configuration".
4. **Expected:** Success message.

### Test Case 5.2: Toggle Integration
1. Toggle "Enable/Disable" switch inside modal.
2. **Expected:** Status badge updates on the main list.

---

## 📜 6. Audit Logs

Navigate to **Audit Logs** page.

### Test Case 6.1: Verify Logging
1. Perform an action (e.g., Update User Role).
2. Go to Audit Logs.
3. **Expected:** New entry appears at the top describing the action.

### Test Case 6.2: Filtering
1. Filter by Action: `UPDATE`.
2. **Expected:** Only update actions are shown.
3. Search for "demo@opcore.ng".
4. **Expected:** Only logs related to that user are shown.

---

## ⚙️ 7. System Settings

Navigate to **Settings** page.

### Test Case 7.1: Update Settings
1. Change "Tax Rate" or "Platform Name".
2. Click "Save Changes".
3. Refresh page.
4. **Expected:** New values persist.

### Test Case 7.2: Danger Zone
1. Click "Clear Audit Logs" (Only do this on dev!).
2. **Expected:** Logs table becomes empty.
