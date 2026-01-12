import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, TrendingUp, Target, Plus, ArrowUpCircle, ArrowDownCircle, DollarSign, Lock, Activity, BookOpen } from 'lucide-react';
import { LocationCards } from './components/presentation/LocationCards';
import { BalanceCard } from './components/balance-card';
import { LocationBarChart } from './components/location-bar-chart';
import { TransactionList } from './components/transaction-list';
import { GoalsSection } from './components/goals-section';
import { StatusPage } from './components/status-page';
import { UserSwitcher } from './components/user-switcher';
import { Button } from './components/ui/button';
import { FloatingFooter } from './components/floating-footer';
import { QuickActionDialog } from './components/quick-action-dialog';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppProvider, useAuth, useTransactions, useGoals } from './contexts/AppProvider';
import { UserLogin } from './components/user-login';
import { Dashboard } from './components/dashboard';
import { LearningHub } from './components/learning-hub';
import { calculateUserLevel } from './utils/learning-content';
import {
  Transaction,
  Goal,
} from './utils/user-storage';

type View = 'dashboard' | 'transactions' | 'goals' | 'learn' | 'status';

/**
 * AppContent - Main app component (requires AppProvider wrapper)
 * Now uses Context API instead of prop drilling!
 */
function AppContent() {
  // Get data from contexts instead of local state
  const { currentUser, logout, switchUser } = useAuth();
  const { transactions, addTransaction, deleteTransaction, totalBalance } = useTransactions();
  const { goals, addGoal, updateGoal, deleteGoal } = useGoals();
  
  // View-specific state (not shared)
  const [showQuickAction, setShowQuickAction] = useState(false);
  const [quickActionMode, setQuickActionMode] = useState<'add' | 'spend' | 'save'>('add');
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [locationFilter, setLocationFilter] = useState<'all' | 'wallet' | 'bank' | 'jar' | 'other'>('all');

  // URL-based routing support
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/status' || path.endsWith('/status')) {
      setCurrentView('status');
    } else if (path === '/transactions' || path.endsWith('/transactions')) {
      setCurrentView('transactions');
    } else if (path === '/goals' || path.endsWith('/goals')) {
      setCurrentView('goals');
    } else if (path === '/learn' || path.endsWith('/learn')) {
      setCurrentView('learn');
    } else if (path === '/' || path.endsWith('/')) {
      setCurrentView('dashboard');
    }
  }, []);

  // Update URL when view changes
  const handleViewChange = (view: View) => {
    setCurrentView(view);
    const path = view === 'dashboard' ? '/' : `/${view}`;
    window.history.pushState({}, '', path);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${timeGreeting}, ${currentUser?.name || ''}`  ;
  };

  // Calculate learning level info
  const getLevelInfo = () => {
    const FIRST_USE_KEY = 'moneyjournal_first_use_date';
    const firstUseDate = localStorage.getItem(FIRST_USE_KEY);
    const daysSinceFirstUse = firstUseDate 
      ? Math.floor((Date.now() - parseInt(firstUseDate)) / (1000 * 60 * 60 * 24))
      : 0;
    
    const level = calculateUserLevel(totalBalance, transactions.length, daysSinceFirstUse);
    
    const levelInfo = {
      1: { emoji: '📚', title: 'Learner' },
      2: { emoji: '🌟', title: 'Builder' },
      3: { emoji: '🎯', title: 'Expert' },
      4: { emoji: '👑', title: 'Master' }
    };
    
    return levelInfo[level as keyof typeof levelInfo];
  };

  const handleUserSwitch = (userId: string) => {
    switchUser(userId);
    setCurrentView('dashboard');
  };

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    addTransaction(transaction);
    setShowQuickAction(false);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    // TODO: Implement edit functionality
    // For now, just show a placeholder message
    console.log('Edit transaction:', transaction);
  };

  // Show login screen if no user is logged in (except for status page)
  if (!currentUser && currentView !== 'status') {
    return <UserLogin />;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-8">
      {/* Fixed Header - Only show when logged in */}
      {currentUser && (
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl"
        >
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-xl font-medium text-foreground truncate">{greeting()}</div>
              <div className="text-[11px] text-muted-foreground/60 mt-0.5">
                {getLevelInfo().emoji} {getLevelInfo().title}
              </div>
            </div>

            <UserSwitcher
              currentUser={currentUser}
              onSwitch={handleUserSwitch}
              onLogout={logout}
            />
          </div>
        </motion.header>
      )}

      <div className={`max-w-4xl mx-auto px-4 md:px-8 space-y-8 relative z-10 ${currentUser ? 'pt-20' : 'pt-8'}`}>
        {/* Main Content */}
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <Dashboard />

              {transactions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg opacity-50">Recent Activity</h2>
                    <Button
                      onClick={() => setCurrentView('transactions')}
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                    >
                      View All
                    </Button>
                  </div>
                  <div className="rounded-3xl p-6" style={{ backgroundColor: 'oklch(96.9% 0.016 293.756)' }}>
                    <TransactionList
                      transactions={transactions.slice(0, 5)}
                      onDelete={deleteTransaction}
                      onEdit={handleEditTransaction}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {currentView === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Location Filters - Centered */}
              <div className="relative mb-8">
                <div className="flex justify-center gap-2 overflow-x-auto pb-2">
                  <button
                    onClick={() => setLocationFilter('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      locationFilter === 'all'
                        ? 'bg-gradient-to-br from-blue-500 via-purple-500 via-pink-500 to-orange-500 text-white'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setLocationFilter('wallet')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      locationFilter === 'wallet'
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-white'
                        : 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-900 hover:from-emerald-100 hover:to-emerald-200'
                    }`}
                  >
                    Wallet
                  </button>
                  <button
                    onClick={() => setLocationFilter('bank')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      locationFilter === 'bank'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-400 text-white'
                        : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900 hover:from-blue-100 hover:to-blue-200'
                    }`}
                  >
                    Bank
                  </button>
                  <button
                    onClick={() => setLocationFilter('jar')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      locationFilter === 'jar'
                        ? 'bg-gradient-to-r from-pink-500 to-pink-400 text-white'
                        : 'bg-gradient-to-r from-pink-50 to-pink-100 text-pink-900 hover:from-pink-100 hover:to-pink-200'
                    }`}
                  >
                    Piggy Bank
                  </button>
                  <button
                    onClick={() => setLocationFilter('other')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      locationFilter === 'other'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white'
                        : 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-900 hover:from-amber-100 hover:to-yellow-100'
                    }`}
                  >
                    Other
                  </button>
                </div>
                
                <div className="absolute left-0 top-0 flex items-center h-full pb-2">
                  <div className="text-sm text-muted-foreground whitespace-nowrap tabular-nums">
                    {locationFilter === 'all' ? transactions.length : transactions.filter(t => t.location === locationFilter).length} total
                  </div>
                </div>
              </div>
              
              <div className="rounded-3xl p-6" style={{ backgroundColor: 'oklch(96.9% 0.016 293.756)' }}>
                <TransactionList
                  transactions={locationFilter === 'all' ? transactions : transactions.filter(t => t.location === locationFilter)}
                  onDelete={deleteTransaction}
                  onEdit={handleEditTransaction}
                />
              </div>
            </motion.div>
          )}

          {currentView === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <GoalsSection
                goals={goals}
                onAddGoal={addGoal}
                onUpdateGoal={updateGoal}
                onDeleteGoal={deleteGoal}
              />
            </motion.div>
          )}

          {currentView === 'learn' && (
            <motion.div
              key="learn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <LearningHub />
            </motion.div>
          )}

          {currentView === 'status' && (
            <motion.div
              key="status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <StatusPage />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60"
        >
          <Lock className="w-3 h-3" />
          All data saved locally on your device
        </motion.footer>
      </div>

      {/* Transaction Form Modal */}
      {currentUser && (
        <QuickActionDialog
          isOpen={showQuickAction}
          onClose={() => setShowQuickAction(false)}
          mode={quickActionMode}
          setMode={setQuickActionMode}
          onAddGoal={addGoal}
        />
      )}

      {/* Floating Footer - Show on status page or when logged in */}
      {(currentUser || currentView === 'status') && (
        <FloatingFooter
          tabs={[
            { value: 'dashboard', icon: Menu },
            { value: 'transactions', icon: TrendingUp },
            { value: 'goals', icon: Target },
            { value: 'learn', icon: BookOpen },
          ]}
          currentTab={currentView}
          onTabChange={(value) => handleViewChange(value as View)}
          onAddClick={() => {
            setQuickActionMode('add');
            setShowQuickAction(true);
          }}
        />
      )}
    </div>
  );
}

/**
 * App - Root component with all providers
 * 
 * Wraps the app with AppProvider (which includes Auth, Transactions, Goals contexts)
 * and ErrorBoundary for graceful error handling
 */
export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}