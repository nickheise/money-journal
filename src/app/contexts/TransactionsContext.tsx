import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Transaction, TransactionInput } from '../utils/validation';
import { getTransactionRepository } from '../repositories/RepositoryFactory';
import { useAuth } from './AuthContext';

// Get repository instance
const transactionRepository = getTransactionRepository();

interface TransactionsContextType {
  transactions: Transaction[];
  isLoading: boolean;
  totalBalance: number;
  balanceByLocation: Record<string, number>;
  addTransaction: (transaction: TransactionInput) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const { currentUser, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load transactions when user changes
   */
  useEffect(() => {
    const loadTransactions = async () => {
      if (!currentUser) {
        setTransactions([]);
        setIsLoading(false);
        return;
      }

      try {
        const userTransactions = await transactionRepository.findByUserId(currentUser.id);
        setTransactions(userTransactions);
      } catch (error) {
        console.error('Failed to load transactions:', error);
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [currentUser]);

  /**
   * Add new transaction
   */
  const addTransaction = useCallback(async (transaction: TransactionInput) => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      await transactionRepository.create({ 
        ...transaction,
        userId: currentUser.id 
      });
      await refreshUser(); // Reload user data, which will trigger transaction reload via useEffect
    } catch (error) {
      console.error('Failed to add transaction:', error);
      throw error;
    }
  }, [currentUser, refreshUser]);

  /**
   * Delete transaction
   */
  const deleteTransaction = useCallback(async (id: string) => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      const success = await transactionRepository.delete(id);
      if (success) {
        await refreshUser(); // Reload user data, which will trigger transaction reload via useEffect
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw error;
    }
  }, [currentUser, refreshUser]);

  /**
   * Refresh transactions from storage
   */
  const refreshTransactions = useCallback(async () => {
    if (!currentUser) return;

    try {
      const userTransactions = await transactionRepository.findByUserId(currentUser.id);
      setTransactions(userTransactions);
    } catch (error) {
      console.error('Failed to refresh transactions:', error);
    }
  }, [currentUser]);

  /**
   * Compute total balance (memoized)
   */
  const totalBalance = useMemo(() => {
    if (!transactions || transactions.length === 0) return 0;
    
    const balance = transactions.reduce((sum, t) => {
      const amount = typeof t.amount === 'number' && isFinite(t.amount) ? t.amount : 0;
      return t.type === 'income' ? sum + amount : sum - amount;
    }, 0);
    
    return isFinite(balance) ? balance : 0;
  }, [transactions]);

  /**
   * Compute balance by location (memoized)
   */
  const balanceByLocation = useMemo(() => {
    const locationBalances: Record<string, number> = {};
    
    if (!transactions || transactions.length === 0) return locationBalances;
    
    transactions.forEach(t => {
      if (!locationBalances[t.location]) {
        locationBalances[t.location] = 0;
      }
      const amount = typeof t.amount === 'number' && isFinite(t.amount) ? t.amount : 0;
      const change = t.type === 'income' ? amount : -amount;
      locationBalances[t.location] = (locationBalances[t.location] || 0) + change;
    });
    
    // Ensure all values are finite
    Object.keys(locationBalances).forEach(key => {
      if (!isFinite(locationBalances[key])) {
        locationBalances[key] = 0;
      }
    });
    
    return locationBalances;
  }, [transactions]);

  const value = useMemo(() => ({
    transactions,
    isLoading,
    totalBalance,
    balanceByLocation,
    addTransaction,
    deleteTransaction,
    refreshTransactions,
  }), [transactions, isLoading, totalBalance, balanceByLocation, addTransaction, deleteTransaction, refreshTransactions]);

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
}

/**
 * useTransactions - Hook to access transaction state and operations
 * 
 * @throws Error if used outside TransactionsProvider
 * 
 * @example
 * ```tsx
 * function TransactionList() {
 *   const { transactions, deleteTransaction, isLoading, error } = useTransactions();
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   
 *   return (
 *     <div>
 *       {transactions.map(t => (
 *         <div key={t.id}>
 *           {t.description}: ${t.amount}
 *           <button onClick={() => deleteTransaction(t.id)}>Delete</button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTransactions() {
  const context = useContext(TransactionsContext);
  
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  
  return context;
}