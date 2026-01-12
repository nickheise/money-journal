# Money Journal App - Architecture Documentation
**Created:** January 2, 2026  
**Last Updated:** January 2, 2026  
**Version:** 1.0.0

---

## 📋 Executive Summary

This document provides a comprehensive technical analysis of the Money Journal app, a personal finance tracking application designed for kids aged 8-15. This documentation serves as a living reference that will be maintained independent of code changes to ensure no functionality is lost during refactoring.

---

## 🏗️ Architecture Overview

### Design Philosophy
- **Offline-first**: Full functionality without internet connection
- **Local persistence**: All data stored in browser localStorage
- **Multi-user support**: Emoji-based password authentication
- **Clean, calm UI**: Flat design, generous spacing, gradient accents
- **Mobile-optimized**: Bottom tab navigation, touch-friendly

### Technology Stack
```json
{
  "framework": "React 18.3.1",
  "language": "TypeScript",
  "styling": "Tailwind CSS v4",
  "animation": "Motion (Framer Motion) v12",
  "ui_components": "Radix UI primitives",
  "build_tool": "Vite 6.3.5",
  "state_management": "React useState/useEffect (local state)",
  "data_persistence": "localStorage API"
}
```

---

## 📁 File Structure

```
/src/app/
├── App.tsx                          # Main app component, navigation controller
├── components/
│   ├── admin-panel.tsx              # Parent/admin controls panel
│   ├── bottom-tab-bar.tsx           # Fixed bottom navigation
│   ├── dashboard.tsx                # Main dashboard view
│   ├── emoji-password.tsx           # Emoji password input component
│   ├── goals-section.tsx            # Savings goals management
│   ├── guilloche-background.tsx     # Decorative background component
│   ├── location-segment-control.tsx # Location filter UI
│   ├── rolling-number.tsx           # Animated number display
│   ├── segment-control.tsx          # Generic segment control
│   ├── transaction-form.tsx         # Add/edit transaction modal
│   ├── transaction-list.tsx         # Transaction list display
│   ├── type-segment-control.tsx     # Income/expense filter
│   ├── user-login.tsx               # Login/signup flow
│   ├── user-switcher.tsx            # User account switcher
│   └── ui/                          # Radix UI components (40+ files)
├── utils/
│   ├── animation-config.ts          # Motion animation presets
│   ├── storage.ts                   # Generic storage utilities
│   └── user-storage.ts              # Multi-user data layer
└── styles/
    ├── fonts.css                    # Font imports
    ├── index.css                    # Global styles entry
    ├── tailwind.css                 # Tailwind directives
    └── theme.css                    # Design tokens and typography
```

---

## 🎯 Core Features & Functionality

### 1. **Multi-User System**
**Files:** `user-storage.ts`, `user-login.tsx`, `user-switcher.tsx`

#### User Authentication
- **Emoji-based passwords**: 3-6 emoji sequence
- **No traditional passwords**: Age-appropriate security
- **Pattern matching**: Exact sequence required
- **Automatic login**: After successful auth

#### User Data Structure
```typescript
interface User {
  id: string;                    // Unique identifier (timestamp + random)
  name: string;                  // Display name
  emojiPassword: string[];       // Array of emoji strings
  transactions: Transaction[];   // User's transaction history
  goals: Goal[];                 // User's savings goals
  createdAt: string;            // ISO timestamp
}
```

#### User Operations
- `createUser(name, emojiPassword)` - Create new user
- `authenticateUser(userId, emojiPassword)` - Verify login
- `switchUser(userId)` - Change active user
- `getCurrentUser()` - Get logged-in user
- `getAllUsers()` - List all users
- `deleteUser(userId)` - Remove user (admin only)

### 2. **Transaction Management**
**Files:** `transaction-form.tsx`, `transaction-list.tsx`, `dashboard.tsx`

#### Transaction Data Structure
```typescript
interface Transaction {
  id: string;                           // Unique identifier
  amount: number;                       // Transaction amount (positive)
  type: 'income' | 'expense';          // Transaction direction
  location: 'wallet' | 'bank' | 'jar' | 'other'; // Money location
  description: string;                  // User-entered description
  date: string;                         // ISO timestamp
  category?: string;                    // Optional categorization
}
```

#### Location System
Four predefined locations for tracking money:
- **Wallet** (🟢 Green): Physical cash
- **Bank** (🔵 Blue): Bank account/savings
- **Piggy Bank/Jar** (🌸 Pink): Physical savings
- **Other** (🟡 Yellow): Other sources

#### Transaction Operations
- `addTransaction(userId, transaction)` - Create transaction
- `deleteTransaction(userId, transactionId)` - Remove transaction
- `getTotalBalance(transactions)` - Calculate total money
- `getBalanceByLocation(transactions)` - Calculate per-location balances

#### Transaction Form Flow
1. User clicks "+/- Money" or add button
2. Modal opens with transaction form
3. Select income/expense via segment control
4. Choose location via location buttons
5. Enter dollar amount (large animated input)
6. Enter description
7. Submit → transaction added to list
8. Modal closes, dashboard updates

### 3. **Savings Goals**
**Files:** `goals-section.tsx`

#### Goal Data Structure
```typescript
interface Goal {
  id: string;                    // Unique identifier
  name: string;                  // Goal name (e.g., "New bike")
  targetAmount: number;          // Goal target in dollars
  currentAmount: number;         // Current progress
  color: string;                 // Gradient class for card
  emoji?: string;                // Optional emoji decoration
}
```

#### Goal Colors
Five predefined gradient options:
- Purple: `from-purple-400 to-purple-600`
- Green: `from-green-400 to-emerald-600`
- Pink: `from-pink-400 to-rose-600`
- Blue: `from-blue-400 to-cyan-600`
- Orange: `from-orange-400 to-amber-600`

#### Goal Operations
- `addGoal(userId, goal)` - Create new goal
- `updateGoal(userId, goalId, updates)` - Update goal (usually currentAmount)
- `deleteGoal(userId, goalId)` - Remove goal

#### Goal Card Features
- **Visual progress bar**: Animated fill based on percentage
- **Add money button**: Quick add to goal
- **Goal completion**: Shows 🎉 when target reached
- **Delete on hover**: Trash icon appears on hover

### 4. **Navigation System**
**Files:** `App.tsx`, `bottom-tab-bar.tsx`

#### View Types
```typescript
type View = 'dashboard' | 'transactions' | 'goals';
```

#### Navigation Structure
- **Bottom Tab Bar**: Fixed bottom navigation (z-index: 40)
- **Three main views**: Dashboard, Activity (transactions), Goals
- **Animated transitions**: Fade in/out between views (200ms duration)
- **Shared layout animation**: Tab indicator slides between buttons

