import { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { TransactionsProvider } from './TransactionsContext';
import { GoalsProvider } from './GoalsContext';

interface AppProviderProps {
  children: ReactNode;
}

/**
 * AppProvider - Wraps all context providers in correct order
 * 
 * Provider hierarchy:
 * 1. AuthProvider (root - provides user authentication)
 * 2. TransactionsProvider (depends on AuthProvider)
 * 3. GoalsProvider (depends on AuthProvider)
 * 
 * Usage:
 * Wrap your entire app with this single provider at the root level
 * 
 * @example
 * ```tsx
 * // In your main entry point
 * import { AppProvider } from './contexts/AppProvider';
 * import App from './App';
 * 
 * function Root() {
 *   return (
 *     <AppProvider>
 *       <App />
 *     </AppProvider>
 *   );
 * }
 * ```
 */
export function AppProvider({ children }: AppProviderProps) {
  return (
    <AuthProvider>
      <TransactionsProvider>
        <GoalsProvider>
          {children}
        </GoalsProvider>
      </TransactionsProvider>
    </AuthProvider>
  );
}

// Re-export all hooks for convenience
export { useAuth } from './AuthContext';
export { useTransactions } from './TransactionsContext';
export { useGoals } from './GoalsContext';
