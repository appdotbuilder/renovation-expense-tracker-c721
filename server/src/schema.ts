import { z } from 'zod';

// Enum schemas
export const expenseTypeSchema = z.enum(['advance', 'purchase', 'work_service']);
export const currencySchema = z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']);
export const languageSchema = z.enum(['en', 'es', 'fr', 'de', 'it']);
export const expenseStatusSchema = z.enum(['pending', 'approved', 'rejected', 'completed']);

// User schema
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  preferred_language: languageSchema,
  preferred_currency: currencySchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Project schema
export const projectSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  total_budget: z.number().positive(),
  currency: currencySchema,
  start_date: z.coerce.date(),
  end_date: z.coerce.date().nullable(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Project = z.infer<typeof projectSchema>;

// Category schema
export const categorySchema = z.object({
  id: z.number(),
  project_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  budget_allocation: z.number().nonnegative(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Category = z.infer<typeof categorySchema>;

// Expense schema
export const expenseSchema = z.object({
  id: z.number(),
  project_id: z.number(),
  category_id: z.number().nullable(),
  user_id: z.number(),
  type: expenseTypeSchema,
  title: z.string(),
  description: z.string().nullable(),
  amount: z.number().positive(),
  currency: currencySchema,
  exchange_rate: z.number().positive().default(1),
  vendor_name: z.string().nullable(),
  receipt_url: z.string().url().nullable(),
  expense_date: z.coerce.date(),
  payment_method: z.string().nullable(),
  status: expenseStatusSchema,
  tags: z.array(z.string()).default([]),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Expense = z.infer<typeof expenseSchema>;

// Monthly budget schema
export const monthlyBudgetSchema = z.object({
  id: z.number(),
  project_id: z.number(),
  year: z.number().int().min(2000),
  month: z.number().int().min(1).max(12),
  allocated_amount: z.number().nonnegative(),
  spent_amount: z.number().nonnegative(),
  currency: currencySchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type MonthlyBudget = z.infer<typeof monthlyBudgetSchema>;

// Input schemas for creating entities
export const createUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  preferred_language: languageSchema.default('en'),
  preferred_currency: currencySchema.default('USD')
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const createProjectInputSchema = z.object({
  user_id: z.number(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  total_budget: z.number().positive(),
  currency: currencySchema,
  start_date: z.coerce.date(),
  end_date: z.coerce.date().nullable().optional()
});

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;

export const createCategoryInputSchema = z.object({
  project_id: z.number(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  budget_allocation: z.number().nonnegative()
});

export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;

export const createExpenseInputSchema = z.object({
  project_id: z.number(),
  category_id: z.number().nullable().optional(),
  user_id: z.number(),
  type: expenseTypeSchema,
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  amount: z.number().positive(),
  currency: currencySchema,
  exchange_rate: z.number().positive().default(1),
  vendor_name: z.string().nullable().optional(),
  receipt_url: z.string().url().nullable().optional(),
  expense_date: z.coerce.date(),
  payment_method: z.string().nullable().optional(),
  status: expenseStatusSchema.default('pending'),
  tags: z.array(z.string()).default([])
});

export type CreateExpenseInput = z.infer<typeof createExpenseInputSchema>;

export const createMonthlyBudgetInputSchema = z.object({
  project_id: z.number(),
  year: z.number().int().min(2000),
  month: z.number().int().min(1).max(12),
  allocated_amount: z.number().nonnegative(),
  currency: currencySchema
});

export type CreateMonthlyBudgetInput = z.infer<typeof createMonthlyBudgetInputSchema>;

// Update schemas
export const updateProjectInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  total_budget: z.number().positive().optional(),
  currency: currencySchema.optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().nullable().optional(),
  is_active: z.boolean().optional()
});

export type UpdateProjectInput = z.infer<typeof updateProjectInputSchema>;

export const updateExpenseInputSchema = z.object({
  id: z.number(),
  category_id: z.number().nullable().optional(),
  type: expenseTypeSchema.optional(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  amount: z.number().positive().optional(),
  currency: currencySchema.optional(),
  exchange_rate: z.number().positive().optional(),
  vendor_name: z.string().nullable().optional(),
  receipt_url: z.string().url().nullable().optional(),
  expense_date: z.coerce.date().optional(),
  payment_method: z.string().nullable().optional(),
  status: expenseStatusSchema.optional(),
  tags: z.array(z.string()).optional()
});

export type UpdateExpenseInput = z.infer<typeof updateExpenseInputSchema>;

// Query schemas for filtering and search
export const expenseFilterSchema = z.object({
  project_id: z.number().optional(),
  category_id: z.number().nullable().optional(),
  user_id: z.number().optional(),
  type: expenseTypeSchema.optional(),
  status: expenseStatusSchema.optional(),
  vendor_name: z.string().optional(),
  amount_min: z.number().nonnegative().optional(),
  amount_max: z.number().nonnegative().optional(),
  date_from: z.coerce.date().optional(),
  date_to: z.coerce.date().optional(),
  search_term: z.string().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['date', 'amount', 'title', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type ExpenseFilter = z.infer<typeof expenseFilterSchema>;

// Analytics schemas
export const analyticsQuerySchema = z.object({
  project_id: z.number(),
  date_from: z.coerce.date(),
  date_to: z.coerce.date(),
  group_by: z.enum(['day', 'week', 'month', 'category', 'type']).default('month')
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;

export const analyticsDataSchema = z.object({
  total_spent: z.number(),
  total_budget: z.number(),
  budget_utilization: z.number(),
  expenses_by_type: z.array(z.object({
    type: expenseTypeSchema,
    amount: z.number(),
    count: z.number()
  })),
  expenses_by_category: z.array(z.object({
    category_name: z.string(),
    amount: z.number(),
    count: z.number(),
    budget_allocation: z.number()
  })),
  monthly_trends: z.array(z.object({
    period: z.string(),
    amount: z.number(),
    count: z.number()
  })),
  top_vendors: z.array(z.object({
    vendor_name: z.string(),
    amount: z.number(),
    count: z.number()
  }))
});

export type AnalyticsData = z.infer<typeof analyticsDataSchema>;

// Export/Import schemas
export const exportOptionsSchema = z.object({
  project_id: z.number(),
  format: z.enum(['csv', 'json', 'pdf']),
  date_from: z.coerce.date().optional(),
  date_to: z.coerce.date().optional(),
  include_receipts: z.boolean().default(false),
  categories: z.array(z.number()).optional(),
  expense_types: z.array(expenseTypeSchema).optional()
});

export type ExportOptions = z.infer<typeof exportOptionsSchema>;

export const importDataSchema = z.object({
  project_id: z.number(),
  format: z.enum(['csv', 'json']),
  data: z.string(), // Base64 encoded file content
  validate_only: z.boolean().default(false)
});

export type ImportData = z.infer<typeof importDataSchema>;

export const importResultSchema = z.object({
  success: z.boolean(),
  imported_count: z.number(),
  errors: z.array(z.object({
    row: z.number(),
    field: z.string(),
    message: z.string()
  })),
  preview: z.array(expenseSchema).optional()
});

export type ImportResult = z.infer<typeof importResultSchema>;