#### Current Navigation Behavior
- View state stored in `App.tsx` as `currentView`
- View changes trigger AnimatePresence transitions
- **ISSUE**: No scroll position management between views
- **ISSUE**: Shared component instances maintain scroll state

### 5. **Admin/Parent Panel**
**Files:** `admin-panel.tsx`

#### Admin Features
- **PIN-protected access**: 4-digit numeric PIN
- **First-time setup**: Create PIN on first use
- **User management**: View all users, delete users
- **Password reset**: Change user emoji passwords
- **Name updates**: Edit user display names

#### Admin Operations
- `hasAdminPin()` - Check if PIN is set
- `setAdminPin(pin)` - Create admin PIN
- `authenticateAdmin(pin)` - Verify admin access
- `resetUserPassword(userId, newPassword)` - Change user password
- `updateUserName(userId, newName)` - Update user name

---

## 💾 Data Architecture

### Storage Strategy
**Implementation:** `user-storage.ts`

#### Storage Key
```typescript
const STORAGE_KEY = 'money_journal_users';
```

#### App State Structure
```typescript
interface AppState {
  users: User[];              // Array of all user accounts
  currentUserId: string | null; // Currently logged-in user ID
  adminPin?: string;          // Parent/admin 4-digit PIN
}
```

#### Storage Operations
```typescript
// Read from localStorage
const getAppState = (): AppState => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : defaultState;
}

// Write to localStorage
const saveAppState = (state: AppState): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
```

### Data Flow Pattern
**Current implementation uses a hybrid approach:**

1. **Read Operation:**
   ```
   Component → Call storage function → getAppState() → 
   Parse JSON → Find user → Return data → Update React state
   ```

2. **Write Operation:**
   ```
   User action → Component handler → Call storage function → 
   getAppState() → Modify state object → saveAppState() → 
   Stringify JSON → Write to localStorage → Update React state
   ```

### Data Consistency Issues
⚠️ **IDENTIFIED PROBLEM**: State duplication and sync risks
- Data lives in TWO places: localStorage + React state
- Updates require manual synchronization
- React state in `App.tsx`: `transactions`, `goals`, `currentUser`
- Every mutation must update BOTH localStorage AND React state
- Risk of inconsistency if one update fails or is forgotten

---

## 🎨 Component Architecture

### Component Hierarchy
```
App (Root)
├── UserLogin (if not authenticated)
│   ├── EmojiPassword
│   └── AdminPanel (modal)
├── Header (fixed, z-40)
│   └── UserSwitcher (modal)
├── Main Content (animated view switching)
│   ├── Dashboard
│   │   ├── RollingNumber (balance displays)
│   │   └── TransactionList (recent 5)
│   ├── TransactionList (full list with filters)
│   │   └── AlertDialog (delete confirmation)
│   └── GoalsSection
│       └── Modal (add money dialog)
├── TransactionForm (modal)
└── BottomTabBar (fixed, z-40)
```

### Component Communication Patterns

#### 1. **Prop Drilling** (Current pattern)
```
App.tsx
  ├─ transactions[] ────┐
  ├─ onDelete() ────────┤
  │                     ├──> Dashboard ──> TransactionList
  │                     │
  └─ goals[] ───────────┼──> GoalsSection
     onAddGoal() ───────┘
     onUpdateGoal()
     onDeleteGoal()
```

**Issues:**
- Deep prop chains (3+ levels)
- Many callback functions passed down
- Difficult to add intermediate components
- Changes require updating multiple files

#### 2. **Modal Management** (Inconsistent)
Different modal patterns used:
- `TransactionForm`: Uses AnimatePresence + custom modal
- `GoalsSection`: Uses custom Modal component with portals
- `TransactionList`: Uses Radix AlertDialog
- `UserSwitcher`: Uses custom Modal component
- `AdminPanel`: Uses custom Modal component

### State Management Analysis

#### Current Approach: Local State + Props
```typescript
// App.tsx holds ALL application state
const [currentUser, setCurrentUser] = useState<User | null>(null);
const [transactions, setTransactions] = useState<Transaction[]>([]);
const [goals, setGoals] = useState<Goal[]>([]);
const [showTransactionForm, setShowTransactionForm] = useState(false);
const [currentView, setCurrentView] = useState<View>('dashboard');
const [locationFilter, setLocationFilter] = useState<...>('all');
```

**Advantages:**
✅ Simple to understand  
✅ Co-located with component  
✅ Good for small apps  
✅ No additional dependencies  

**Disadvantages:**
❌ Prop drilling through multiple levels  
❌ Duplicate state (localStorage + React)  
❌ Manual synchronization required  
❌ Difficult to share state across distant components  
❌ View-specific state mixed with app state  
❌ No state persistence across view changes  

---

## ⚠️ Identified Issues & Risks

### 🔴 CRITICAL: Scroll Position Bug
**Reported Issue:** "When on dashboard scrolled to bottom of recent list, switching to Activity tab arrives at BOTTOM of Activity list. Expected: arrive at TOP."

**Root Cause:**
- `TransactionList` component is rendered in BOTH dashboard and transactions view
- Same component instance maintains scroll state
- DOM element persists across view changes due to React reconciliation
- No scroll reset on view change

**Technical Details:**
```tsx
// Dashboard view (App.tsx lines 156-176)
<TransactionList
  transactions={transactions.slice(0, 5)}  // First 5
  onDelete={handleDeleteTransaction}
/>

// Transactions view (App.tsx lines 250-255)
<TransactionList
  transactions={locationFilter === 'all' ? transactions : filtered}
  onDelete={handleDeleteTransaction}
/>
```

React sees the same component type in the same position and reuses it, preserving scroll position.

**Impact:** Medium-High  
**User Experience:** Confusing, unexpected behavior

### 🔴 CRITICAL: Data Synchronization Risk
**Issue:** Manual state management creates inconsistency risk

**Example Pattern:**
```typescript
const handleDeleteTransaction = (id: string) => {
  if (!currentUser) return;
  
  // Step 1: Update localStorage
  deleteTransaction(currentUser.id, id);
  
  // Step 2: Update React state
  setTransactions((prev) => prev.filter((t) => t.id !== id));
};
```

**Risks:**
- If Step 1 succeeds but Step 2 fails → UI shows stale data
- If browser crashes between steps → inconsistent state
- If developer forgets Step 2 → silent data loss
- No single source of truth

**Impact:** High  
**Data Integrity:** At risk

### 🟡 MEDIUM: No State Management Library
**Issue:** App complexity exceeds threshold for local state

**Evidence:**
- 6 state variables in App.tsx
- 11 handler functions
- Props passed 3+ levels deep
- Modal state scattered across components
- Filter state tied to specific view

