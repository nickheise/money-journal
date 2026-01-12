import { z } from 'zod';

/**
 * Validation schemas for data models
 * 
 * Using Zod for runtime type checking and validation.
 * These schemas ensure data integrity at storage boundaries.
 */

// Transaction validation schema
export const TransactionSchema = z.object({
  id: z.string().min(1, 'Transaction ID is required'),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Type must be either income or expense' }),
  }),
  location: z.enum(['wallet', 'bank', 'jar', 'other'], {
    errorMap: () => ({ message: 'Invalid location' }),
  }),
  note: z.string().max(200, 'Note too long').optional(),
  date: z.string().datetime('Invalid date format'),
  category: z.string().optional(),
});

// Transaction without ID (for creation)
export const TransactionInputSchema = TransactionSchema.omit({ id: true }).extend({
  date: z.string().datetime('Invalid date format').optional(),
});

// Goal validation schema
export const GoalSchema = z.object({
  id: z.string().min(1, 'Goal ID is required'),
  name: z.string().min(1, 'Goal name is required').max(100, 'Goal name too long'),
  targetAmount: z.number().positive('Target amount must be positive'),
  currentAmount: z.number().min(0, 'Current amount cannot be negative'),
  color: z.string().min(1, 'Color is required'),
  emoji: z.string().optional(),
  note: z.string().optional(),
});

// Goal without ID (for creation)
export const GoalInputSchema = GoalSchema.omit({ id: true });

// User validation schema
export const UserSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  emojiPassword: z.array(z.string()).min(3, 'Password must be at least 3 emoji').max(6, 'Password cannot exceed 6 emoji'),
  transactions: z.array(TransactionSchema).default([]),
  goals: z.array(GoalSchema).default([]),
});

// User creation input
export const UserInputSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  emojiPassword: z.array(z.string()).min(3, 'Password must be at least 3 emoji').max(6, 'Password cannot exceed 6 emoji'),
});

// Export types inferred from schemas
export type Transaction = z.infer<typeof TransactionSchema>;
export type TransactionInput = z.infer<typeof TransactionInputSchema>;
export type Goal = z.infer<typeof GoalSchema>;
export type GoalInput = z.infer<typeof GoalInputSchema>;
export type User = z.infer<typeof UserSchema>;
export type UserInput = z.infer<typeof UserInputSchema>;

/**
 * Validation helper functions
 */

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public validationErrors?: z.ZodError
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validates data against a schema and throws ValidationError if invalid
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param errorPrefix - Prefix for error messages
 * @returns Validated and typed data
 * @throws ValidationError if validation fails
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  errorPrefix: string = 'Validation failed'
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Safety check for empty errors array
      if (error.errors.length > 0) {
        const firstError = error.errors[0];
        const field = firstError.path.join('.');
        const message = `${errorPrefix}: ${firstError.message}`;
        throw new ValidationError(message, field, error);
      } else {
        throw new ValidationError(`${errorPrefix}: Unknown validation error`, undefined, error);
      }
    }
    throw error;
  }
}

/**
 * Validates data against a schema and returns result with success flag
 * Does not throw - returns validation result instead
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success flag and either data or error
 */
export function validateSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

/**
 * Validates array of items
 * 
 * @param schema - Zod schema for individual items
 * @param items - Array of items to validate
 * @param errorPrefix - Prefix for error messages
 * @returns Validated array
 * @throws ValidationError if any item fails validation
 */
export function validateArray<T>(
  schema: z.ZodSchema<T>,
  items: unknown[],
  errorPrefix: string = 'Array validation failed'
): T[] {
  return items.map((item, index) => {
    try {
      return schema.parse(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          `${errorPrefix} at index ${index}: ${firstError.message}`,
          `[${index}].${firstError.path.join('.')}`,
          error
        );
      }
      throw error;
    }
  });
}