import { z } from 'zod';

/**
 * Expense categories (fixed list, matches the Add/Edit dialog).
 */
export const EXPENSE_CATEGORIES = [
  'Food & Beverage',
  'Maintenance',
  'Salary',
  'Fuel',
  'Equipment',
  'Marketing',
  'Laundry',
  'Other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

/**
 * Create/update payload for an expense. `notes` maps to the DB `description`.
 */
export const expenseSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  category: z.enum(EXPENSE_CATEGORIES),
  amount: z.number().positive('Amount must be greater than 0'),
  notes: z.string().min(1, 'Notes are required').max(500),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;

// Made with Bob