**Threshold Analysis:**
- **Current complexity**: Medium (multi-user, transactions, goals, navigation)
- **Recommended for local state**: Simple apps with 1-2 features
- **Recommendation**: Context API or lightweight state manager

**Impact:** Medium  
**Maintainability:** Declining

### 🟡 MEDIUM: Lack of View-Level State Isolation
**Issue:** View-specific state (filters, scroll) lives in App.tsx

**Problems:**
- `locationFilter` only relevant to transactions view
- Stored in App.tsx, clutters global state
- Reset required on view change (not implemented)
- Can't have per-view scroll positions

**Better Pattern:**
Each view should own its state:
```typescript
// transactions view should manage:
- locationFilter
- scroll position
- sort order
- search query

// goals view should manage:
- showForm state
- form values
- scroll position
```

**Impact:** Medium  
**Code Organization:** Poor

### 🟡 MEDIUM: Inconsistent Modal Patterns
**Issue:** Three different modal implementations

**Inventory:**
1. **Custom Modal with Portal** (`Modal.tsx`)
   - Used by: GoalsSection, UserSwitcher, AdminPanel
   - Props: isOpen, onClose, className, children

2. **AnimatePresence + Custom**
   - Used by: TransactionForm
   - Own implementation, no shared component

3. **Radix AlertDialog**
   - Used by: TransactionList (delete confirmation)
   - Full-featured dialog primitive

**Risks:**
- Inconsistent z-index (potential overlap)
- Different animation behaviors
- Duplicated logic
- Harder to maintain

**Impact:** Low-Medium  
**Code Quality:** Inconsistent

### 🟢 LOW: Missing TypeScript Strictness
**Issue:** Some type safety gaps

**Examples:**
- Loose localStorage parsing (no validation)
- Any-type risks in Radix UI components
- Optional chaining overuse (masks potential bugs)

**Impact:** Low  
**Type Safety:** Moderate

### 🟢 LOW: Performance Considerations
**Current State:** No identified performance issues

**Potential Future Issues:**
- No virtualization for long transaction lists
- Re-rendering entire lists on single item change
- No memoization of expensive calculations
- All transactions loaded in memory

**When to address:**
- Transaction count > 500
- Noticeable scroll lag
- Slow filter operations

**Impact:** Low (current), Medium (future)

---

## ���� Composability Analysis

### Current Composability Score: 4/10

#### ✅ What's Composable:
1. **UI Components** (`/ui` folder)
   - Fully composable Radix primitives
   - Reusable across app
   - Consistent API

2. **Utility Functions** (`user-storage.ts`)
   - Pure functions for calculations
   - `getTotalBalance()`, `getBalanceByLocation()`
   - Easy to test and reuse

3. **Animation Configs** (`animation-config.ts`)
   - Shared animation presets
   - Consistent motion language

#### ❌ What's Not Composable:

1. **Feature Components Tightly Coupled**
   - `Dashboard` requires specific prop shape
   - Can't easily reuse `TransactionList` in other contexts
   - `GoalsSection` has built-in form logic

2. **Data Layer Mixed with Business Logic**
   - `user-storage.ts` does both persistence AND calculations
   - Hard to swap storage backend
   - Can't easily add caching layer

3. **No Separation of Concerns**
   ```typescript
   // Example: addTransaction does THREE things
   addTransaction(userId, transaction) {
     // 1. Generate ID (business logic)
     // 2. Modify data structure (data transform)
     // 3. Persist to storage (I/O)
   }
   ```

4. **View Components Do Too Much**
   - `Dashboard` handles layout + data display + filtering
   - Can't reuse balance cards separately
   - Can't swap layout without rewriting component

### Composability Improvements Needed:
1. Extract business logic from storage layer
2. Create data hooks (`useTransactions`, `useGoals`)
3. Split feature components into smaller pieces
4. Introduce container/presenter pattern

---

## 🚀 Performance Analysis

### Current Performance: Good (for current scale)

#### Measured Metrics:
- **Initial load**: Fast (< 100ms from localStorage)
- **View transitions**: Smooth (200ms fade)
- **Modal animations**: Smooth (Motion library)
- **List rendering**: Fast (< 100 items currently)

#### Performance Risks:

1. **No List Virtualization**
   - All transactions rendered in DOM
   - Problem when > 500 transactions
   - Solution: React Window or TanStack Virtual

2. **Unnecessary Re-renders**
   ```typescript
   // Every transaction change re-renders entire Dashboard
   setTransactions((prev) => [newTransaction, ...prev]);
   // This triggers re-render of:
   // - Total balance card
   // - All location cards
   // - Recent transaction list
   // - Even if balance didn't change
   ```

3. **No Memoization**
   - Balance calculations run on every render
   - Filter operations not memoized
   - Sorted lists recalculated repeatedly

4. **localStorage Synchronous Writes**
   - Blocks main thread
   - Every mutation writes entire state
   - Solution: Debounce writes, use IndexedDB for large data

#### Performance Optimization Opportunities:

1. **React.memo** for pure components
   ```typescript
   export const TransactionList = memo(({ transactions, onDelete }) => {
     // Only re-render if transactions change
   });
   ```

2. **useMemo** for calculations
   ```typescript
   const totalBalance = useMemo(
     () => getTotalBalance(transactions),
     [transactions]
   );
   ```

3. **Debounce localStorage writes**
   ```typescript
   const debouncedSave = useDebounce(saveAppState, 500);
   ```

4. **Virtual scrolling** for long lists

### Performance Verdict:
✅ Current performance is GOOD  
⚠️ Will need optimization when data scales  
📊 Monitor transaction count as leading indicator

---

## 📊 Data Persistence Analysis

### Current Strategy: localStorage JSON

#### How It Works:
```typescript
// Single key stores entire app state
localStorage.setItem('money_journal_users', JSON.stringify({
  users: [...],
  currentUserId: "...",
  adminPin: "..."
}));
```

#### Advantages:
✅ Simple API  
✅ Synchronous (no async complexity)  
✅ Works offline  
✅ Good browser support  
✅ Adequate for small datasets  

#### Disadvantages:
❌ **5-10MB storage limit** (varies by browser)  
❌ **Synchronous I/O blocks main thread**  
❌ **No indexing or querying**  
❌ **String-based (serialization overhead)**  
❌ **No transactions (atomic operations)**  
❌ **Lost if cache cleared**  
❌ **Not encrypted**  

### Storage Limit Analysis:

#### Current Data Size (estimated):
```
Single transaction: ~150 bytes
Single goal: ~100 bytes
Single user: ~200 bytes + transactions + goals

Example user with 500 transactions, 10 goals:
  User object: 200 bytes
  Transactions: 500 × 150 = 75,000 bytes (75 KB)
  Goals: 10 × 100 = 1,000 bytes (1 KB)
  Total per user: ~76 KB

5 users: 380 KB
10 users: 760 KB

localStorage limit: ~5-10 MB
Estimated capacity: 60-130 users with 500 transactions each
```

