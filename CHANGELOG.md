# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

<!-- AI AGENTS: Add your changes here under the appropriate category -->
<!-- When releasing, move these to a new version section below -->

### Added
- Nothing yet

### Changed
- Default theme changed from `system` to `light` - app now loads in light mode by default
- ThemeProvider default updated in `packages/ui/src/ThemeProvider.tsx`
- Root layout theme prop updated in `apps/web/src/app/layout.tsx`

### Fixed
- **Landing Page Dark Mode**: Fixed mobile menu overlay, hamburger button, and section backgrounds missing dark mode variants
- **TopBar Dropdown Dark Mode**: Fixed profile dropdown missing dark backgrounds, text colors, borders and hover states
- **App Layout**: Fixed suspended state using hardcoded `bg-slate-950` instead of CSS variable
- **Pricing Page**: Fixed purple trust badge missing dark mode variant

### Removed
- Nothing yet

---

## [1.0.0] - 2026-01-27

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
[Unreleased]: https://github.com/Nuel-mani/Vouch/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Nuel-mani/Vouch/releases/tag/v1.0.0
