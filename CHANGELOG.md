# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

<!-- AI AGENTS: Add your changes here under the appropriate category -->
<!-- When releasing, move these to a new version section below -->

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
