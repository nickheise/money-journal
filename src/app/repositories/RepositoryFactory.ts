import { IStorage } from './interfaces';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { UserRepository } from './UserRepository';
import { TransactionRepository } from './TransactionRepository';
import { GoalRepository } from './GoalRepository';

/**
 * RepositoryFactory - Creates and manages repository instances
 * 
 * This factory pattern allows us to:
 * - Create repositories with proper dependencies
 * - Swap storage implementations easily
 * - Use singleton instances (avoid creating multiple repositories)
 * - Inject mock storage for testing
 * 
 * Usage:
 * ```typescript
 * const factory = RepositoryFactory.getInstance();
 * const userRepo = factory.getUserRepository();
 * const txnRepo = factory.getTransactionRepository();
 * ```
 */
export class RepositoryFactory {
  private static instance: RepositoryFactory | null = null;

  private storage: IStorage;
  private userRepository: UserRepository | null = null;
  private transactionRepository: TransactionRepository | null = null;
  private goalRepository: GoalRepository | null = null;

  /**
   * Private constructor - use getInstance() instead
   */
  private constructor(storage?: IStorage) {
    this.storage = storage || new LocalStorageAdapter();
  }

  /**
   * Get singleton instance of RepositoryFactory
   */
  static getInstance(storage?: IStorage): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory(storage);
    }
    return RepositoryFactory.instance;
  }

  /**
   * Reset singleton instance (useful for testing)
   */
  static reset(): void {
    RepositoryFactory.instance = null;
  }

  /**
   * Get UserRepository instance (singleton)
   */
  getUserRepository(): UserRepository {
    if (!this.userRepository) {
      this.userRepository = new UserRepository(this.storage);
    }
    return this.userRepository;
  }

  /**
   * Get TransactionRepository instance (singleton)
   */
  getTransactionRepository(): TransactionRepository {
    if (!this.transactionRepository) {
      const userRepo = this.getUserRepository();
      this.transactionRepository = new TransactionRepository(userRepo);
    }
    return this.transactionRepository;
  }

  /**
   * Get GoalRepository instance (singleton)
   */
  getGoalRepository(): GoalRepository {
    if (!this.goalRepository) {
      const userRepo = this.getUserRepository();
      this.goalRepository = new GoalRepository(userRepo);
    }
    return this.goalRepository;
  }

  /**
   * Get storage adapter (for advanced usage)
   */
  getStorage(): IStorage {
    return this.storage;
  }

  /**
   * Replace storage adapter (useful for testing or migrating storage)
   * WARNING: This resets all repository instances
   */
  setStorage(storage: IStorage): void {
    this.storage = storage;
    this.userRepository = null;
    this.transactionRepository = null;
    this.goalRepository = null;
  }
}

/**
 * Convenience function to get repository factory
 */
export function getRepositoryFactory(): RepositoryFactory {
  return RepositoryFactory.getInstance();
}

/**
 * Convenience functions to get individual repositories
 */
export function getUserRepository(): UserRepository {
  return getRepositoryFactory().getUserRepository();
}

export function getTransactionRepository(): TransactionRepository {
  return getRepositoryFactory().getTransactionRepository();
}

export function getGoalRepository(): GoalRepository {
  return getRepositoryFactory().getGoalRepository();
}
