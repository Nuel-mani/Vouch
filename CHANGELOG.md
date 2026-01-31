# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

## [1.2.2] - 2026-01-30

### Added
- **Admin Alerting System**: Real-time Slack notifications for high-risk administrative actions.
  - **Critical Alerts**: Triggered on User Deletion and Dual Account Unlinking.
  - **Warning Alerts**: Triggered on Transaction Overrides, Transaction Archival, and Switch PIN Resets.

### Fixed
- **Admin Transactions Crash**: Fixed `Decimal objects are not supported` error by implementing server-side serialization of `Decimal` and `Date` fields in `getTransactions`.
- **Next.js 15 Compatibility**: Fixed `Server Error` in Transactions Page by awaiting `searchParams` prop before access, resolving sync/async access violations.
- **CIT Return Form**: Fixed `RC NUMBER` displaying as "RC-PENDING" by correctly mapping `user.cacNumber` in `formMapper.ts`.
- **Branding Studio**: Fixed display issues where `cacNumber` and `linkedUserId` were hidden due to missing fields in Prisma `select`.


## [1.2.1] - 2026-01-30

### Added
- **Admin Dual Account Support**: Full administrative capabilities for managing users with linked personal/business accounts.
  - **Linked Account View**: Admins can see if a user has a linked account and view its details (email, business name).
  - **Switch PIN Reset**: Admins can securely reset the 8-digit Switch PIN for a user, automatically syncing the change to the linked account.
  - **Account Unlinking**: Emergency "Unlink Account" action to break the connection between two profiles.
- **Personal Account Onboarding**: Improved experience for new personal accounts.
  - **Welcome Modal**: A dedicated "Welcome" modal now appears for new personal accounts, prompting them to complete their profile (Rent, Income, etc.) to unlock full features.
- **Account Switching Logic**:
  - **Smart Visibility**: The "Switch Account" button in the sidebar is now strictly conditional, only appearing if a valid `linkedUserId` exists in the database.
  - **Session Handling**: Fixed issues where switching accounts could sometimes lead to a stale session state.

### Fixed
- **Admin User Management**: Fixed runtime error in `UserManageModal` where `DualAccountManager` component was missing.
- **Web App Layout**: Fixed `linkedUserId` not being fetched in the root layout, which caused the "Switch Account" button to disappear for valid dual-account users.
- **Data Serialization**: Fixed server-component crash caused by passing non-serialized `Decimal` types (Rent, Income) to the client-side Welcome Modal.

## [1.2.0] - 2026-01-29

### Added
- **Export Functionality**: Added CSV export capability to lists.
  - **Transaction Export**: Filter-aware CSV export for transactions with headers: Date, Type, Description, Payee, Category, Amount, VAT, Method, Reference, Status.
  - **Invoice Export**: Filter-aware CSV export for invoices with headers: Serial ID, Customer, Email, Amount, VAT, Dates (Issued/Due/Paid), Status, Notes.

## [1.1.0] - 2026-01-29

### Added
- **Email Verification System**: Complete mandatory email verification for new registrations.
  - **Verification Flow**: Secure token generation and email delivery via Resend.
  - **Auto-Login After Verification**: Users are automatically logged in and redirected to dashboard after confirming email.
  - **Smooth Transition Animation**: Fade-out and scale transition before navigating to dashboard.
  - **Strict Login Enforcement**: Unverified users cannot access the dashboard.
  - **Manual Assistance**: "Help Request" flow for users who don't receive emails.
  - **Admin Queue**: Shows ALL unverified users with status badges ("Needs Help" / "Pending") and "Resend Email" / "Manual Verify" actions.
  - **Improved Email Handling**: Support for `EMAIL_FROM` env variable with full format (`Name <email>`).
  - **Better Error Logging**: Detailed Resend API error messages in server logs.
- **Fiscal Engine Standby State**: Upgraded "Tax Exempt" mode with specific tools for valid compliance.
  - **Tabbed Interface**: Added Overview, Forms, and Planner tabs for better organization.
  - **Mandatory Filing**: Enabled "Nil Return" generation for Small Companies (Turnover < ₦25M) as required by NTA 2025.
  - **Compliance Check**: Added tax breakdown showing 0% liability but confirming "Compliant" status.
  - **Tax Shield Planner**: Added predictive simulator for "Future Tax Credits" (Carry-forward Capital Allowances).