**Verdict:** Adequate for target use case (family with 2-5 kids)

### Data Loss Risks:

1. **Browser Cache Clearing**
   - Users clear cache → all data lost
   - **Mitigation**: Export/import functionality needed

2. **Incognito/Private Mode**
   - Data not persisted
   - **Mitigation**: Warning on detection

3. **Browser Switching**
   - Data doesn't sync across browsers
   - **Mitigation**: Export feature

4. **Device Loss**
   - Phone lost → data lost
   - **Mitigation**: Cloud backup (future)

### Alternative Storage Options:

| Storage | Limit | Async | Queryable | Encrypted | Recommendation |
|---------|-------|-------|-----------|-----------|----------------|
| **localStorage** | 5-10 MB | ❌ | ❌ | ❌ | ✅ Current (OK) |
| **IndexedDB** | 50 MB - unlimited | ✅ | ✅ | ❌ | ✅ Better for scale |
| **Supabase** | Unlimited | ✅ | ✅ | ✅ | ⚠️ Requires internet |
| **PouchDB** | Unlimited | ✅ | ✅ | ❌ | ✅ Offline + sync option |

### Recommended Migration Path:
1. **Phase 1** (current): localStorage (adequate)
2. **Phase 2** (if > 1000 transactions/user): IndexedDB
3. **Phase 3** (if cloud sync needed): PouchDB + CouchDB or Supabase

---

## 🎯 Refactoring Plan

### Guiding Principles:
1. **Incremental changes** - No big-bang rewrites
2. **Backward compatible** - Don't break existing data
3. **Test coverage first** - Add tests before refactoring
4. **Document decisions** - ADRs (Architecture Decision Records)
5. **User-facing first** - Fix scroll bug before internal improvements

---

### Phase 1: Critical Bug Fixes (Week 1)
**Goal:** Fix scroll position issue, improve UX

#### 1.1 Fix Scroll Position Bug
**Priority:** P0 (Critical)

**Approach:**
- Add scroll reset on view change
- Separate TransactionList instances per view
- Store scroll position in view-level state

**Implementation:**
```typescript
// Option A: Force scroll to top on view change
useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}, [currentView]);

// Option B: Separate component instances
// Dashboard: <RecentTransactionList />
// Activity: <FullTransactionList />
```

**Files to modify:**
- `App.tsx` - Add scroll reset
- Consider splitting `TransactionList` component

**Success Criteria:**
- [ ] Dashboard → Activity transition scrolls to top
- [ ] Activity → Dashboard maintains position
- [ ] Smooth scroll animation

#### 1.2 Reset Location Filter on View Change
**Priority:** P1 (High)

**Issue:** Location filter persists when navigating away from transactions view

**Implementation:**
```typescript
useEffect(() => {
  if (currentView !== 'transactions') {
    setLocationFilter('all');
  }
}, [currentView]);
```

**Files to modify:**
- `App.tsx`

**Success Criteria:**
- [ ] Filter resets to "All" when leaving transactions view
- [ ] Filter state doesn't affect other views

---

### Phase 2: State Management Foundation (Week 2-3)
**Goal:** Establish proper state management, eliminate prop drilling

#### 2.1 Introduce React Context for User Data
**Priority:** P1 (High)

**Create UserContext:**
```typescript
// contexts/UserContext.tsx
interface UserContextValue {
  currentUser: User | null;
  transactions: Transaction[];
  goals: Goal[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
}

export const UserProvider = ({ children }) => {
  // State and logic moved from App.tsx
};

export const useUser = () => useContext(UserContext);
```

**Migration:**
```typescript
// Before: App.tsx
<Dashboard
  transactions={transactions}
  onAddTransaction={() => setShowTransactionForm(true)}
/>

// After: Dashboard.tsx
const { transactions } = useUser();
```

**Benefits:**
- ✅ Eliminates prop drilling
- ✅ Single source of truth
- ✅ Easier to add new consumers
- ✅ Better code organization

**Files to create:**
- `contexts/UserContext.tsx`

**Files to modify:**
- `App.tsx` - Remove state, add provider
- `Dashboard.tsx` - Use context
- `TransactionList.tsx` - Use context
- `GoalsSection.tsx` - Use context

**Success Criteria:**
- [ ] All components access data via context
- [ ] No data props passed through App.tsx
- [ ] Tests pass
- [ ] No regressions

#### 2.2 Create Custom Hooks for Data Operations
**Priority:** P1 (High)

**Hooks to Create:**

```typescript
// hooks/useTransactions.ts
export const useTransactions = () => {
  const { currentUser } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (currentUser) {
      setTransactions(currentUser.transactions);
    }
  }, [currentUser]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    if (!currentUser) return;
    const newTransaction = addTransactionToStorage(currentUser.id, transaction);
    setTransactions(prev => [newTransaction, ...prev]);
  }, [currentUser]);

  const deleteTransaction = useCallback((id: string) => {
    if (!currentUser) return;
    deleteTransactionFromStorage(currentUser.id, id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, [currentUser]);

  const totalBalance = useMemo(
    () => getTotalBalance(transactions),
    [transactions]
  );

  const balanceByLocation = useMemo(
    () => getBalanceByLocation(transactions),
    [transactions]
  );

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    totalBalance,
    balanceByLocation,
  };
};

// hooks/useGoals.ts
export const useGoals = () => {
  // Similar pattern for goals
};

// hooks/useAuth.ts
export const useAuth = () => {
  const login = (userId: string) => { /* ... */ };
  const logout = () => { /* ... */ };
  const switchUser = (userId: string) => { /* ... */ };
  
  return { currentUser, login, logout, switchUser };
};
```

**Benefits:**
- ✅ Reusable data access logic
- ✅ Built-in memoization
- ✅ Type-safe API
- ✅ Testable in isolation

**Files to create:**
- `hooks/useTransactions.ts`
- `hooks/useGoals.ts`
- `hooks/useAuth.ts`

**Success Criteria:**
- [ ] Components use hooks instead of direct storage calls
- [ ] Calculations memoized
- [ ] Tests for each hook

#### 2.3 Separate View State from App State
**Priority:** P2 (Medium)

**Move view-specific state to view components:**

