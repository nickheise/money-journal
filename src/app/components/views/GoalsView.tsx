import { motion } from 'motion/react';
import { GoalsSection } from './goals-section';
import { useGoals } from '../hooks/useGoals';

/**
 * GoalsView - Savings goals view component
 * 
 * Owns its view-specific state and manages its own data access
 */
export function GoalsView() {
  const { goals, addGoal, updateGoal, deleteGoal } = useGoals();

  return (
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
  );
}
