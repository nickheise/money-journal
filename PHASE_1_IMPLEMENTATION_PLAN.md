# Phase 1 Implementation Plan: Critical Bug Fixes
**Money Journal App - Week 1 Deliverables**  
**Timeline:** 5 working days  
**Priority:** P0 (Critical)

---

## 🎯 Phase 1 Objectives

Fix critical user-facing bugs and add essential data safety features before proceeding with larger architectural refactoring.

**Goals:**
1. ✅ Fix scroll position bug (Dashboard → Activity transition)
2. ✅ Add export/import functionality (data safety)
3. ✅ Reset location filter on view change (UX improvement)
4. ✅ Add basic error boundaries (app stability)

**Non-goals:**
- ❌ No architectural refactoring yet
- ❌ No new features
- ❌ No performance optimization
- ❌ Minimal code changes (reduce regression risk)

---

## 📅 Day-by-Day Breakdown

### **Day 1: Scroll Position Bug Fix**
**Estimated Time:** 4-6 hours  
**Priority:** P0

#### Issue Description:
When user scrolls to bottom of recent transactions on Dashboard, then switches to Activity view, they arrive at the BOTTOM of the Activity list instead of the TOP.

#### Root Cause:
React reconciliation reuses the same `TransactionList` component instance across views, preserving DOM scroll state.

#### Solution Options:

**Option A: Force Scroll Reset (Recommended - simplest)**
```typescript
// Add to App.tsx
useEffect(() => {
  // Scroll to top when view changes
  window.scrollTo({ top: 0, behavior: 'smooth' });
}, [currentView]);
```

**Pros:**
- ✅ Simple 3-line change
- ✅ Works for all views
- ✅ No component changes needed

**Cons:**
- ⚠️ Doesn't preserve scroll in views where you might want it

**Option B: Per-View Scroll Management**
```typescript
// Store scroll positions per view
const [scrollPositions, setScrollPositions] = useState({
  dashboard: 0,
  transactions: 0,
  goals: 0,
});

useEffect(() => {
  // Save current position before switching
  setScrollPositions(prev => ({
    ...prev,
    [currentView]: window.scrollY,
  }));
}, [currentView]);

useEffect(() => {
  // Always scroll to top when entering transactions view
  if (currentView === 'transactions') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    // Restore saved position for other views
    window.scrollTo({ top: scrollPositions[currentView], behavior: 'smooth' });
  }
}, [currentView]);
```

**Pros:**
- ✅ Preserves scroll in dashboard (if desired)
- ✅ Always starts at top for Activity view

**Cons:**
- ⚠️ More complex
- ⚠️ Adds state management

**Decision:** Start with Option A, evaluate if Option B is needed

#### Implementation Steps:

1. **Add scroll reset logic to App.tsx**
   ```typescript
   // After line 41 (after useEffect for loading user data)
   
   // Reset scroll position when switching views
   useEffect(() => {
     window.scrollTo({ top: 0, behavior: 'smooth' });
   }, [currentView]);
   ```

2. **Test manually:**
   - [ ] Dashboard → Activity: scrolls to top ✅
   - [ ] Activity → Goals: scrolls to top ✅
   - [ ] Goals → Dashboard: scrolls to top ✅
   - [ ] Smooth animation (not jarring)

3. **Edge cases to test:**
   - [ ] Long transaction list (scroll to bottom, switch views)
   - [ ] Long goals list (scroll to bottom, switch views)
   - [ ] Rapid view switching (no animation queue buildup)

4. **Document decision:**
   Create ADR (Architecture Decision Record):
   ```markdown
   # ADR-001: Scroll Reset on View Change
   
   **Status:** Accepted
   **Date:** 2026-01-02
   
   ## Context
   Users experienced disorienting scroll position preservation when switching views.
   
   ## Decision
   Reset scroll to top on all view changes using window.scrollTo().
   
   ## Consequences
   - Positive: Predictable UX, always start at top
   - Negative: Doesn't preserve scroll in any view
   - Alternative considered: Per-view scroll management (deferred)
   ```

