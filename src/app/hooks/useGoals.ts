import { useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Goal,
  addGoal as addGoalToStorage,
  updateGoal as updateGoalInStorage,
  deleteGoal as deleteGoalFromStorage,
} from '../utils/user-storage';

/**
 * useGoals - Hook for managing savings goals
 * 
 * Provides:
 * - Current user's goals
 * - Add/update/delete operations
 * - Calculated statistics (total saved, goals completed, etc.)
 * 
 * @example
 * const { goals, addGoal, updateGoal, deleteGoal, completedGoals } = useGoals();
 */
export const useGoals = () => {
  const { currentUser, refreshUser } = useAuth();

  // Get goals from current user
  const goals = useMemo(() => {
    return currentUser?.goals || [];
  }, [currentUser]);

  // Calculate completed goals count (memoized)
  const completedGoals = useMemo(() => {
    return goals.filter(g => g.currentAmount >= g.targetAmount).length;
  }, [goals]);

  // Calculate total saved across all goals (memoized)
  const totalSaved = useMemo(() => {
    return goals.reduce((sum, g) => sum + g.currentAmount, 0);
  }, [goals]);

  // Calculate total target across all goals (memoized)
  const totalTarget = useMemo(() => {
    return goals.reduce((sum, g) => sum + g.targetAmount, 0);
  }, [goals]);

  // Calculate overall progress percentage (memoized)
  const overallProgress = useMemo(() => {
    if (totalTarget === 0) return 0;
    return Math.min((totalSaved / totalTarget) * 100, 100);
  }, [totalSaved, totalTarget]);

  // Add goal
  const addGoal = useCallback(
    (goal: Omit<Goal, 'id'>) => {
      if (!currentUser) {
        console.error('Cannot add goal: No user logged in');
        return;
      }

      try {
        addGoalToStorage(currentUser.id, goal);
        refreshUser(); // Refresh user to get updated goals
      } catch (error) {
        console.error('Failed to add goal:', error);
        throw error;
      }
    },
    [currentUser, refreshUser]
  );

  // Update goal
  const updateGoal = useCallback(
    (goalId: string, updates: Partial<Goal>) => {
      if (!currentUser) {
        console.error('Cannot update goal: No user logged in');
        return;
      }

      try {
        updateGoalInStorage(currentUser.id, goalId, updates);
        refreshUser(); // Refresh user to get updated goals
      } catch (error) {
        console.error('Failed to update goal:', error);
        throw error;
      }
    },
    [currentUser, refreshUser]
  );

  // Delete goal
  const deleteGoal = useCallback(
    (goalId: string) => {
      if (!currentUser) {
        console.error('Cannot delete goal: No user logged in');
        return;
      }

      try {
        deleteGoalFromStorage(currentUser.id, goalId);
        refreshUser(); // Refresh user to get updated goals
      } catch (error) {
        console.error('Failed to delete goal:', error);
        throw error;
      }
    },
    [currentUser, refreshUser]
  );

  // Add money to a goal (convenience method)
  const addMoneyToGoal = useCallback(
    (goalId: string, amount: number) => {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) {
        console.error('Goal not found:', goalId);
        return;
      }

      const newAmount = goal.currentAmount + amount;
      updateGoal(goalId, { currentAmount: newAmount });
    },
    [goals, updateGoal]
  );

  return {
    goals,
    addGoal,
    updateGoal,
    deleteGoal,
    addMoneyToGoal,
    completedGoals,
    totalSaved,
    totalTarget,
    overallProgress,
  };
};