```typescript
// pages/TransactionsView.tsx
export const TransactionsView = () => {
  const { transactions, deleteTransaction } = useTransactions();
  const [locationFilter, setLocationFilter] = useState('all');
  const [scrollPosition, setScrollPosition] = useState(0);

  // Save scroll on unmount
  useEffect(() => {
    return () => setScrollPosition(window.scrollY);
  }, []);

  // Restore scroll on mount
  useEffect(() => {
    window.scrollTo(0, scrollPosition);
  }, []);

  // View-specific logic here
};

// pages/GoalsView.tsx
export const GoalsView = () => {
  const { goals, addGoal, updateGoal, deleteGoal } = useGoals();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});

  // View-specific logic here
};
```

**Benefits:**
- ✅ Each view owns its state
- ✅ Independent scroll positions
- ✅ Cleaner App.tsx
- ✅ Easier to test views

**Files to create:**
- `pages/DashboardView.tsx`
- `pages/TransactionsView.tsx`
- `pages/GoalsView.tsx`

**Files to modify:**
- `App.tsx` - Import and render views

**Success Criteria:**
- [ ] App.tsx only handles navigation
- [ ] Each view manages own state
- [ ] Scroll positions independent per view

---

### Phase 3: Data Layer Refactoring (Week 4-5)
**Goal:** Improve data integrity, prepare for scaling

#### 3.1 Create Data Access Layer (DAL)
**Priority:** P1 (High)

**Separate concerns:**

```typescript
// lib/storage/storage-adapter.ts
export interface StorageAdapter {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  remove(key: string): Promise<void>;
}

export class LocalStorageAdapter implements StorageAdapter {
  async get(key: string) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }
  
  async set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  
  async remove(key: string) {
    localStorage.removeItem(key);
  }
}

// lib/storage/user-repository.ts
export class UserRepository {
  constructor(private storage: StorageAdapter) {}

  async getAllUsers(): Promise<User[]> {
    const state = await this.storage.get(STORAGE_KEY);
    return state?.users || [];
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find(u => u.id === id) || null;
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const newUser = { ...user, id: generateId() };
    const state = await this.storage.get(STORAGE_KEY);
    state.users.push(newUser);
    await this.storage.set(STORAGE_KEY, state);
    return newUser;
  }

  // ... other methods
}

// lib/storage/transaction-repository.ts
export class TransactionRepository {
  constructor(private storage: StorageAdapter) {}

  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    const user = await this.userRepo.getUserById(userId);
    return user?.transactions || [];
  }

  async addTransaction(userId: string, transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const newTransaction = { ...transaction, id: generateId() };
    const state = await this.storage.get(STORAGE_KEY);
    const user = state.users.find(u => u.id === userId);
    user.transactions.unshift(newTransaction);
    await this.storage.set(STORAGE_KEY, state);
    return newTransaction;
  }

  // ... other methods
}
```

**Benefits:**
- ✅ Swappable storage backend
- ✅ Testable with mock storage
- ✅ Single responsibility
- ✅ Type-safe operations
- ✅ Async-ready (for IndexedDB migration)

**Files to create:**
- `lib/storage/storage-adapter.ts`
- `lib/storage/user-repository.ts`
- `lib/storage/transaction-repository.ts`
- `lib/storage/goal-repository.ts`
- `lib/storage/index.ts` (exports)

**Files to replace:**
- `utils/user-storage.ts` (migrate functions)

**Success Criteria:**
- [ ] All storage operations go through repositories
- [ ] No direct localStorage access in components/hooks
- [ ] Tests for each repository
- [ ] Backward compatible data format

#### 3.2 Add Data Validation Layer
**Priority:** P2 (Medium)

**Validate data on read/write:**

```typescript
// lib/validation/schemas.ts
import { z } from 'zod';

export const TransactionSchema = z.object({
  id: z.string(),
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  location: z.enum(['wallet', 'bank', 'jar', 'other']),
  description: z.string().min(1).max(200),
  date: z.string().datetime(),
  category: z.string().optional(),
});

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  emojiPassword: z.array(z.string()).min(3).max(6),
  transactions: z.array(TransactionSchema),
  goals: z.array(GoalSchema),
  createdAt: z.string().datetime(),
});

export const AppStateSchema = z.object({
  users: z.array(UserSchema),
  currentUserId: z.string().nullable(),
  adminPin: z.string().regex(/^\d{4}$/).optional(),
});

// lib/storage/storage-adapter.ts
export class ValidatedLocalStorageAdapter implements StorageAdapter {
  async get(key: string) {
    const value = localStorage.getItem(key);
    if (!value) return null;
    
    const parsed = JSON.parse(value);
    const validated = AppStateSchema.parse(parsed); // Throws if invalid
    return validated;
  }
  
  async set(key: string, value: any) {
    const validated = AppStateSchema.parse(value); // Validate before save
    localStorage.setItem(key, JSON.stringify(validated));
  }
}
```

**Benefits:**
- ✅ Runtime type safety
- ✅ Catch corrupted data
- ✅ Prevent invalid writes
- ✅ Better error messages

**Dependencies to add:**
- `zod` (or `yup`)

**Files to create:**
- `lib/validation/schemas.ts`

**Files to modify:**
- `lib/storage/storage-adapter.ts`

**Success Criteria:**
- [ ] All data validated on read
- [ ] Invalid data caught with clear errors
- [ ] Schemas documented

#### 3.3 Add Data Migration System
**Priority:** P2 (Medium)

**Handle schema changes over time:**

```typescript
// lib/storage/migrations.ts
interface Migration {
  version: number;
  up: (state: any) => any;
  down: (state: any) => any;
}

const migrations: Migration[] = [
  {
    version: 1,
    up: (state) => {
      // Add version field to state
      return { ...state, version: 1 };
    },
    down: (state) => {
      const { version, ...rest } = state;
      return rest;
    },
  },
  {
    version: 2,
    up: (state) => {
      // Add category field to transactions
      return {
        ...state,
        users: state.users.map(user => ({
          ...user,
          transactions: user.transactions.map(t => ({
            ...t,
            category: t.category || 'uncategorized',
          })),
        })),
        version: 2,
      };
    },
    down: (state) => {
      return {
        ...state,
        users: state.users.map(user => ({
          ...user,
          transactions: user.transactions.map(t => {
            const { category, ...rest } = t;
            return rest;
          }),
        })),
        version: 1,
      };
    },
  },
];

export const runMigrations = (state: any): any => {
  const currentVersion = state.version || 0;
  const targetVersion = migrations.length;

  if (currentVersion === targetVersion) {
    return state;
  }

  let migratedState = state;
  for (let i = currentVersion; i < targetVersion; i++) {
    migratedState = migrations[i].up(migratedState);
  }

  return migratedState;
};

// lib/storage/storage-adapter.ts
export class MigratingLocalStorageAdapter implements StorageAdapter {
  async get(key: string) {
    const value = localStorage.getItem(key);
    if (!value) return null;
    
    const parsed = JSON.parse(value);
    const migrated = runMigrations(parsed);
    
    // Save migrated version
    if (migrated.version > parsed.version) {
      await this.set(key, migrated);
    }
    
    return migrated;
  }
}
```