**Files Changed:**
- `src/app/App.tsx` (add useEffect)
- `docs/ADR-001-scroll-reset.md` (create)

**Estimated Lines Changed:** ~3 lines

---

### **Day 2: Location Filter Reset**
**Estimated Time:** 2-3 hours  
**Priority:** P1

#### Issue Description:
Location filter in Activity view persists when navigating to other views, creating confusion.

#### Expected Behavior:
- Filter only visible in Activity view
- Filter resets to "All" when leaving Activity view
- Filter state doesn't affect other views

#### Implementation Steps:

1. **Add filter reset logic to App.tsx**
   ```typescript
   // Add to existing useEffect for currentView
   useEffect(() => {
     // Reset scroll
     window.scrollTo({ top: 0, behavior: 'smooth' });
     
     // Reset location filter when leaving transactions view
     if (currentView !== 'transactions') {
       setLocationFilter('all');
     }
   }, [currentView]);
   ```

2. **Test manually:**
   - [ ] Set filter to "Wallet" in Activity view
   - [ ] Switch to Dashboard → filter resets to "All"
   - [ ] Return to Activity → filter is "All" (reset) ✅
   - [ ] Change filter → switch views → returns to "All" ✅

3. **Consider enhancement:**
   Should filter persist within Activity view session?
   
   **Current behavior:** Resets every time
   **Alternative:** Only reset when leaving Activity for first time
   
   **Decision:** Keep simple reset (current behavior is fine)

**Files Changed:**
- `src/app/App.tsx` (modify existing useEffect)

**Estimated Lines Changed:** ~3 lines

---

### **Day 3: Export/Import Functionality**
**Estimated Time:** 6-8 hours  
**Priority:** P0 (Data Safety)

#### Rationale:
Users have no way to backup data. If browser cache is cleared or device is lost, all data is gone. This is a critical data safety issue.

#### Requirements:

**Export:**
- [ ] Export current user's data to JSON file
- [ ] Include transactions, goals, user metadata
- [ ] Filename: `money-journal-{username}-{date}.json`
- [ ] Validate data before export
- [ ] Download as file

