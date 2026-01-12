import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { TransactionList } from './transaction-list';
import { useTransactions } from '../hooks/useTransactions';

/**
 * TransactionsView - Full activity view with location filters
 * 
 * Owns its view-specific state:
 * - Location filter selection
 * - Scroll position (managed by browser)
 */
export function TransactionsView() {
  const { transactions, deleteTransaction } = useTransactions();
  const [locationFilter, setLocationFilter] = useState<'all' | 'wallet' | 'bank' | 'jar' | 'other'>('all');

  // Filter transactions based on selected location (memoized)
  const filteredTransactions = useMemo(() => {
    if (locationFilter === 'all') {
      return transactions;
    }
    return transactions.filter(t => t.location === locationFilter);
  }, [transactions, locationFilter]);

  return (
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
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
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
            {filteredTransactions.length} total
          </div>
        </div>
      </div>
      
      <div className="rounded-3xl p-6" style={{ backgroundColor: 'oklch(96.9% 0.016 293.756)' }}>
        <TransactionList
          transactions={filteredTransactions}
          onDelete={deleteTransaction}
        />
      </div>
    </motion.div>
  );
}
