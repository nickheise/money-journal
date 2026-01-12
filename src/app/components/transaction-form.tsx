import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { ModalSheet } from './ui/modal-sheet';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { LoadingSpinner } from './ui/loading-spinner';
import { ErrorDisplay } from './ui/error-display';
import { MoneyInput } from './ui/money-input';
import { TransactionInput } from '../utils/validation';
import { TypeSegmentControl } from './type-segment-control';
import { LocationSegmentControl } from './location-segment-control';
import { useTransactions } from '../contexts/TransactionsContext';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import { DollarSign } from 'lucide-react';

/**
 * TransactionForm - Modal form for adding transactions
 * 
 * Container component that:
 * - Manages form state
 * - Handles submission with loading/error states
 * - Shows confetti on success
 */

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionForm({ isOpen, onClose }: TransactionFormProps) {
  const { addTransaction } = useTransactions();
  
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [location, setLocation] = useState<'wallet' | 'bank' | 'jar' | 'other'>('wallet');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addTransaction({
        amount: amountNum,
        type,
        location,
        note: note.trim() || undefined,
        date: new Date().toISOString(),
      });

      // Trigger confetti based on transaction type
      if (type === 'income') {
        // Celebratory confetti for money in
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        // Thumbs down emoji rain for money out
        const scalar = 3;
        const thumbsDown = confetti.shapeFromText({ text: '👎', scalar });
        
        const fireEmoji = () => {
          confetti({
            particleCount: 3,
            angle: 90,
            spread: 45,
            startVelocity: 20,
            decay: 0.9,
            gravity: 0.8,
            drift: 0,
            ticks: 300,
            origin: { x: Math.random(), y: 0 },
            shapes: [thumbsDown],
            scalar,
            flat: true
          });
        };

        // Fire multiple times to create a raining effect
        const interval = setInterval(fireEmoji, 100);
        setTimeout(() => clearInterval(interval), 2000);
      }

      // Reset form and close
      setAmount('');
      setNote('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setAmount('');
      setNote('');
      setError(null);
      onClose();
    }
  };

  return (
    <ModalSheet
      isOpen={isOpen}
      onClose={handleClose}
      title={type === 'income' ? 'Add Money' : 'Spent Money'}
      description="Track where your money goes"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {error && (
          <ErrorDisplay
            message={error}
            variant="banner"
            onDismiss={() => setError(null)}
          />
        )}

        {/* Amount - Large and Prominent */}
        <div className="space-y-4">
          <MoneyInput
            id="amount"
            value={amount}
            onChange={setAmount}
            disabled={isSubmitting}
            autoFocus
          />
        </div>

        {/* Type Selection */}
        <div className="space-y-3">
          <Label>Type</Label>
          <TypeSegmentControl
            value={type}
            onChange={setType}
          />
        </div>

        {/* Location */}
        <div className="space-y-3">
          <Label>Where's the Money</Label>
          <LocationSegmentControl
            value={location}
            onChange={setLocation}
          />
        </div>

        {/* Description */}
        <div className="space-y-3">
          <Label htmlFor="description">Note (optional)</Label>
          <Input
            id="description"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What is this for?"
            disabled={isSubmitting}
            className="h-12 rounded-xl bg-input-background"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 text-lg gap-1"
        >
          {isSubmitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <DollarSign className="w-5 h-5" />
              </motion.div>
              Recording...
            </>
          ) : (
            <>
              <DollarSign className="w-5 h-5" />
              Record Transaction
            </>
          )}
        </Button>
      </form>
    </ModalSheet>
  );
}