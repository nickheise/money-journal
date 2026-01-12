import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { DollarSign, Target, Plus, Minus, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Modal } from './ui/modal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { MoneyInput } from './ui/money-input';
import { DialogHeader } from './ui/dialog-header';
import { LocationSegmentControl } from './location-segment-control';
import { useTransactions } from '../contexts/TransactionsContext';
import { Goal } from '../utils/user-storage';
import confetti from 'canvas-confetti';

interface QuickActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'spend' | 'save';
  setMode: (mode: 'add' | 'spend' | 'save') => void;
  onAddTransaction?: (transaction: any) => void;
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
}

const goalColors = [
  { name: 'Purple', value: 'from-purple-400 to-purple-600', bg: 'bg-purple-500' },
  { name: 'Green', value: 'from-green-400 to-emerald-600', bg: 'bg-green-500' },
  { name: 'Pink', value: 'from-pink-400 to-rose-600', bg: 'bg-pink-500' },
  { name: 'Blue', value: 'from-blue-400 to-cyan-600', bg: 'bg-blue-500' },
  { name: 'Orange', value: 'from-orange-400 to-amber-600', bg: 'bg-orange-500' },
];

export function QuickActionDialog({ isOpen, onClose, mode, setMode, onAddTransaction, onAddGoal }: QuickActionDialogProps) {
  const { addTransaction } = useTransactions();

  // Money form state
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [location, setLocation] = useState<'wallet' | 'bank' | 'jar' | 'other'>('wallet');
  const [moneyNote, setMoneyNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Goal form state
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [goalNote, setGoalNote] = useState('');

  // Update type based on mode
  const currentType = mode === 'add' ? 'income' : mode === 'spend' ? 'expense' : type;

  const resetMoneyForm = () => {
    setAmount('');
    setType('income');
    setLocation('wallet');
    setMoneyNote('');
    setIsSubmitting(false);
  };

  const resetGoalForm = () => {
    setGoalName('');
    setTargetAmount('');
    setGoalNote('');
  };

  const handleMoneySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        setIsSubmitting(false);
        return;
      }

      const note = moneyNote.trim() || undefined;

      await addTransaction({
        amount: amountValue,
        type: currentType,
        location,
        note,
      });

      // Celebration confetti for earned money
      if (currentType === 'income') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#a855f7', '#ec4899', '#f97316'],
        });
      }

      resetMoneyForm();
      onClose();
    } catch (error) {
      console.error('Failed to add transaction:', error);
      setIsSubmitting(false);
    }
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountValue = parseFloat(targetAmount);
    if (isNaN(amountValue) || amountValue <= 0 || !goalName.trim()) return;

    // Randomly select a color from available colors
    const randomColor = goalColors[Math.floor(Math.random() * goalColors.length)].value;

    const goalData: Omit<Goal, 'id'> = {
      name: goalName,
      targetAmount: amountValue,
      currentAmount: 0,
      color: randomColor,
      emoji: undefined,
      note: goalNote.trim() || undefined,
    };

    onAddGoal(goalData);

    resetGoalForm();
    onClose();
  };

  const handleClose = () => {
    resetMoneyForm();
    resetGoalForm();
    onClose();
  };

  // Check if goal form is valid
  const isGoalFormValid = () => {
    const amountValue = parseFloat(targetAmount);
    return !isNaN(amountValue) && amountValue > 0 && goalName.trim().length > 0;
  };

  // Check if money form is valid
  const isMoneyFormValid = () => {
    const amountValue = parseFloat(amount);
    return !isNaN(amountValue) && amountValue > 0;
  };

  // Mode navigation
  const modes = ['add', 'spend', 'save'] as const;
  const currentModeIndex = modes.indexOf(mode);
  const [isHovering, setIsHovering] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const handlePrevMode = () => {
    setDirection('left');
    const prevIndex = currentModeIndex > 0 ? currentModeIndex - 1 : modes.length - 1;
    setMode(modes[prevIndex]);
  };

  const handleNextMode = () => {
    setDirection('right');
    const nextIndex = currentModeIndex < modes.length - 1 ? currentModeIndex + 1 : 0;
    setMode(modes[nextIndex]);
  };

  const getModeTitle = (m: 'add' | 'spend' | 'save') => {
    switch (m) {
      case 'add': return 'Add Money';
      case 'spend': return 'Spend Money';
      case 'save': return 'Save Money';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="w-full max-w-md">
      <div className="bg-background rounded-3xl w-full border border-border relative flex flex-col h-[680px]">
        {/* Fixed Header Section */}
        <div className="p-6 pb-4 flex-shrink-0">
          <DialogHeader
            title="Quick Action"
            subtitle={
              mode === 'add' ? 'Record money earned' : 
              mode === 'spend' ? 'Record money spent' : 
              'Create a savings goal'
            }
            onClose={handleClose}
          />
        </div>

        {/* Swipeable Amount Input Section */}
        <div className="flex-shrink-0 px-6 pb-4">
          <div 
            className="relative"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Navigation Arrows */}
            <AnimatePresence>
              {isHovering && (
                <>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={handlePrevMode}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors text-2xl"
                    type="button"
                  >
                    ‹
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={handleNextMode}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors text-2xl"
                    type="button"
                  >
                    ›
                  </motion.button>
                </>
              )}
            </AnimatePresence>

            {/* Swipeable Content */}
            <motion.div
              key={mode}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;
                if (swipe < -500) {
                  handleNextMode();
                } else if (swipe > 500) {
                  handlePrevMode();
                }
              }}
              className="space-y-1"
            >
              {/* Mode Title - Positioned directly above input */}
              <div className="overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.h3
                    key={mode}
                    initial={{ 
                      opacity: 0, 
                      x: direction === 'right' ? 30 : -30 
                    }}
                    animate={{ 
                      opacity: 1, 
                      x: 0 
                    }}
                    exit={{ 
                      opacity: 0, 
                      x: direction === 'right' ? -30 : 30 
                    }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="text-center text-sm text-muted-foreground"
                  >
                    {getModeTitle(mode)}
                  </motion.h3>
                </AnimatePresence>
              </div>

              {/* Money Input - No animation to prevent flash */}
              <MoneyInput
                id={mode === 'save' ? 'targetAmount' : 'amount'}
                value={mode === 'save' ? targetAmount : amount}
                onChange={mode === 'save' ? setTargetAmount : setAmount}
                required
              />

              {/* Indicator Dots */}
              <div className="flex justify-center gap-2 pt-2">
                {modes.map((m, index) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border rounded-full"
                    type="button"
                  >
                    <div
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentModeIndex
                          ? 'bg-foreground w-6'
                          : 'bg-muted-foreground/30'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Money Form */}
        {(mode === 'add' || mode === 'spend') && (
          <>
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-6">
              <div className="space-y-4">
                {/* Location Selection */}
                <div className="space-y-3 -mx-6">
                  <Label className="px-6">{mode === 'add' ? 'Add to' : 'Take from'}</Label>
                  <LocationSegmentControl value={location} onChange={setLocation} />
                </div>

                {/* Note */}
                <div className="space-y-3">
                  <Label htmlFor="moneyNote">Add a note</Label>
                  <Input
                    id="moneyNote"
                    type="text"
                    value={moneyNote}
                    onChange={(e) => setMoneyNote(e.target.value)}
                    placeholder={mode === 'spend' ? "What's the money for?" : "Where's the money from?"}
                    disabled={isSubmitting}
                    className="h-12 rounded-xl bg-input-background"
                  />
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="p-6 pt-4 flex-shrink-0 border-t border-border/50">
              <Button 
                onClick={handleMoneySubmit} 
                disabled={isSubmitting || !isMoneyFormValid()} 
                className="w-full h-14 text-lg gap-1"
                type="button"
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
                  mode === 'add' ? 'Add Money' : 'Remove Money'
                )}
              </Button>
            </div>
          </>
        )}

        {/* Goal Form */}
        {mode === 'save' && (
          <>
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-6">
              <div className="space-y-4">
                {/* Goal Name */}
                <div className="space-y-3">
                  <Label htmlFor="goalName">Goal Name</Label>
                  <Input
                    id="goalName"
                    type="text"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    placeholder="New bike, concert tickets, etc."
                    className="h-12 rounded-xl bg-input-background"
                    required
                  />
                </div>

                {/* Note */}
                <div className="space-y-3">
                  <Label htmlFor="goalNote">Note (optional)</Label>
                  <Input
                    id="goalNote"
                    type="text"
                    value={goalNote}
                    onChange={(e) => setGoalNote(e.target.value)}
                    placeholder="Why is this important to you?"
                    className="h-12 rounded-xl bg-input-background"
                  />
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="p-6 pt-4 flex-shrink-0 border-t border-border/50">
              <Button 
                onClick={handleGoalSubmit} 
                disabled={!isGoalFormValid()}
                className="w-full h-14 text-lg gap-1"
                type="button"
              >
                Save Money
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}