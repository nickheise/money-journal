import { useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Transaction,
  addTransaction as addTransactionToStorage,
  deleteTransaction as deleteTransactionFromStorage,
  getTotalBalance,
  getBalanceByLocation,
} from '../utils/user-storage';

/**
 * useTransactions - Hook for managing transactions
 * 
 * Provides:
 * - Current user's transactions
 * - Add/delete operations
 * - Calculated balances (total and by location)
 * - Memoized calculations for performance
 * 
 * @example
 * const { transactions, addTransaction, deleteTransaction, totalBalance } = useTransactions();
 */
export const useTransactions = () => {
  const { currentUser, refreshUser } = useAuth();

  // Get transactions from current user
  const transactions = useMemo(() => {
    return currentUser?.transactions || [];
  }, [currentUser]);

  // Calculate total balance (memoized)
  const totalBalance = useMemo(() => {
    return getTotalBalance(transactions);
  }, [transactions]);

  // Calculate balance by location (memoized)
  const balanceByLocation = useMemo(() => {
    return getBalanceByLocation(transactions);
  }, [transactions]);

  // Add transaction
  const addTransaction = useCallback(
    (transaction: Omit<Transaction, 'id'>) => {
      if (!currentUser) {
        console.error('Cannot add transaction: No user logged in');
        return;
      }

      try {
        addTransactionToStorage(currentUser.id, transaction);
        refreshUser(); // Refresh user to get updated transactions
      } catch (error) {
        console.error('Failed to add transaction:', error);
        throw error;
      }
    },
    [currentUser, refreshUser]
  );

  // Delete transaction
  const deleteTransaction = useCallback(
    (transactionId: string) => {
      if (!currentUser) {
        console.error('Cannot delete transaction: No user logged in');
        return;
      }

      try {
        deleteTransactionFromStorage(currentUser.id, transactionId);
        refreshUser(); // Refresh user to get updated transactions
      } catch (error) {
        console.error('Failed to delete transaction:', error);
        throw error;
      }
    },
    [currentUser, refreshUser]
  );

  // Filter transactions by location
  const getTransactionsByLocation = useCallback(
    (location: 'wallet' | 'bank' | 'jar' | 'other') => {
      return transactions.filter(t => t.location === location);
    },
    [transactions]
  );

  // Filter transactions by type
  const getTransactionsByType = useCallback(
    (type: 'income' | 'expense') => {
      return transactions.filter(t => t.type === type);
    },
    [transactions]
  );

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    totalBalance,
    balanceByLocation,
    getTransactionsByLocation,
    getTransactionsByType,
  };
};