**Benefits:**
- ✅ Safe schema evolution
- ✅ Backward compatible
- ✅ Automatic data upgrades
- ✅ Rollback capability

**Files to create:**
- `lib/storage/migrations.ts`

**Files to modify:**
- `lib/storage/storage-adapter.ts`

**Success Criteria:**
- [ ] Migrations run on app load
- [ ] Old data format auto-upgraded
- [ ] Version tracked in storage
- [ ] Tests for each migration

---

### Phase 4: Component Refactoring (Week 6-7)
**Goal:** Improve component composability and reusability

#### 4.1 Extract Presentational Components
**Priority:** P2 (Medium)

**Separate data-fetching from rendering:**

```typescript
// components/TransactionList/TransactionListPresenter.tsx
interface TransactionListPresenterProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  emptyState?: React.ReactNode;
}

export const TransactionListPresenter = ({
  transactions,
  onDelete,
  emptyState,
}: TransactionListPresenterProps) => {
  if (transactions.length === 0) {
    return emptyState || <DefaultEmptyState />;
  }

  return (
    <div className="space-y-3">
      {transactions.map(transaction => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          onDelete={() => onDelete(transaction.id)}
        />
      ))}
    </div>
  );
};

// components/TransactionList/TransactionListContainer.tsx
export const TransactionListContainer = ({ limit }: { limit?: number }) => {
  const { transactions, deleteTransaction } = useTransactions();
  const displayTransactions = limit
    ? transactions.slice(0, limit)
    : transactions;

  return (
    <TransactionListPresenter
      transactions={displayTransactions}
      onDelete={deleteTransaction}
    />
  );
};

// Usage:
// <TransactionListContainer limit={5} /> // Dashboard
// <TransactionListContainer /> // Full list
```

**Benefits:**
- ✅ Easy to test presenter (no data dependencies)
- ✅ Reusable in different contexts
- ✅ Clear separation of concerns
- ✅ Can use presenter in Storybook

**Pattern to apply to:**
- `TransactionList`
- `GoalsSection`
- `Dashboard`

**Files to create:**
- `components/TransactionList/TransactionListPresenter.tsx`
- `components/TransactionList/TransactionListContainer.tsx`
- `components/GoalsList/GoalsListPresenter.tsx`
- `components/GoalsList/GoalsListContainer.tsx`

**Success Criteria:**
- [ ] Presenters have no hooks
- [ ] Containers handle data fetching
- [ ] Both testable independently

#### 4.2 Create Atomic Components
**Priority:** P2 (Medium)

**Extract reusable pieces:**

```typescript
// components/BalanceCard/BalanceCard.tsx
interface BalanceCardProps {
  title: string;
  amount: number;
  icon?: React.ReactNode;
  variant?: 'default' | 'gradient';
  onClick?: () => void;
}

export const BalanceCard = ({
  title,
  amount,
  icon,
  variant = 'default',
  onClick,
}: BalanceCardProps) => {
  return (
    <div
      className={cn(
        'rounded-3xl p-8',
        variant === 'gradient'
          ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white'
          : 'bg-secondary'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <div className="text-sm opacity-90">{title}</div>
      </div>
      <div className="text-5xl">
        <RollingNumber value={amount} />
      </div>
    </div>
  );
};

// components/LocationCard/LocationCard.tsx
export const LocationCard = ({
  location,
  amount,
  icon,
  colorClass,
}: LocationCardProps) => {
  return (
    <div className={cn('rounded-2xl p-6', colorClass)}>
      <div className="flex items-center gap-2 mb-4 opacity-60">
        {icon}
        <span className="text-sm">{location}</span>
      </div>
      <div className="text-3xl">
        <RollingNumber value={amount} />
      </div>
    </div>
  );
};

// Usage in Dashboard:
const Dashboard = () => {
  const { totalBalance, balanceByLocation } = useTransactions();
  
  return (
    <>
      <BalanceCard
        title="Total Money"
        amount={totalBalance}
        variant="gradient"
      />
      
      <div className="flex gap-4">
        {Object.entries(balanceByLocation).map(([location, amount]) => (
          <LocationCard
            key={location}
            location={location}
            amount={amount}
            icon={locationIcons[location]}
            colorClass={locationColors[location]}
          />
        ))}
      </div>
    </>
  );
};
```

**Benefits:**
- ✅ Reusable across app
- ✅ Storybook-ready
- ✅ Easy to theme/style
- ✅ Single responsibility

**Components to extract:**
- `BalanceCard`
- `LocationCard`
- `TransactionItem`
- `GoalCard`
- `EmptyState`

**Files to create:**
- `components/BalanceCard/BalanceCard.tsx`
- `components/LocationCard/LocationCard.tsx`
- `components/TransactionItem/TransactionItem.tsx`
- `components/GoalCard/GoalCard.tsx`
- `components/EmptyState/EmptyState.tsx`

**Success Criteria:**
- [ ] Each component single-purpose
- [ ] Fully typed props
- [ ] Used in multiple places

#### 4.3 Standardize Modal Pattern
**Priority:** P1 (High)

**Use single modal component everywhere:**

```typescript
// components/ui/modal.tsx (enhance existing)
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
}: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[100]">
          <motion.div
            className="absolute inset-0 bg-black/50"
            onClick={closeOnOverlayClick ? onClose : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <div className="relative z-[101] flex items-center justify-center min-h-screen p-4">
            <motion.div
              className={cn(
                'bg-background rounded-3xl border border-border',
                sizeClasses[size]
              )}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {title && (
                <div className="border-b border-border px-6 py-4">
                  <h3 className="text-lg font-medium">{title}</h3>
                  {description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {description}
                    </p>
                  )}
                </div>
              )}
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              <div className="p-6">{children}</div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Migrate all modals:
// TransactionForm → use Modal
// GoalsSection add money → use Modal
// UserSwitcher → use Modal
// AdminPanel → use Modal
```

**Benefits:**
- ✅ Consistent behavior
- ✅ Single z-index system
- ✅ Unified animations
- ✅ Easier to maintain

**Files to modify:**
- `components/ui/modal.tsx` (enhance)
- `components/transaction-form.tsx`
- `components/goals-section.tsx`
- `components/user-switcher.tsx`
- `components/admin-panel.tsx`

**Success Criteria:**
- [ ] All modals use same component
- [ ] Consistent animations
- [ ] No z-index conflicts
- [ ] Accessible (focus trap, ESC to close)

---

### Phase 5: Testing & Documentation (Week 8)
**Goal:** Ensure stability and maintainability

#### 5.1 Add Unit Tests
**Priority:** P1 (High)