**Import:**
- [ ] Upload JSON file
- [ ] Validate schema (prevent corrupted data)
- [ ] Merge with existing data (don't overwrite)
- [ ] Handle duplicate transactions (skip by ID)
- [ ] Show success/error messages

#### Export Schema:
```typescript
interface ExportData {
  version: 1;                    // Schema version for future migrations
  exportedAt: string;            // ISO timestamp
  appVersion: string;            // App version (from package.json)
  user: {
    name: string;
    transactions: Transaction[];
    goals: Goal[];
  };
}
```

#### Implementation Steps:

**Step 1: Create export utility (2 hours)**

```typescript
// src/app/utils/export-import.ts

import { z } from 'zod';
import { Transaction, Goal, User } from './user-storage';

// Schema validation
const TransactionSchema = z.object({
  id: z.string(),
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  location: z.enum(['wallet', 'bank', 'jar', 'other']),
  description: z.string(),
  date: z.string(),
  category: z.string().optional(),
});

const GoalSchema = z.object({
  id: z.string(),
  name: z.string(),
  targetAmount: z.number().positive(),
  currentAmount: z.number().nonnegative(),
  color: z.string(),
  emoji: z.string().optional(),
});

const ExportDataSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  appVersion: z.string(),
  user: z.object({
    name: z.string(),
    transactions: z.array(TransactionSchema),
    goals: z.array(GoalSchema),
  }),
});

export type ExportData = z.infer<typeof ExportDataSchema>;

/**
 * Export user data to JSON
 */
export const exportUserData = (user: User): ExportData => {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    appVersion: '1.0.0', // TODO: Read from package.json
    user: {
      name: user.name,
      transactions: user.transactions,
      goals: user.goals,
    },
  };
};

/**
 * Download export data as JSON file
 */
export const downloadExport = (data: ExportData, filename: string): void => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Validate and parse import data
 */
export const validateImportData = (json: string): ExportData => {
  const parsed = JSON.parse(json);
  return ExportDataSchema.parse(parsed); // Throws if invalid
};

/**
 * Import data into current user
 * Returns { imported: number, skipped: number }
 */
export const importUserData = (
  currentUser: User,
  importData: ExportData,
  onUpdate: (user: User) => void
): { imported: number; skipped: number } => {
  const existingTransactionIds = new Set(
    currentUser.transactions.map(t => t.id)
  );
  const existingGoalIds = new Set(
    currentUser.goals.map(g => g.id)
  );

  // Import transactions (skip duplicates)
  const newTransactions = importData.user.transactions.filter(
    t => !existingTransactionIds.has(t.id)
  );

  // Import goals (skip duplicates)
  const newGoals = importData.user.goals.filter(
    g => !existingGoalIds.has(g.id)
  );

  // Update user
  const updatedUser = {
    ...currentUser,
    transactions: [...currentUser.transactions, ...newTransactions],
    goals: [...currentUser.goals, ...newGoals],
  };

  onUpdate(updatedUser);

  return {
    imported: newTransactions.length + newGoals.length,
    skipped: importData.user.transactions.length + importData.user.goals.length - (newTransactions.length + newGoals.length),
  };
};
```

**Step 2: Add Export/Import UI to UserSwitcher (3 hours)**

```typescript
// Modify src/app/components/user-switcher.tsx

import { Download, Upload } from 'lucide-react';
import { exportUserData, downloadExport, validateImportData, importUserData } from '../utils/export-import';
import { format } from 'date-fns';
import { useState, useRef } from 'react';

// Add to UserSwitcher component
const [importError, setImportError] = useState<string | null>(null);
const [importSuccess, setImportSuccess] = useState<string | null>(null);
const fileInputRef = useRef<HTMLInputElement>(null);

const handleExport = () => {
  if (!currentUser) return;
  
  const exportData = exportUserData(currentUser);
  const filename = `money-journal-${currentUser.name}-${format(new Date(), 'yyyy-MM-dd')}.json`;
  downloadExport(exportData, filename);
  
  // Optional: Show success toast
  alert('Data exported successfully!');
};

const handleImportClick = () => {
  fileInputRef.current?.click();
};

const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setImportError(null);
  setImportSuccess(null);

  try {
    const text = await file.text();
    const importData = validateImportData(text);
    
    const result = importUserData(
      currentUser!,
      importData,
      (updatedUser) => {
        // Update storage
        updateUserData(currentUser!.id, {
          transactions: updatedUser.transactions,
          goals: updatedUser.goals,
        });
        
        // Refresh app state
        onSwitch(currentUser!.id);
      }
    );

    setImportSuccess(
      `Imported ${result.imported} items. ${result.skipped} duplicates skipped.`
    );
  } catch (error) {
    if (error instanceof Error) {
      setImportError(`Import failed: ${error.message}`);
    } else {
      setImportError('Import failed: Invalid file format');
    }
  }

  // Reset file input
  e.target.value = '';
};

// Add to JSX (in modal content, after Switch User button)
<div className="border-t border-border pt-4 space-y-2">
  <Button
    onClick={handleExport}
    variant="outline"
    className="w-full rounded-xl"
  >
    <Download className="w-5 h-5 mr-2" />
    Export My Data
  </Button>
  
  <input
    ref={fileInputRef}
    type="file"
    accept=".json"
    onChange={handleFileSelect}
    className="hidden"
  />
  
  <Button
    onClick={handleImportClick}
    variant="outline"
    className="w-full rounded-xl"
  >
    <Upload className="w-5 h-5 mr-2" />
    Import Data
  </Button>
  
  {importError && (
    <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
      {importError}
    </div>
  )}
  
  {importSuccess && (
    <div className="text-sm text-green-600 bg-green-100 rounded-lg p-3">
      {importSuccess}
    </div>
  )}
</div>
```

**Step 3: Install Zod for validation (15 min)**

```bash
npm install zod
```

**Step 4: Testing (2 hours)**

Test cases:
- [ ] Export data creates valid JSON file
- [ ] Filename includes username and date
- [ ] Exported data includes all transactions
- [ ] Exported data includes all goals
- [ ] Import valid export file succeeds
- [ ] Import shows count of imported items
- [ ] Import skips duplicate transactions (same ID)
- [ ] Import skips duplicate goals (same ID)
- [ ] Import invalid JSON shows error
- [ ] Import wrong schema version shows error
- [ ] Import corrupted data shows error
- [ ] Export → Import → No data loss

**Step 5: Documentation (30 min)**

Create user guide:
```markdown
# How to Backup Your Money Journal Data

## Export Your Data
1. Click your name in the top right
2. Click "Export My Data"
3. Save the file somewhere safe (Google Drive, email to yourself)

## Import Your Data
1. Click your name in the top right
2. Click "Import Data"
3. Select your backup file
4. Your data will be merged (no duplicates)

## When to Backup
- Before clearing browser cache
- Once a month (just in case)
- Before switching browsers
- Before getting a new device
```

**Files Changed:**
- `src/app/utils/export-import.ts` (create ~200 lines)
- `src/app/components/user-switcher.tsx` (add ~60 lines)
- `package.json` (add zod dependency)
- `docs/USER_GUIDE_BACKUP.md` (create)

**Dependencies Added:**
- `zod` (schema validation)

---

### **Day 4: Error Boundaries**
**Estimated Time:** 3-4 hours  
**Priority:** P1

#### Rationale:
Currently, if any component throws an error, the entire app crashes (white screen). Error boundaries will catch errors and show a friendly fallback UI.

#### Implementation Steps:

**Step 1: Create ErrorBoundary component (2 hours)**

```typescript
// src/app/components/ErrorBoundary.tsx

import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console (in future, send to error tracking service)
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl p-8 max-w-md w-full border border-border text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            
            <h2 className="text-xl font-medium mb-2">Oops! Something went wrong</h2>
            
            <p className="text-sm text-muted-foreground mb-6">
              Don't worry, your data is safe. Try refreshing the page.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-6">
                <summary className="text-sm font-medium cursor-pointer mb-2">
                  Error Details (dev only)
                </summary>
                <pre className="text-xs bg-secondary p-3 rounded-lg overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            
            <div className="space-y-2">
              <Button
                onClick={() => window.location.reload()}
                className="w-full rounded-xl"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh Page
              </Button>
              
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="w-full rounded-xl"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Step 2: Wrap App with ErrorBoundary (15 min)**

```typescript
// src/main.tsx (or wherever App is rendered)

import { ErrorBoundary } from './app/components/ErrorBoundary';

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
```

**Step 3: Add granular error boundaries (1 hour)**

```typescript
// Wrap critical sections in App.tsx

// Around transaction list
<ErrorBoundary fallback={<div className="p-4 text-center text-muted-foreground">Failed to load transactions</div>}>
  <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} />
