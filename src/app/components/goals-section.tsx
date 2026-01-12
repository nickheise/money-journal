import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Goal } from '../utils/user-storage';
import { Plus, Target, TrendingUp, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Modal } from './ui/modal';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { MoneyInput } from './ui/money-input';
import { DialogHeader } from './ui/dialog-header';
import { SectionHeader } from './ui/section-header';
import { dialog } from '../utils/animation-config';
import { EmptyState } from './ui/error-display';

interface GoalsSectionProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onUpdateGoal: (id: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
}

const goalColors = [
  { name: 'Purple', value: 'from-purple-400 to-purple-600', bg: 'bg-purple-500' },
  { name: 'Green', value: 'from-green-400 to-emerald-600', bg: 'bg-green-500' },
  { name: 'Pink', value: 'from-pink-400 to-rose-600', bg: 'bg-pink-500' },
  { name: 'Blue', value: 'from-blue-400 to-cyan-600', bg: 'bg-blue-500' },
  { name: 'Orange', value: 'from-orange-400 to-amber-600', bg: 'bg-orange-500' },
];

export function GoalsSection({ goals, onAddGoal, onUpdateGoal, onDeleteGoal }: GoalsSectionProps) {
  const [addMoneyDialogGoal, setAddMoneyDialogGoal] = useState<Goal | null>(null);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');

  const handleAddMoneySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addMoneyDialogGoal) return;

    const amount = parseFloat(addMoneyAmount);
    if (isNaN(amount) || amount <= 0) return;

    const remaining = addMoneyDialogGoal.targetAmount - addMoneyDialogGoal.currentAmount;
    const newAmount = Math.min(addMoneyDialogGoal.currentAmount + amount, addMoneyDialogGoal.targetAmount);
    
    onUpdateGoal(addMoneyDialogGoal.id, { currentAmount: newAmount });
    setAddMoneyDialogGoal(null);
    setAddMoneyAmount('');
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Save for Something" />

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={<Target className="w-8 h-8" />}
              title="No goals yet"
              description="Create a goal to start tracking your progress"
            />
          </div>
        ) : (
          goals.map((goal, index) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const isComplete = progress >= 100;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-br ${goal.color} rounded-2xl p-6 text-white relative overflow-hidden group`}
              >
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{goal.name}</h3>
                      <div className="text-sm opacity-90">
                        ${goal.currentAmount.toFixed(2)} of ${goal.targetAmount.toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg hover:bg-white/20 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        className="h-full bg-white rounded-full"
                      />
                    </div>
                    <div className="text-xs mt-2 opacity-90">{Math.round(progress)}% complete</div>
                  </div>

                  {!isComplete && (
                    <button
                      onClick={() => setAddMoneyDialogGoal(goal)}
                      className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl py-2 text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Add Money
                    </button>
                  )}

                  {isComplete && (
                    <div className="text-center py-2 text-sm font-medium">
                      🎉 Goal Reached!
                    </div>
                  )}
                </div>

                {/* Decorative element */}
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
              </motion.div>
            );
          })
        )}
      </div>

      {/* Add Money Dialog */}
      <Modal 
        isOpen={!!addMoneyDialogGoal} 
        onClose={() => {
          setAddMoneyDialogGoal(null);
          setAddMoneyAmount('');
        }}
        className="w-full max-w-md"
      >
        {addMoneyDialogGoal && (
          <div className="bg-background rounded-3xl w-full border border-border relative">
            <form onSubmit={handleAddMoneySubmit} className="p-6 space-y-6">
              <DialogHeader
                title="Add Money"
                subtitle={`Adding to ${addMoneyDialogGoal.name}`}
                onClose={() => {
                  setAddMoneyDialogGoal(null);
                  setAddMoneyAmount('');
                }}
              />

              <p className="text-xs text-muted-foreground text-center">
                ${(addMoneyDialogGoal.targetAmount - addMoneyDialogGoal.currentAmount).toFixed(2)} remaining
              </p>

              <MoneyInput
                id="addMoneyAmount"
                value={addMoneyAmount}
                onChange={setAddMoneyAmount}
                max={(addMoneyDialogGoal.targetAmount - addMoneyDialogGoal.currentAmount).toString()}
                autoFocus
              />

              <Button type="submit" className="w-full h-14 text-lg gap-1">
                <TrendingUp className="w-5 h-5" />
                Add to Goal
              </Button>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}