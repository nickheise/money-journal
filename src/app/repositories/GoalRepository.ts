import { IGoalRepository } from './interfaces';
import { UserRepository } from './UserRepository';
import { 
  Goal, 
  GoalInput, 
  GoalSchema, 
  GoalInputSchema,
  validate 
} from '../utils/validation';

/**
 * GoalRepository - Manages savings goal data
 * 
 * Responsibilities:
 * - CRUD operations for goals
 * - Filtering and querying goals
 * - Goal calculations (total saved, total target)
 * - Data validation
 * 
 * Goals are stored within User objects in the UserRepository
 */
export class GoalRepository implements IGoalRepository {
  constructor(private userRepository: UserRepository) {}

  /**
   * Generate unique ID for new goal
   */
  private generateId(): string {
    return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all goals for a user
   */
  private async getUserGoals(userId: string): Promise<Goal[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(`User with ID "${userId}" not found`);
    }
    return user.goals;
  }

  /**
   * Save goals for a user
   */
  private async saveUserGoals(userId: string, goals: Goal[]): Promise<void> {
    // Validate all goals
    const validated = goals.map(g => 
      validate(GoalSchema, g, 'Invalid goal data')
    );
    await this.userRepository.updateUserGoals(userId, validated);
  }

  /**
   * Find goal by ID
   */
  async findById(id: string): Promise<Goal | null> {
    // Need to search all users since we don't know which user owns this goal
    const users = await this.userRepository.findAll();
    
    for (const user of users) {
      const goal = user.goals.find(g => g.id === id);
      if (goal) {
        return goal;
      }
    }
    
    return null;
  }

  /**
   * Find all goals (across all users)
   * Note: Usually you want findByUserId instead
   */
  async findAll(): Promise<Goal[]> {
    const users = await this.userRepository.findAll();
    return users.flatMap(u => u.goals);
  }

  /**
   * Find all goals for a specific user
   */
  async findByUserId(userId: string): Promise<Goal[]> {
    return this.getUserGoals(userId);
  }

  /**
   * Find completed goals (currentAmount >= targetAmount)
   */
  async findCompleted(userId: string): Promise<Goal[]> {
    const goals = await this.getUserGoals(userId);
    return goals.filter(g => g.currentAmount >= g.targetAmount);
  }

  /**
   * Find active (incomplete) goals
   */
  async findActive(userId: string): Promise<Goal[]> {
    const goals = await this.getUserGoals(userId);
    return goals.filter(g => g.currentAmount < g.targetAmount);
  }

  /**
   * Create new goal
   */
  async create(input: GoalInput & { userId: string }): Promise<Goal> {
    const { userId, ...goalInput } = input;

    // Validate input
    const validatedInput = validate(
      GoalInputSchema,
      goalInput,
      'Invalid goal input'
    );

    // Get current goals
    const goals = await this.getUserGoals(userId);

    // Create new goal
    const newGoal: Goal = {
      id: this.generateId(),
      ...validatedInput,
      currentAmount: validatedInput.currentAmount || 0, // Default to 0 if not provided
    };

    // Validate complete goal
    const validatedGoal = validate(
      GoalSchema,
      newGoal,
      'Failed to create valid goal'
    );

    // Add to array
    goals.push(validatedGoal);

    // Save
    await this.saveUserGoals(userId, goals);

    return validatedGoal;
  }

  /**
   * Update goal
   */
  async update(id: string, updates: Partial<Goal>): Promise<Goal> {
    // Find which user owns this goal
    const users = await this.userRepository.findAll();
    let ownerUserId: string | null = null;
    let goals: Goal[] = [];

    for (const user of users) {
      const goalIndex = user.goals.findIndex(g => g.id === id);
      if (goalIndex !== -1) {
        ownerUserId = user.id;
        goals = user.goals;
        break;
      }
    }

    if (!ownerUserId) {
      throw new Error(`Goal with ID "${id}" not found`);
    }

    const goalIndex = goals.findIndex(g => g.id === id);

    // Apply updates
    const updatedGoal = {
      ...goals[goalIndex],
      ...updates,
      id, // Preserve original ID
    };

    // Validate
    const validatedGoal = validate(
      GoalSchema,
      updatedGoal,
      'Invalid goal update'
    );

    goals[goalIndex] = validatedGoal;
    await this.saveUserGoals(ownerUserId, goals);

    return validatedGoal;
  }

  /**
   * Delete goal by ID
   */
  async delete(id: string): Promise<boolean> {
    // Find which user owns this goal
    const users = await this.userRepository.findAll();

    for (const user of users) {
      const initialLength = user.goals.length;
      const filtered = user.goals.filter(g => g.id !== id);

      if (filtered.length < initialLength) {
        // Goal was found and removed
        await this.saveUserGoals(user.id, filtered);
        return true;
      }
    }

    return false; // Goal not found
  }

  /**
   * Delete all goals for a user
   */
  async deleteByUserId(userId: string): Promise<number> {
    const goals = await this.getUserGoals(userId);
    const count = goals.length;
    await this.saveUserGoals(userId, []);
    return count;
  }

  /**
   * Add amount to goal
   */
  async addAmount(goalId: string, amount: number): Promise<Goal> {
    if (amount < 0) {
      throw new Error('Amount must be positive');
    }

    const goal = await this.findById(goalId);
    if (!goal) {
      throw new Error(`Goal with ID "${goalId}" not found`);
    }

    const newAmount = goal.currentAmount + amount;
    return this.update(goalId, { currentAmount: newAmount });
  }

  /**
   * Calculate total saved across all goals
   */
  async calculateTotalSaved(userId: string): Promise<number> {
    const goals = await this.getUserGoals(userId);
    return goals.reduce((total, goal) => total + goal.currentAmount, 0);
  }

  /**
   * Calculate total target across all goals
   */
  async calculateTotalTarget(userId: string): Promise<number> {
    const goals = await this.getUserGoals(userId);
    return goals.reduce((total, goal) => total + goal.targetAmount, 0);
  }
}