**Test coverage targets:**
- **Utilities**: 100% (pure functions)
- **Repositories**: 90%
- **Hooks**: 80%
- **Components**: 70%

**Testing tools:**
```json
{
  "vitest": "Test runner",
  "@testing-library/react": "Component testing",
  "@testing-library/user-event": "User interactions",
  "@testing-library/jest-dom": "DOM matchers"
}
```

**Example tests:**

```typescript
// lib/storage/transaction-repository.test.ts
describe('TransactionRepository', () => {
  let storage: StorageAdapter;
  let repo: TransactionRepository;

  beforeEach(() => {
    storage = new InMemoryStorageAdapter(); // Mock
    repo = new TransactionRepository(storage);
  });

  it('should add transaction to user', async () => {
    const userId = 'user123';
    const transaction = {
      amount: 10,
      type: 'income',
      location: 'wallet',
      description: 'Allowance',
      date: new Date().toISOString(),
    };

    const result = await repo.addTransaction(userId, transaction);

    expect(result).toMatchObject(transaction);
    expect(result.id).toBeDefined();
  });

  it('should delete transaction', async () => {
    // ... test implementation
  });
});

// hooks/useTransactions.test.ts
describe('useTransactions', () => {
  it('should return transactions for current user', () => {
    const { result } = renderHook(() => useTransactions(), {
      wrapper: ({ children }) => (
        <UserProvider>
          {children}
        </UserProvider>
      ),
    });

    expect(result.current.transactions).toEqual([]);
  });

  it('should add transaction', async () => {
    // ... test implementation
  });
});

// components/BalanceCard/BalanceCard.test.tsx
describe('BalanceCard', () => {
  it('should render amount', () => {
    render(
      <BalanceCard
        title="Total Money"
        amount={100.50}
      />
    );

    expect(screen.getByText('Total Money')).toBeInTheDocument();
    expect(screen.getByText('$100.50')).toBeInTheDocument();
  });
});
```

**Files to create:**
- `lib/storage/*.test.ts`
- `hooks/*.test.ts`
- `components/**/*.test.tsx`
- `vitest.config.ts`
- `test/setup.ts`

**Success Criteria:**
- [ ] 80%+ code coverage
- [ ] All critical paths tested
- [ ] CI runs tests on PR

#### 5.2 Add Integration Tests
**Priority:** P2 (Medium)

**Test user flows:**

```typescript
// e2e/transaction-flow.test.tsx
describe('Transaction Flow', () => {
  it('should add income transaction', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Login
    await user.click(screen.getByText('Test User'));
    await user.click(screen.getByText('😀'));
    await user.click(screen.getByText('🎉'));
    await user.click(screen.getByText('🚀'));

    // Add transaction
    await user.click(screen.getByText('+/- Money'));
    await user.click(screen.getByText('Income'));
    await user.click(screen.getByText('Wallet'));
    await user.type(screen.getByPlaceholderText('0'), '10');
    await user.type(screen.getByPlaceholderText('What was it for?'), 'Allowance');
    await user.click(screen.getByText('Add Transaction'));

    // Verify
    expect(screen.getByText('+$10.00')).toBeInTheDocument();
    expect(screen.getByText('Allowance')).toBeInTheDocument();
  });
});
```

**Success Criteria:**
- [ ] Login flow tested
- [ ] Add transaction flow tested
- [ ] Add goal flow tested
- [ ] Delete operations tested

#### 5.3 Add Storybook
**Priority:** P3 (Low)

**Document UI components:**

```typescript
// components/BalanceCard/BalanceCard.stories.tsx
export default {
  title: 'Components/BalanceCard',
  component: BalanceCard,
} as Meta;

export const Default: Story = {
  args: {
    title: 'Total Money',
    amount: 250.75,
  },
};

export const Gradient: Story = {
  args: {
    title: 'Total Money',
    amount: 250.75,
    variant: 'gradient',
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Wallet',
    amount: 50.25,
    icon: <Wallet className="w-5 h-5" />,
  },
};
```

**Benefits:**
- ✅ Visual component documentation
- ✅ Isolated component development
- ✅ Design system reference

**Success Criteria:**
- [ ] All atomic components in Storybook
- [ ] Multiple variants shown
- [ ] Deployed to static site

---

### Phase 6: Performance & Polish (Week 9-10)
**Goal:** Optimize performance, add polish

#### 6.1 Add Performance Optimizations
**Priority:** P2 (Medium)

**Implement:**

1. **Memoization:**
```typescript
// hooks/useTransactions.ts
const totalBalance = useMemo(
  () => getTotalBalance(transactions),
  [transactions]
);

const balanceByLocation = useMemo(
  () => getBalanceByLocation(transactions),
  [transactions]
);

const filteredTransactions = useMemo(
  () => transactions.filter(t => t.location === locationFilter),
  [transactions, locationFilter]
);
```

2. **Component Memoization:**
```typescript
export const TransactionItem = memo(({ transaction, onDelete }) => {
  // Only re-render if transaction changes
});

export const LocationCard = memo(({ location, amount }) => {
  // Only re-render if props change
});
```

3. **Debounced localStorage:**
```typescript
// hooks/useDebounce.ts
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Use in storage adapter:
const debouncedState = useDebounce(state, 500);

useEffect(() => {
  saveAppState(debouncedState);
}, [debouncedState]);
```

4. **Virtual scrolling** (if > 500 items):
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

