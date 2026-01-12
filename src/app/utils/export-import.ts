// Export/Import functionality for user data backup
import { z } from 'zod';
import { Transaction, Goal, User, getAppState } from './user-storage';
import { format } from 'date-fns';

// Schema validation for transactions
const TransactionSchema = z.object({
  id: z.string(),
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  location: z.enum(['wallet', 'bank', 'jar', 'other']),
  description: z.string(),
  date: z.string(),
  category: z.string().optional(),
});

// Schema validation for goals
const GoalSchema = z.object({
  id: z.string(),
  name: z.string(),
  targetAmount: z.number().positive(),
  currentAmount: z.number().nonnegative(),
  color: z.string(),
  emoji: z.string().optional(),
});

// Schema validation for export data
const ExportDataSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  appVersion: z.string(),
  user: z.object({
    name: z.string(),
    transactions: z.array(TransactionSchema),
    goals: z.array(GoalSchema),
  }),
});

export type ExportData = z.infer<typeof ExportDataSchema>;

/**
 * Export user data to JSON format
 */
export const exportUserData = (user: User): ExportData => {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    appVersion: '1.0.0',
    user: {
      name: user.name,
      transactions: user.transactions,
      goals: user.goals,
    },
  };
};

/**
 * Download export data as JSON file
 */
export const downloadExport = (data: ExportData, filename: string): void => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Generate filename for export
 */
export const generateExportFilename = (username: string): string => {
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const sanitizedName = username.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  return `money-journal-${sanitizedName}-${dateStr}.json`;
};

/**
 * Validate and parse import data
 * Throws error if validation fails
 */
export const validateImportData = (json: string): ExportData => {
  const parsed = JSON.parse(json);
  return ExportDataSchema.parse(parsed);
};

/**
 * Import data into current user
 * Returns stats about what was imported
 */
export const mergeImportData = (
  currentUserId: string,
  importData: ExportData
): { transactionsAdded: number; goalsAdded: number; transactionsSkipped: number; goalsSkipped: number } => {
  const state = getAppState();
  const user = state.users.find(u => u.id === currentUserId);
  
  if (!user) {
    throw new Error('User not found');
  }

  // Track existing IDs to avoid duplicates
  const existingTransactionIds = new Set(user.transactions.map(t => t.id));
  const existingGoalIds = new Set(user.goals.map(g => g.id));

  // Filter out duplicates
  const newTransactions = importData.user.transactions.filter(
    t => !existingTransactionIds.has(t.id)
  );
  
  const newGoals = importData.user.goals.filter(
    g => !existingGoalIds.has(g.id)
  );

  // Merge new data
  user.transactions = [...user.transactions, ...newTransactions];
  user.goals = [...user.goals, ...newGoals];

  // Save updated state
  localStorage.setItem('money_journal_users', JSON.stringify(state));

  return {
    transactionsAdded: newTransactions.length,
    goalsAdded: newGoals.length,
    transactionsSkipped: importData.user.transactions.length - newTransactions.length,
    goalsSkipped: importData.user.goals.length - newGoals.length,
  };
};
