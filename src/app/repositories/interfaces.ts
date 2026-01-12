/**
 * Repository Interfaces
 * 
 * Define contracts for data access layer.
 * This abstraction allows us to swap storage implementations
 * (localStorage → IndexedDB → API) without changing business logic.
 */

import { Transaction, TransactionInput, Goal, GoalInput, User, UserInput } from '../utils/validation';

/**
 * Result type for operations that can fail
 * Similar to Rust's Result<T, E> pattern
 */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Base repository interface
 * Common operations for all repositories
 */
export interface IRepository<T, TInput> {
  /**
   * Find item by ID
   * @returns Item if found, null if not found
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find all items
   * @returns Array of all items
   */
  findAll(): Promise<T[]>;

  /**
   * Create new item
   * @returns Created item with generated ID
   */
  create(input: TInput): Promise<T>;

  /**
   * Update existing item
   * @returns Updated item
   * @throws Error if item not found
   */
  update(id: string, updates: Partial<T>): Promise<T>;

  /**
   * Delete item by ID
   * @returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;
}

/**
 * Transaction Repository Interface
 * 
 * Manages transaction data for a specific user
 */
export interface ITransactionRepository extends IRepository<Transaction, TransactionInput> {
  /**
   * Find all transactions for a user
   */
  findByUserId(userId: string): Promise<Transaction[]>;

  /**
   * Find transactions by location
   */
  findByLocation(userId: string, location: Transaction['location']): Promise<Transaction[]>;

  /**
   * Find transactions by type (income/expense)
   */
  findByType(userId: string, type: Transaction['type']): Promise<Transaction[]>;

  /**
   * Find transactions within date range
   */
  findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]>;

  /**
   * Calculate total balance for user
   */
  calculateBalance(userId: string): Promise<number>;

  /**
   * Calculate balance by location
   */
  calculateBalanceByLocation(userId: string): Promise<Record<string, number>>;

  /**
   * Delete all transactions for a user
   */
  deleteByUserId(userId: string): Promise<number>;
}

/**
 * Goal Repository Interface
 * 
 * Manages savings goals for a specific user
 */
export interface IGoalRepository extends IRepository<Goal, GoalInput> {
  /**
   * Find all goals for a user
   */
  findByUserId(userId: string): Promise<Goal[]>;

  /**
   * Find completed goals
   */
  findCompleted(userId: string): Promise<Goal[]>;

  /**
   * Find active (incomplete) goals
   */
  findActive(userId: string): Promise<Goal[]>;

  /**
   * Add amount to goal
   */
  addAmount(goalId: string, amount: number): Promise<Goal>;

  /**
   * Calculate total saved across all goals
   */
  calculateTotalSaved(userId: string): Promise<number>;

  /**
   * Calculate total target across all goals
   */
  calculateTotalTarget(userId: string): Promise<number>;

  /**
   * Delete all goals for a user
   */
  deleteByUserId(userId: string): Promise<number>;
}

/**
 * User Repository Interface
 * 
 * Manages user accounts and authentication
 */
export interface IUserRepository {
  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find all users
   */
  findAll(): Promise<User[]>;

  /**
   * Create new user
   * @returns Created user with generated ID
   */
  create(input: UserInput): Promise<User>;

  /**
   * Update user (name, password)
   */
  update(id: string, updates: Partial<Pick<User, 'name' | 'emojiPassword'>>): Promise<User>;

  /**
   * Delete user and all their data
   */
  delete(id: string): Promise<boolean>;

  /**
   * Authenticate user with emoji password
   */
  authenticate(id: string, emojiPassword: string[]): Promise<boolean>;

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null;

  /**
   * Set current user ID
   */
  setCurrentUserId(id: string): Promise<void>;

  /**
   * Clear current user (logout)
   */
  clearCurrentUserId(): Promise<void>;
}

/**
 * Storage Interface
 * 
 * Abstraction over storage mechanism (localStorage, IndexedDB, API, etc.)
 * This allows us to swap storage backends without changing repositories
 */
export interface IStorage {
  /**
   * Get item from storage
   */
  getItem(key: string): Promise<string | null>;

  /**
   * Set item in storage
   */
  setItem(key: string, value: string): Promise<void>;

  /**
   * Remove item from storage
   */
  removeItem(key: string): Promise<void>;

  /**
   * Clear all items from storage
   */
  clear(): Promise<void>;

  /**
   * Get all keys in storage
   */
  keys(): Promise<string[]>;
}
