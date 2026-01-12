/**
 * Repository exports
 * 
 * This file provides singleton instances of all repositories.
 * All components should use these instances instead of creating their own.
 */

import { getUserRepository, getTransactionRepository, getGoalRepository } from './RepositoryFactory';

// Export singleton repository instances
export const userRepository = getUserRepository();
export const transactionRepository = getTransactionRepository();
export const goalRepository = getGoalRepository();

// Also export the factory and types for advanced usage
export { RepositoryFactory, getRepositoryFactory } from './RepositoryFactory';
export type { IUserRepository, ITransactionRepository, IGoalRepository, IStorage } from './interfaces';
