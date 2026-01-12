import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { Goal, GoalInput } from '../utils/validation';
import { getGoalRepository } from '../repositories/RepositoryFactory';
import { useAuth } from './AuthContext';

// Get repository instance
const goalRepository = getGoalRepository();

interface GoalsContextType {
  goals: Goal[];
  isLoading: boolean;
  addGoal: (goal: GoalInput) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Pick<Goal, 'name' | 'targetAmount' | 'currentAmount' | 'emoji'>>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  refreshGoals: () => Promise<void>;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export function GoalsProvider({ children }: { children: ReactNode }) {
  const { currentUser, refreshUser } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load goals when user changes
   */
  useEffect(() => {
    const loadGoals = async () => {
      if (!currentUser) {
        setGoals([]);
        setIsLoading(false);
        return;
      }

      try {
        const userGoals = await goalRepository.findByUserId(currentUser.id);
        setGoals(userGoals);
      } catch (error) {
        console.error('Failed to load goals:', error);
        setGoals([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadGoals();
  }, [currentUser]);

  /**
   * Add new goal
   */
  const addGoal = useCallback(async (goal: GoalInput) => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      const newGoal = await goalRepository.create({ ...goal, userId: currentUser.id });
      setGoals(prev => [...prev, newGoal]);
      await refreshUser(); // Update user's goal count
    } catch (error) {
      console.error('Failed to add goal:', error);
      throw error;
    }
  }, [currentUser, refreshUser]);

  /**
   * Update existing goal
   */
  const updateGoal = useCallback(async (
    id: string,
    updates: Partial<Pick<Goal, 'name' | 'targetAmount' | 'currentAmount' | 'emoji'>>
  ) => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      const updatedGoal = await goalRepository.update(id, updates);
      setGoals(prev => prev.map(g => g.id === id ? updatedGoal : g));
      await refreshUser(); // Update user data
    } catch (error) {
      console.error('Failed to update goal:', error);
      throw error;
    }
  }, [currentUser, refreshUser]);

  /**
   * Delete goal
   */
  const deleteGoal = useCallback(async (id: string) => {
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      const success = await goalRepository.delete(id);
      if (success) {
        setGoals(prev => prev.filter(g => g.id !== id));
        await refreshUser(); // Update user's goal count
      }
    } catch (error) {
      console.error('Failed to delete goal:', error);
      throw error;
    }
  }, [currentUser, refreshUser]);

  /**
   * Refresh goals from storage
   */
  const refreshGoals = useCallback(async () => {
    if (!currentUser) return;

    try {
      const userGoals = await goalRepository.findByUserId(currentUser.id);
      setGoals(userGoals);
    } catch (error) {
      console.error('Failed to refresh goals:', error);
    }
  }, [currentUser]);

  const value = useMemo(() => ({
    goals,
    isLoading,
    addGoal,
    updateGoal,
    deleteGoal,
    refreshGoals,
  }), [goals, isLoading, addGoal, updateGoal, deleteGoal, refreshGoals]);

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>;
}

/**
 * useGoals - Hook to access goals state and operations
 * 
 * @throws Error if used outside GoalsProvider
 * 
 * @example
 * ```tsx
 * function GoalsList() {
 *   const { goals, updateGoal, deleteGoal, isLoading, error } = useGoals();
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   
 *   const handleAddMoney = (goalId: string, amount: number) => {
 *     const goal = goals.find(g => g.id === goalId);
 *     if (goal) {
 *       updateGoal(goalId, { 
 *         currentAmount: goal.currentAmount + amount 
 *       });
 *     }
 *   };
 *   
 *   return (
 *     <div>
 *       {goals.map(g => (
 *         <div key={g.id}>
 *           <h3>{g.name}</h3>
 *           <p>${g.currentAmount} / ${g.targetAmount}</p>
 *           <button onClick={() => handleAddMoney(g.id, 10)}>Add $10</button>
 *           <button onClick={() => deleteGoal(g.id)}>Delete</button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useGoals() {
  const context = useContext(GoalsContext);
  
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  
  return context;
}