import { IUserRepository, IStorage } from './interfaces';
import { User, UserInput, UserSchema, UserInputSchema, validate } from '../utils/validation';

/**
 * UserRepository - Manages user data in storage
 * 
 * Responsibilities:
 * - CRUD operations for users
 * - Authentication
 * - Current user tracking
 * - Data validation
 */
export class UserRepository implements IUserRepository {
  private storage: IStorage;
  private readonly USERS_KEY = 'money_journal_users';
  private readonly CURRENT_USER_KEY = 'money_journal_current_user';
  
  // In-memory cache for performance
  private usersCache: User[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 60000; // Cache valid for 60 seconds

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  /**
   * Invalidate the cache (call when data changes)
   */
  private invalidateCache(): void {
    this.usersCache = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(): boolean {
    if (!this.usersCache) return false;
    return Date.now() - this.cacheTimestamp < this.CACHE_TTL;
  }

  /**
   * Get all users from storage (private helper)
   */
  private async getUsers(): Promise<User[]> {
    if (this.isCacheValid() && this.usersCache) {
      return this.usersCache;
    }

    const data = await this.storage.getItem(this.USERS_KEY);
    if (!data) {
      this.usersCache = [];
      this.cacheTimestamp = Date.now();
      return [];
    }

    try {
      const parsed = JSON.parse(data);
      
      // Expect an array of users
      if (!Array.isArray(parsed)) {
        console.error('Expected users to be an array, got:', typeof parsed);
        this.usersCache = [];
        this.cacheTimestamp = Date.now();
        return [];
      }
      
      // Validate all users and cache
      const validated = parsed.map((user: unknown) => validate(UserSchema, user, 'Invalid user data'));
      this.usersCache = validated;
      this.cacheTimestamp = Date.now();
      return validated;
    } catch (error) {
      console.error('Failed to parse users:', error);
      this.usersCache = [];
      this.cacheTimestamp = Date.now();
      return [];
    }
  }

  /**
   * Save all users to storage (private helper)
   */
  private async saveUsers(users: User[]): Promise<void> {
    // Validate before saving
    const validated = users.map(user => validate(UserSchema, user, 'Invalid user data'));
    await this.storage.setItem(this.USERS_KEY, JSON.stringify(validated));
    this.invalidateCache();
  }

  /**
   * Generate unique ID for new user
   */
  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(u => u.id === id) || null;
  }

  /**
   * Find all users
   */
  async findAll(): Promise<User[]> {
    return this.getUsers();
  }

  /**
   * Create new user
   */
  async create(input: UserInput): Promise<User> {
    // Validate input
    const validatedInput = validate(UserInputSchema, input, 'Invalid user input');

    const users = await this.getUsers();

    // Check for duplicate name
    const existingUser = users.find(u => 
      u.name.toLowerCase() === validatedInput.name.toLowerCase()
    );
    if (existingUser) {
      throw new Error(`User with name "${validatedInput.name}" already exists`);
    }

    // Create new user
    const newUser: User = {
      id: this.generateId(),
      name: validatedInput.name,
      emojiPassword: validatedInput.emojiPassword,
      transactions: [],
      goals: [],
    };

    // Validate complete user object
    const validatedUser = validate(UserSchema, newUser, 'Failed to create valid user');

    users.push(validatedUser);
    await this.saveUsers(users);

    // Set as current user
    await this.setCurrentUserId(validatedUser.id);

    return validatedUser;
  }

  /**
   * Update user (name or password)
   */
  async update(
    id: string,
    updates: Partial<Pick<User, 'name' | 'emojiPassword'>>
  ): Promise<User> {
    const users = await this.getUsers();
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      throw new Error(`User with ID "${id}" not found`);
    }

    // Check for duplicate name if name is being updated
    if (updates.name) {
      const duplicateName = users.find(
        (u, idx) => idx !== userIndex && u.name.toLowerCase() === updates.name!.toLowerCase()
      );
      if (duplicateName) {
        throw new Error(`User with name "${updates.name}" already exists`);
      }
    }

    // Apply updates
    const updatedUser = {
      ...users[userIndex],
      ...updates,
    };

    // Validate updated user
    const validatedUser = validate(UserSchema, updatedUser, 'Invalid user update');

    users[userIndex] = validatedUser;
    await this.saveUsers(users);

    return validatedUser;
  }

  /**
   * Delete user and all their data
   */
  async delete(id: string): Promise<boolean> {
    const users = await this.getUsers();
    const initialLength = users.length;
    const filtered = users.filter(u => u.id !== id);

    if (filtered.length === initialLength) {
      return false; // User not found
    }

    await this.saveUsers(filtered);

    // Clear current user if it was deleted
    const currentUserId = await this.getCurrentUserId();
    if (currentUserId === id) {
      await this.clearCurrentUserId();
    }

    return true;
  }

  /**
   * Authenticate user with emoji password
   */
  async authenticate(id: string, emojiPassword: string[]): Promise<boolean> {
    const user = await this.findById(id);
    if (!user) {
      return false;
    }

    // Compare emoji passwords
    if (user.emojiPassword.length !== emojiPassword.length) {
      return false;
    }

    return user.emojiPassword.every((emoji, index) => emoji === emojiPassword[index]);
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return localStorage.getItem(this.CURRENT_USER_KEY);
  }

  /**
   * Set current user ID
   */
  async setCurrentUserId(id: string): Promise<void> {
    // Verify user exists
    const user = await this.findById(id);
    if (!user) {
      throw new Error(`Cannot set current user: User with ID "${id}" not found`);
    }

    await this.storage.setItem(this.CURRENT_USER_KEY, id);
  }

  /**
   * Clear current user (logout)
   */
  async clearCurrentUserId(): Promise<void> {
    await this.storage.removeItem(this.CURRENT_USER_KEY);
  }

  /**
   * Update user's transactions array
   * (Internal method used by TransactionRepository)
   */
  async updateUserTransactions(userId: string, transactions: any[]): Promise<void> {
    const users = await this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new Error(`User with ID "${userId}" not found`);
    }

    users[userIndex].transactions = transactions;
    
    // Validate updated user
    const validatedUser = validate(UserSchema, users[userIndex], 'Invalid user data after transaction update');
    users[userIndex] = validatedUser;
    
    await this.saveUsers(users);
  }

  /**
   * Update user's goals array
   * (Internal method used by GoalRepository)
   */
  async updateUserGoals(userId: string, goals: any[]): Promise<void> {
    const users = await this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new Error(`User with ID "${userId}" not found`);
    }

    users[userIndex].goals = goals;
    
    // Validate updated user
    const validatedUser = validate(UserSchema, users[userIndex], 'Invalid user data after goal update');
    users[userIndex] = validatedUser;
    
    await this.saveUsers(users);
  }
}