</ErrorBoundary>

// Around goals section
<ErrorBoundary fallback={<div className="p-4 text-center text-muted-foreground">Failed to load goals</div>}>
  <GoalsSection 
    goals={goals}
    onAddGoal={handleAddGoal}
    onUpdateGoal={handleUpdateGoal}
    onDeleteGoal={handleDeleteGoal}
  />
</ErrorBoundary>
```

**Step 4: Testing (1 hour)**

Test error scenarios:
- [ ] Throw error in TransactionList → Shows fallback, app continues
- [ ] Throw error in GoalsSection → Shows fallback, app continues
- [ ] Throw error in root App → Shows full-page error UI
- [ ] Click "Refresh" → Page reloads
- [ ] Click "Try Again" → Error boundary resets
- [ ] Error details shown in dev mode only

**Files Changed:**
- `src/app/components/ErrorBoundary.tsx` (create ~150 lines)
- `src/main.tsx` (wrap with ErrorBoundary)
- `src/app/App.tsx` (add granular boundaries)

---

### **Day 5: Testing & Documentation**
**Estimated Time:** 6-8 hours  
**Priority:** P1

#### Manual Testing Checklist:

**Scroll Position:**
- [ ] Dashboard → Activity: Scroll resets to top
- [ ] Activity → Goals: Scroll resets to top
- [ ] Goals → Dashboard: Scroll resets to top
- [ ] Scroll animations are smooth (not jarring)
- [ ] Works on mobile (touch scroll)

**Location Filter:**
- [ ] Set filter to "Wallet" in Activity
- [ ] Switch to Dashboard → Filter resets to "All"
- [ ] Return to Activity → Filter is "All"
- [ ] Set filter again → Switch views → Resets

**Export:**
- [ ] Export creates JSON file
- [ ] Filename includes username and current date
- [ ] JSON is valid and pretty-printed
- [ ] Contains all transactions
- [ ] Contains all goals
- [ ] Contains metadata (version, timestamp)

**Import:**
- [ ] Import previously exported file succeeds
- [ ] Shows success message with count
- [ ] Duplicate transactions are skipped
- [ ] Duplicate goals are skipped
- [ ] Invalid JSON shows error
- [ ] Wrong schema version shows error
- [ ] Missing required fields shows error

**Error Boundaries:**
- [ ] Component error doesn't crash entire app
- [ ] Shows user-friendly error message
- [ ] "Refresh" button reloads page
- [ ] "Try Again" button resets error state
- [ ] Error details shown in dev mode only

**Regression Testing:**
- [ ] Login still works
- [ ] Add transaction still works
- [ ] Delete transaction still works
- [ ] Add goal still works
- [ ] Update goal progress still works
- [ ] Delete goal still works
- [ ] User switching still works
- [ ] Admin panel still works

#### Documentation Updates:

**1. Update CHANGELOG.md:**
```markdown
# Changelog

