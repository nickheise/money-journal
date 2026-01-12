import { ITransactionRepository } from './interfaces';
import { UserRepository } from './UserRepository';
import { 
  Transaction, 
  TransactionInput, 
  TransactionSchema, 
  TransactionInputSchema,
  validate 
} from '../utils/validation';

/**
 * TransactionRepository - Manages transaction data
 * 
 * Responsibilities:
 * - CRUD operations for transactions
 * - Filtering and querying transactions
 * - Balance calculations
 * - Data validation
 * 
 * Transactions are stored within User objects in the UserRepository
 */
export class TransactionRepository implements ITransactionRepository {
  constructor(private userRepository: UserRepository) {}

  /**
   * Generate unique ID for new transaction
   */
  private generateId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all transactions for a user
   */
  private async getUserTransactions(userId: string): Promise<Transaction[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(`User with ID "${userId}" not found`);
    }
    return user.transactions;
  }

  /**
   * Save transactions for a user
   */
  private async saveUserTransactions(userId: string, transactions: Transaction[]): Promise<void> {
    // Validate all transactions
    const validated = transactions.map(t => 
      validate(TransactionSchema, t, 'Invalid transaction data')
    );
    await this.userRepository.updateUserTransactions(userId, validated);
  }

  /**
   * Find transaction by ID
   */
  async findById(id: string): Promise<Transaction | null> {
    // Need to search all users since we don't know which user owns this transaction
    const users = await this.userRepository.findAll();
    
    for (const user of users) {
      const transaction = user.transactions.find(t => t.id === id);
      if (transaction) {
        return transaction;
      }
    }
    
    return null;
  }

  /**
   * Find all transactions (across all users)
   * Note: Usually you want findByUserId instead
   */
  async findAll(): Promise<Transaction[]> {
    const users = await this.userRepository.findAll();
    return users.flatMap(u => u.transactions);
  }

  /**
   * Find all transactions for a specific user
   */
  async findByUserId(userId: string): Promise<Transaction[]> {
    return this.getUserTransactions(userId);
  }

  /**
   * Find transactions by location
   */
  async findByLocation(userId: string, location: Transaction['location']): Promise<Transaction[]> {
    const transactions = await this.getUserTransactions(userId);
    return transactions.filter(t => t.location === location);
  }

  /**
   * Find transactions by type (income/expense)
   */
  async findByType(userId: string, type: Transaction['type']): Promise<Transaction[]> {
    const transactions = await this.getUserTransactions(userId);
    return transactions.filter(t => t.type === type);
  }

  /**
   * Find transactions within date range
   */
  async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    const transactions = await this.getUserTransactions(userId);
    return transactions.filter(t => {
      const txnDate = new Date(t.date);
      return txnDate >= startDate && txnDate <= endDate;
    });
  }

  /**
   * Create new transaction
   */
  async create(input: TransactionInput & { userId: string }): Promise<Transaction> {
    const { userId, ...transactionInput } = input;

    // Validate input
    const validatedInput = validate(
      TransactionInputSchema,
      transactionInput,
      'Invalid transaction input'
    );

    // Get current transactions
    const transactions = await this.getUserTransactions(userId);

    // Create new transaction
    const newTransaction: Transaction = {
      id: this.generateId(),
      ...validatedInput,
      // Ensure date is ISO string
      date: validatedInput.date || new Date().toISOString(),
    };

    // Validate complete transaction
    const validatedTransaction = validate(
      TransactionSchema,
      newTransaction,
      'Failed to create valid transaction'
    );

    // Add to beginning of array (newest first)
    transactions.unshift(validatedTransaction);

    // Save
    await this.saveUserTransactions(userId, transactions);

    return validatedTransaction;
  }

  /**
   * Update transaction
   */
  async update(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    // Find which user owns this transaction
    const users = await this.userRepository.findAll();
    let ownerUserId: string | null = null;
    let transactions: Transaction[] = [];

    for (const user of users) {
      const txnIndex = user.transactions.findIndex(t => t.id === id);
      if (txnIndex !== -1) {
        ownerUserId = user.id;
        transactions = user.transactions;
        break;
      }
    }

    if (!ownerUserId) {
      throw new Error(`Transaction with ID "${id}" not found`);
    }

    const txnIndex = transactions.findIndex(t => t.id === id);

    // Apply updates
    const updatedTransaction = {
      ...transactions[txnIndex],
      ...updates,
      id, // Preserve original ID
    };

    // Validate
    const validatedTransaction = validate(
      TransactionSchema,
      updatedTransaction,
      'Invalid transaction update'
    );

    transactions[txnIndex] = validatedTransaction;
    await this.saveUserTransactions(ownerUserId, transactions);

    return validatedTransaction;
  }

  /**
   * Delete transaction by ID
   */
  async delete(id: string): Promise<boolean> {
    // Find which user owns this transaction
    const users = await this.userRepository.findAll();

    for (const user of users) {
      const initialLength = user.transactions.length;
      const filtered = user.transactions.filter(t => t.id !== id);

      if (filtered.length < initialLength) {
        // Transaction was found and removed
        await this.saveUserTransactions(user.id, filtered);
        return true;
      }
    }

    return false; // Transaction not found
  }

  /**
   * Delete all transactions for a user
   */
  async deleteByUserId(userId: string): Promise<number> {
    const transactions = await this.getUserTransactions(userId);
    const count = transactions.length;
    await this.saveUserTransactions(userId, []);
    return count;
  }

  /**
   * Calculate total balance for user
   * Income adds, expense subtracts
   */
  async calculateBalance(userId: string): Promise<number> {
    const transactions = await this.getUserTransactions(userId);
    return transactions.reduce((balance, txn) => {
      return txn.type === 'income' 
        ? balance + txn.amount 
        : balance - txn.amount;
    }, 0);
  }

  /**
   * Calculate balance by location
   */
  async calculateBalanceByLocation(userId: string): Promise<Record<string, number>> {
    const transactions = await this.getUserTransactions(userId);
    
    const balances: Record<string, number> = {
      wallet: 0,
      bank: 0,
      jar: 0,
      other: 0,
    };

    for (const txn of transactions) {
      const change = txn.type === 'income' ? txn.amount : -txn.amount;
      balances[txn.location] += change;
    }

    return balances;
  }
}
