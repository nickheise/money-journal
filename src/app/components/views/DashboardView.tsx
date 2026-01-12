import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Dashboard } from './dashboard';
import { TransactionList } from './transaction-list';
import { useTransactions } from '../hooks/useTransactions';

interface DashboardViewProps {
  onAddTransaction: () => void;
  onNavigateToActivity: () => void;
}

/**
 * DashboardView - Main dashboard view component
 * 
 * Owns its view-specific state and manages its own data access
 */
export function DashboardView({ onAddTransaction, onNavigateToActivity }: DashboardViewProps) {
  const { transactions, deleteTransaction } = useTransactions();

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-8"
    >
      <Dashboard onAddTransaction={onAddTransaction} />

      {transactions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg opacity-50">Recent Activity</h2>
            <Button
              onClick={onNavigateToActivity}
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
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
