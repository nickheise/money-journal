# Changelog
All notable changes to the Money Journal app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.1] - 2026-01-02

### Fixed
- **Scroll position bug**: View transitions now always scroll to top, preventing confusing behavior where users would arrive at the bottom of the Activity list when switching from Dashboard
- **Location filter reset**: Activity view location filter now properly resets to "All" when navigating to other views
- **Better error handling**: Added React Error Boundaries to prevent app crashes and show user-friendly error messages

### Added
- **Export functionality**: Users can now export their data to a JSON file for backup
  - Filename format: `money-journal-{username}-{date}.json`
  - Includes all transactions and goals
  - Accessible from user switcher menu (click your name → "Export My Data")
- **Import functionality**: Users can import previously exported data
  - Validates data integrity using Zod schemas
  - Merges with existing data (doesn't overwrite)
  - Skips duplicate transactions/goals automatically
  - Shows clear success/error messages
  - Accessible from user switcher menu (click your name → "Import Data")
- **ErrorBoundary component**: Graceful error handling throughout the app
  - Shows friendly error messages if something breaks
  - Provides "Refresh" and "Try Again" options
  - Displays error details in development mode
  - Prevents white screen crashes
- **Data validation**: All imported data validated against schemas to prevent corruption

### Security
- Added runtime validation for all imported data using Zod schemas
- Prevents malformed or malicious data from corrupting localStorage

### Developer Experience
- Added comprehensive architecture documentation
- Created staff engineer-level analysis documents
- Documented all features and functionality
- Created phased refactoring roadmap (10 weeks)

---

## [1.0.0] - 2026-01-01

### Initial Release

#### Features
- **Transaction Management**
  - Add income and expenses with amounts and descriptions
  - Track money across 4 locations: Wallet, Bank, Piggy Bank, Other
  - Delete transactions with confirmation dialog
  - View recent transactions on dashboard (last 5)
  - View full transaction list with location filters

- **Savings Goals**
  - Create savings goals with target amounts
  - Choose from 5 color themes for goal cards
  - Visual progress bars showing percentage complete
  - Add money to goals with dedicated dialog
  - Delete goals when no longer needed
  - Celebration when goal is reached

- **Multi-User Support**
  - Emoji-based password system (3-6 emoji sequence)
  - Age-appropriate authentication for kids
  - Each user has completely separate data
  - Fast user switching with emoji verification
  - Support for multiple kids on same device

- **Admin/Parent Panel**
  - PIN-protected parent controls (4-digit)
  - View all user accounts
  - Reset user emoji passwords
  - Edit user display names
  - Delete user accounts

- **User Interface**
  - Clean, flat design with calming colors
  - Purple-to-pink gradient brand system
  - Bottom tab navigation (Dashboard, Activity, Goals)
  - Smooth animations with Motion (Framer Motion)
  - Rolling number animations for balance displays
  - Responsive design (mobile-optimized)
  - Fixed header with greeting and user switcher

- **Data Persistence**
  - Full offline functionality
  - localStorage-based persistence
  - No internet required
  - Instant load times
  - All data saved locally on device

#### Design System
- Tailwind CSS v4 with custom theme tokens
- Radix UI components for accessibility
- Consistent spacing and typography
- Generous padding and clean layouts
- No borders (uses light fills instead)
- Fully rounded buttons (pill-shaped)

#### Technical Stack
- React 18.3.1
- TypeScript
- Tailwind CSS v4
- Motion (Framer Motion) v12
- Radix UI primitives
- Vite 6.3.5
- date-fns for date formatting
- Lucide React for icons

---

## Versioning Strategy

**Version Format:** MAJOR.MINOR.PATCH

- **MAJOR**: Breaking changes (data format changes requiring migration)
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes and minor improvements

---

## Upgrade Notes

### 1.0.0 → 1.0.1

**No breaking changes.** This update is 100% backward compatible.

**What you get:**
- Better navigation behavior (scroll resets)
- Data backup capability (export/import)
- Improved error handling

**What to do:**
1. Update to 1.0.1
2. Export your data as a backup (recommended)
3. Save the export file somewhere safe (Google Drive, email, etc.)
4. Export monthly for ongoing protection

**Data format:** No changes. Existing localStorage data works as-is.

---

## Planned Features (Roadmap)

### Version 1.1.0 (Phase 2-3) - Estimated 4-6 weeks
- Context API for state management
- Custom hooks (useTransactions, useGoals, useAuth)
- Repository pattern for data access
- Data validation on all operations
- Migration system for schema changes
- 80%+ test coverage

### Version 1.2.0 (Phase 4) - Estimated 2-3 weeks  
- Atomic component library
- Container/Presenter pattern
- Standardized modal system
- Improved component reusability
- Storybook documentation (maybe)

### Version 1.3.0 (Phase 5-6) - Estimated 3-4 weeks
- Performance optimizations (memoization)
- Virtual scrolling (if needed)
- PWA support (installable app)
- Export scheduling (auto-backup reminders)
- IndexedDB migration (if data grows)

### Future Considerations
- Cloud sync capability (optional)
- Transaction categories
- Spending insights/charts
- Recurring transactions
- Transaction search
- Sorting and filtering options
- Dark mode
- Custom themes

---

**Last Updated:** January 2, 2026  
**Next Update:** After Phase 2 completion