export const VirtualizedTransactionList = ({ transactions }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Row height
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <TransactionItem
            key={transactions[virtualItem.index].id}
            transaction={transactions[virtualItem.index]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
```

**Success Criteria:**
- [ ] No unnecessary re-renders (React DevTools Profiler)
- [ ] Smooth scrolling with 1000+ transactions
- [ ] localStorage writes batched

#### 6.2 Add Export/Import Feature
**Priority:** P1 (High) - Data safety

**Implement:**

```typescript
// lib/export.ts
export const exportData = (userId: string): string => {
  const state = getAppState();
  const user = state.users.find(u => u.id === userId);
  
  if (!user) throw new Error('User not found');

  const exportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    user: {
      name: user.name,
      transactions: user.transactions,
      goals: user.goals,
    },
  };

  return JSON.stringify(exportData, null, 2);
};

export const downloadExport = (userId: string, fileName: string) => {
  const data = exportData(userId);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};

export const importData = (userId: string, jsonData: string): void => {
  const data = JSON.parse(jsonData);
  
  // Validate schema
  const validated = ExportSchema.parse(data);
  
  // Merge with existing data
  const state = getAppState();
  const user = state.users.find(u => u.id === userId);
  
  if (!user) throw new Error('User not found');

  user.transactions = [
    ...user.transactions,
    ...validated.user.transactions,
  ];
  user.goals = [
    ...user.goals,
    ...validated.user.goals,
  ];

  saveAppState(state);
};

// components/ExportButton.tsx
export const ExportButton = () => {
  const { currentUser } = useAuth();

  const handleExport = () => {
    if (!currentUser) return;
    const fileName = `money-journal-${currentUser.name}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    downloadExport(currentUser.id, fileName);
  };

  return (
    <Button onClick={handleExport}>
      <Download className="w-5 h-5 mr-2" />
      Export Data
    </Button>
  );
};
```

**Add to:**
- User settings menu
- Admin panel

**Success Criteria:**
- [ ] Export creates JSON file
- [ ] Import validates and merges data
- [ ] No data loss on export/import

#### 6.3 Add PWA Support
**Priority:** P2 (Medium)

**Make app installable:**

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Money Journal',
        short_name: 'Money Journal',
        description: 'Personal money tracking for kids',
        theme_color: '#8b5cf6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
    }),
  ],
});
```

**Benefits:**
- ✅ Installable on mobile
- ✅ Works offline (already does, but official)
- ✅ App-like experience
- ✅ Home screen icon

**Success Criteria:**
- [ ] App installable on iOS/Android
- [ ] Works offline
- [ ] Updates automatically

---

## 🔍 Questions & Clarifications Needed

Before proceeding with refactoring, I need answers to these questions:

### **Q1: Data Migration Strategy**
When we refactor the storage layer:
- Should we maintain backward compatibility with existing localStorage data?
- Or is it acceptable to require users to export/import?
- Are there real users with real data, or is this still in development?

**Recommendation:** Backward compatible auto-migration

---

### **Q2: Testing Requirements**
What level of test coverage do you want?
- **Option A**: Critical paths only (auth, transactions, goals)
- **Option B**: 80%+ code coverage with unit + integration tests
- **Option C**: Full coverage including UI components

**Recommendation:** Option B

---

### **Q3: Storage Scaling**
What's the expected usage pattern?
- How many kids per family? (affects multi-user optimization)
- Expected transaction volume per month?
- Keep all history forever, or archive old data?

**This affects:**
- Whether IndexedDB migration is needed
- Virtual scrolling priority
- Export/archive feature importance

**Recommendation:** Design for 5 users × 1000 transactions = 5K records

---

### **Q4: Feature Priorities**
Which features are most important to the target users?
- **Transactions**: Core feature, must be perfect
- **Goals**: Important, or nice-to-have?
- **Multi-user**: Critical, or could be simplified?
- **Admin panel**: Essential, or optional?

**This affects:**
- Refactoring order
- Where to invest optimization effort

**Recommendation:** Prioritize transactions > multi-user > goals > admin

---

### **Q5: Performance Targets**
What devices/browsers must we support?
- Modern iOS/Android only?
- Older devices (3+ years old)?
- Desktop browsers?

**This affects:**
- Polyfill requirements
- Animation complexity
- Bundle size budget

**Recommendation:** iOS Safari 15+, Chrome 100+, last 2 years devices

---

### **Q6: Deployment & CI/CD**
Do you have:
- Continuous integration set up?
- Automated testing?
- Deployment pipeline?

**This affects:**
- Test automation priority
- Deployment of Storybook
- Version control strategy

**Recommendation:** Set up GitHub Actions for tests + preview deploys

---

### **Q7: Design System**
Should we formalize the design system?
- Document color tokens, spacing, typography
- Create design system package
- Add Storybook for component showcase

**This affects:**
- Theme consistency
- Component documentation
- Designer-developer workflow

**Recommendation:** Yes, use Tailwind v4 theme tokens + Storybook

---

## 📊 Risk Assessment Summary

| Risk | Severity | Likelihood | Mitigation |
|------|----------|-----------|------------|
| **Scroll position bug** | High | Certain | Fix in Phase 1 |
| **Data loss (cache clear)** | Critical | Medium | Add export/import |
| **State sync issues** | High | Medium | Refactor to context + repos |
| **localStorage limits** | Medium | Low | Monitor, prepare IndexedDB |
| **Performance degradation** | Low | Low | Add memoization |
| **Breaking changes during refactor** | High | Medium | Incremental changes + tests |
| **User confusion (navigation)** | Medium | Medium | Fix scroll, add transitions |

---

## 🎯 Success Metrics

### Code Quality Metrics:
- [ ] Test coverage > 80%
- [ ] No prop drilling > 2 levels
- [ ] Component file size < 300 lines
- [ ] Cyclomatic complexity < 10
- [ ] Zero TypeScript `any` types

### Performance Metrics:
- [ ] First contentful paint < 1s
- [ ] Time to interactive < 2s
- [ ] Smooth animations (60 FPS)
- [ ] Bundle size < 500 KB (gzipped)

### User Experience Metrics:
- [ ] Scroll position reset on view change
- [ ] No data loss on refresh
- [ ] Instant UI updates (optimistic)
- [ ] Clear error messages

---

## 📚 Additional Documentation to Create

1. **Architecture Decision Records (ADRs)**
   - Document each major decision
   - Include rationale and alternatives considered

2. **API Documentation**
   - Document all hooks
   - Repository method signatures
   - Storage adapter interface

3. **Component Library**
   - Storybook for all components
   - Usage examples
   - Props documentation

4. **Developer Guide**
   - Setup instructions
   - Development workflow
   - Testing guidelines
   - Deployment process

5. **User Manual** (for kids!)
   - How to add transactions
   - How to create goals
   - How to switch users
   - Troubleshooting

---

## 🚀 Immediate Next Steps

### Week 1 - Critical Fixes:
1. **Day 1-2**: Fix scroll position bug
2. **Day 3**: Add filter reset on view change
3. **Day 4-5**: Add export/import feature (data safety)

### Week 2 - Foundation:
1. **Day 1-2**: Create UserContext
2. **Day 3-4**: Create custom hooks (useTransactions, useGoals)
3. **Day 5**: Write tests for hooks

### Week 3 - Data Layer:
1. **Day 1-3**: Build repository layer
2. **Day 4**: Add data validation
3. **Day 5**: Write repository tests

---

## 📞 Contact Points for Questions

Please review this documentation and provide answers to the questions in Section "🔍 Questions & Clarifications Needed" before we begin refactoring.

**Key decisions needed:**
1. Backward compatibility strategy
2. Test coverage target
3. Expected data volume
4. Feature priorities
5. Browser support targets

Once we have answers, I'll create a detailed sprint plan with specific tasks, estimates, and success criteria for each phase.

---

**End of Architecture Documentation v1.0.0**  
**Next Review:** After Phase 1 completion  
**Maintained By:** Engineering Team  
**Last Updated:** January 2, 2026