## [1.0.1] - 2026-01-06

### Fixed
- Scroll position now resets when switching between views
- Location filter resets when leaving Activity view
- Better error handling with error boundaries

### Added
- Export/Import functionality for data backup
- User guide for backing up data
- Error boundaries to prevent app crashes
```

**2. Update README.md:**
```markdown
## Features

- 💰 Track money across multiple locations (wallet, bank, piggy bank)
- 🎯 Set and track savings goals with visual progress
- 👥 Multi-user support with emoji passwords
- 🔒 Parent admin panel for user management
- 💾 **Export/Import data for backup**
- 📱 Fully offline-capable
- 🎨 Clean, calm UI designed for kids

## Data Backup

Your data is stored locally in your browser. To prevent data loss:

1. Export your data regularly (Settings → Export My Data)
2. Save the export file somewhere safe (Google Drive, email)
3. Import it if you need to restore (Settings → Import Data)

See [docs/USER_GUIDE_BACKUP.md](docs/USER_GUIDE_BACKUP.md) for details.
```

**3. Create ADR for Error Boundaries:**
```markdown
# ADR-002: Error Boundaries

**Status:** Accepted
**Date:** 2026-01-06

## Context
App crashes (white screen) when component throws error, losing user context.

## Decision
Add React Error Boundaries at:
1. Root level (full-page fallback)
2. Feature level (granular fallback)