- **Edit Transaction Enhancements**: Transaction reclassification and improved category selection.
  - **Transaction Type Selector**: Income/Expense toggle allowing users to reclassify existing transactions.
  - **Dynamic Category Dropdown**: Category dropdown now filters options based on selected transaction type (Income: Sales, Services, Consulting, Rent Income; Expense: Rent, Utilities, Office Supplies, Transport, Salaries, Marketing, Professional Fees).
  - **Smart Category Reset**: Automatically clears category when switching to a type that doesn't support the current selection.
  - **Updated Payment Methods**: Added Bank Transfer and Mobile Money options to match Add Transaction page.

### Changed
- Default theme changed from `system` to `light` - app now loads in light mode by default
- ThemeProvider default updated in `packages/ui/src/ThemeProvider.tsx`
- Root layout theme prop updated in `apps/web/src/app/layout.tsx`
- Moved verify-email page from `(app)` to `(auth)` route group for public access

### Fixed
- **Landing Page Dark Mode**: Fixed mobile menu overlay, hamburger button, and section backgrounds missing dark mode variants
- **TopBar Dropdown Dark Mode**: Fixed profile dropdown missing dark backgrounds, text colors, borders and hover states
- **App Layout**: Fixed suspended state using hardcoded `bg-slate-950` instead of CSS variable
- **Pricing Page**: Fixed purple trust badge missing dark mode variant
- **Email Verification Not Sending**: Fixed `RESEND_API_KEY` not being loaded by web app (added to `apps/web/.env.local`)
- **Admin Queue Not Showing Unverified Users**: Changed query to show all unverified users, not just those who requested help
- **Post-Verification Redirect**: Fixed redirect going to landing page instead of dashboard
- **Drag-and-Drop File Upload (Desktop)**: Fixed file upload drag-and-drop not working on desktop mode.
  - **ImportStatementModal**: Added drag-and-drop handlers with visual feedback for bank statement uploads.
  - **ValidateInvoiceModal**: Replaced transparent file input overlay with proper drag-and-drop support for payment proof uploads.
  - **BrandingForm**: Fixed logo and stamp upload areas to support drag-and-drop with visual feedback.
- **Quick Action "Record Expense"**: Fixed issue where "Record Expense" link didn't pre-select the expense tab.
  - **URL Parameter Handling**: Transaction form now correctly reads `?type=expense` query parameter to initialize form state.

### Added
- **Dark Mode Overhaul**: Comprehensive dark mode support across key pages and modals.
  - **Transaction Pages**: Fixed invisible header text on Add Transaction page and added dark mode to form inputs.
  - **Tax Engine**: Full dark mode styling for compliance dashboard, including tax status banners and expense cards.
  - **Receipt Scanner**: Updated modal background, text, and button styles for dark mode visibility.
  - **Edit Transaction Modal**: Fixed contrast issues for cancel button, inputs, and checkbox labels.
  - **Global Search**: Updated search results dropdown with proper dark mode backgrounds and text colors.
  - **Subscription Page**: Added dark mode variants for pricing plans and billing history tables.
- **Transaction Grouping**: Transactions are now grouped by month and year with sticky headers for better organization.
  - **Invoice Actions**: Shows invoice breakdown (items, subtotal, VAT) for invoice-linked transactions.
  - **Expense Details**: Shows category, receipt, and payment info for bank-imported/manual transactions.


### Fixed
- **Invoice Creation Error**: Fixed "Unique constraint failed" error by using globally unique `refId` (`INV-{uuid}`) instead of user-scoped `serialId` for auto-created transactions.
- **Decimal Serialization Error**: Fixed server-to-client error where `Decimal` and `Date` objects in invoice data caused page crashes. Applied fix to both Transactions and Invoices pages by explicitly converting values to primitives.
- **Transaction Dropdown**: Fixed issue where only "Expense" transactions could be expanded. now all transactions are expandable to show details.

### Removed
- Nothing yet

---

## [1.0.1] - 2026-01-27

### Added
- Initial release of Vouch application
- User authentication with JWT
- Invoice management system
- Transaction tracking
- Tax calculations and reporting
- Admin dashboard
- PM2 production deployment configuration
- Supabase PostgreSQL integration
- Multi-tenant architecture

### Infrastructure
- Monorepo setup with Turborepo
- Next.js 15 for web and admin apps
- Prisma ORM for database management
- Tailwind CSS v4 for styling

---

<!-- Version Links (for reference) -->
[Unreleased]: https://github.com/Nuel-mani/Vouch/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/Nuel-mani/Vouch/releases/tag/v1.0.1
