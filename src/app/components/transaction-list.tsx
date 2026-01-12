import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Wallet, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { Transaction } from '../utils/validation';
import { useState, useRef, useEffect } from 'react';
import { ConfirmDialog } from './ui/modal-sheet';
import { EmptyState } from './ui/error-display';
import { LoadingList } from './ui/loading-spinner';
import { 
  Location, 
  locationIcons, 
  locationColors 
} from '../utils/location-constants';
import { spring } from '../utils/animation-config';
import { useReducedMotion } from '../hooks/use-reduced-motion';
import { cn } from './ui/utils';

/**
 * TransactionList - Displays list of transactions with delete functionality
 * 
 * Container component that:
 * - Handles delete confirmation
 * - Shows empty state
 * - Shows loading state
 */

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit?: (transaction: Transaction) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function TransactionList({ 
  transactions, 
  onDelete,
  onEdit,
  isLoading = false,
  emptyMessage = 'No activity yet'
}: TransactionListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Click outside to close focus mode
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (focusedId && listRef.current && !listRef.current.contains(event.target as Node)) {
        setFocusedId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [focusedId]);

  const handleDeleteClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
    setFocusedId(null);
  };

  const handleEditClick = (transaction: Transaction) => {
    if (onEdit) {
      onEdit(transaction);
      setFocusedId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(transactionToDelete.id);
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTransactionClick = (transactionId: string) => {
    setFocusedId(focusedId === transactionId ? null : transactionId);
  };

  const prefersReducedMotion = useReducedMotion();

  // Show loading state
  if (isLoading) {
    return <LoadingList count={5} />;
  }

  // Show empty state
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={<Wallet className="w-8 h-8" />}
        title={emptyMessage}
        description="Transactions will appear here when you add them"
      />
    );
  }

  return (
    <>
      <div className="space-y-3" ref={listRef}>
        {transactions.map((transaction, index) => {
          const Icon = locationIcons[transaction.location];
          const colorClass = locationColors[transaction.location];
          const isIncome = transaction.type === 'income';
          const isFocused = focusedId === transaction.id;
          const isDimmed = focusedId && focusedId !== transaction.id;

          return (
            <div key={transaction.id} className="relative">
              {/* Use CSS classes instead of Motion for better mobile performance */}
              <div
                className={cn(
                  'transaction-item',
                  'bg-white rounded-2xl px-6 py-4 cursor-pointer',
                  isFocused && 'transaction-focused shadow-lg',
                  isDimmed && 'transaction-dimmed',
                  !isFocused && !isDimmed && 'hover:bg-white/80'
                )}
                style={{
                  zIndex: isFocused ? 10 : 1,
                }}
                onClick={() => handleTransactionClick(transaction.id)}
              >
                {/* Mobile: Stack vertically, Desktop: Side by side */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  {/* Top on mobile / Left on desktop: Dollar amount and date */}
                  <div className="flex items-center justify-between gap-4 sm:flex-1 sm:min-w-0">
                    <div className={`text-3xl font-medium tracking-tight ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                      {isIncome ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground/60 whitespace-nowrap sm:hidden">
                      {format(new Date(transaction.date), 'MMM d, yyyy')}
                    </div>
                  </div>

                  {/* Bottom on mobile / Right on desktop: Description, date (desktop only), and icon */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                    <div className="text-left sm:text-right min-w-0 flex-1 sm:flex-initial">
                      {transaction.note && (
                        <div className="font-medium text-foreground/70 truncate max-w-[200px] sm:max-w-[200px]">{transaction.note}</div>
                      )}
                      <div className="text-sm text-muted-foreground/60 whitespace-nowrap hidden sm:block">
                        {format(new Date(transaction.date), 'MMM d, yyyy')}
                      </div>
                    </div>

                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Absolutely positioned, appears in front */}
              <AnimatePresence>
                {isFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={spring.snappy}
                    className="absolute left-0 right-0 flex gap-3 justify-center z-20"
                    style={{ top: 'calc(100% + 12px)' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      transition={{
                        ...spring.snappy,
                        delay: 0.08
                      }}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleEditClick(transaction)}
                      className="px-6 py-2.5 rounded-full bg-white hover:bg-gray-50 font-medium transition-colors flex items-center gap-2 shadow-md"
                    >
                      <Edit2 className="w-4 h-4" />
                      Update
                    </motion.button>
                    
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      transition={{
                        ...spring.snappy,
                        delay: 0.13
                      }}
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleDeleteClick(transaction)}
                      className="px-6 py-2.5 rounded-full bg-red-50 hover:bg-red-100 text-destructive font-medium transition-colors flex items-center gap-2 shadow-md"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          if (!isDeleting) {
            setDeleteDialogOpen(false);
            setTransactionToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Transaction?"
        description="This action cannot be undone. This will permanently delete the transaction."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isDestructive
        isLoading={isDeleting}
      />
    </>
  );
}