## Consequences
- Positive: Graceful error handling, better UX
- Negative: Adds ~150 lines of code
- Trade-off: Class component required (React limitation)
```

**4. Update ARCHITECTURE_DOCUMENTATION.md:**
- Mark Phase 1 tasks as complete
- Update "Current Issues" section
- Document export/import feature

---

## 🎯 Acceptance Criteria

### Definition of Done:

- [ ] All code changes committed to feature branch
- [ ] Manual testing checklist complete
- [ ] Documentation updated (README, CHANGELOG, ADRs)
- [ ] No new TypeScript errors
- [ ] No new console warnings
- [ ] Build succeeds
- [ ] App deploys successfully

### User Experience Validation:

- [ ] Can export data and download JSON file
- [ ] Can import exported data successfully
- [ ] Scroll resets feel natural (not jarring)
- [ ] Filter behavior is predictable
- [ ] Error messages are friendly (kid-appropriate)

### Code Quality:

- [ ] New code follows existing patterns
- [ ] TypeScript types complete
- [ ] Comments explain "why" not "what"
- [ ] No `any` types added
- [ ] No console.logs left in production code

---

## 📊 Metrics & Success Criteria

### Before Phase 1:
- **Critical bugs**: 2 (scroll position, no data backup)
- **Medium bugs**: 1 (filter doesn't reset)
- **User risk**: High (data loss possible)
- **Error handling**: None (crashes on error)

### After Phase 1:
- **Critical bugs**: 0 ✅
- **Medium bugs**: 0 ✅
- **User risk**: Low (export/import available) ✅
- **Error handling**: Full coverage ✅

---

## 🚧 Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Export corrupts data** | Low | High | Validate before export, test thoroughly |
| **Import overwrites data** | Low | High | Merge instead of replace, skip duplicates |
| **Scroll reset breaks something** | Low | Medium | Extensive manual testing |
| **Error boundary hides bugs** | Medium | Low | Show errors in dev mode, log to console |
| **Breaking existing functionality** | Low | High | Full regression testing |

---

## 📦 Deliverables Checklist

### Code:
- [ ] `src/app/App.tsx` - Scroll reset + filter reset
- [ ] `src/app/utils/export-import.ts` - Export/import logic (new file)
- [ ] `src/app/components/user-switcher.tsx` - Export/import UI
- [ ] `src/app/components/ErrorBoundary.tsx` - Error boundaries (new file)
- [ ] `src/main.tsx` - Wrap app in ErrorBoundary
- [ ] `package.json` - Add zod dependency

### Documentation:
- [ ] `docs/ADR-001-scroll-reset.md` (new file)
- [ ] `docs/ADR-002-error-boundaries.md` (new file)
- [ ] `docs/USER_GUIDE_BACKUP.md` (new file)
- [ ] `CHANGELOG.md` (update)
- [ ] `README.md` (update)
- [ ] `ARCHITECTURE_DOCUMENTATION.md` (update)

### Testing:
- [ ] Manual test checklist completed
- [ ] Export/import tested with real data
- [ ] Error boundary tested with forced errors
- [ ] Regression testing passed

---

## 🔄 Post-Phase 1 Actions

### Immediate:
1. **Deploy to staging** - Test in production-like environment
2. **User acceptance testing** - Have test users try export/import
3. **Monitor for issues** - Watch for any new bugs

### Planning for Phase 2:
1. **Review Phase 1 learnings** - What worked? What didn't?
2. **Finalize Phase 2 scope** - State management refactor
3. **Set up testing infrastructure** - Vitest, testing library
4. **Create detailed Phase 2 plan** - Like this document

---

## ✅ Sign-off

**Ready to begin:** Awaiting approval to proceed  
**Estimated completion:** End of Week 1  
**Risk level:** LOW (minimal code changes, high test coverage)

**Next review:** End of Day 3 (check progress on export/import)

---

**Questions before starting?**
- Any concerns about the approach?
- Should we add any additional features to Phase 1?
- Do we need approval for adding the `zod` dependency?
- What's the process for deploying after Phase 1?
