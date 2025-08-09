import { 
  serial, 
  text, 
  pgTable, 
  timestamp, 
  numeric, 
  integer, 
  boolean, 
  pgEnum,
  date,
  json
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const expenseTypeEnum = pgEnum('expense_type', ['advance', 'purchase', 'work_service']);
export const currencyEnum = pgEnum('currency', ['USD', 'EUR', 'GBP', 'CAD', 'AUD']);
export const languageEnum = pgEnum('language', ['en', 'es', 'fr', 'de', 'it']);
export const expenseStatusEnum = pgEnum('expense_status', ['pending', 'approved', 'rejected', 'completed']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  preferred_language: languageEnum('preferred_language').notNull().default('en'),
  preferred_currency: currencyEnum('preferred_currency').notNull().default('USD'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Projects table
export const projectsTable = pgTable('projects', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id),
  name: text('name').notNull(),
  description: text('description'),
  total_budget: numeric('total_budget', { precision: 12, scale: 2 }).notNull(),
  currency: currencyEnum('currency').notNull(),
  start_date: date('start_date').notNull(),
  end_date: date('end_date'),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Categories table
export const categoriesTable = pgTable('categories', {
  id: serial('id').primaryKey(),
  project_id: integer('project_id').notNull().references(() => projectsTable.id),
  name: text('name').notNull(),
  description: text('description'),
  budget_allocation: numeric('budget_allocation', { precision: 12, scale: 2 }).notNull().default('0'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Expenses table
export const expensesTable = pgTable('expenses', {
  id: serial('id').primaryKey(),
  project_id: integer('project_id').notNull().references(() => projectsTable.id),
  category_id: integer('category_id').references(() => categoriesTable.id),
  user_id: integer('user_id').notNull().references(() => usersTable.id),
  type: expenseTypeEnum('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: currencyEnum('currency').notNull(),
  exchange_rate: numeric('exchange_rate', { precision: 10, scale: 6 }).notNull().default('1'),
  vendor_name: text('vendor_name'),
  receipt_url: text('receipt_url'),
  expense_date: date('expense_date').notNull(),
  payment_method: text('payment_method'),
  status: expenseStatusEnum('status').notNull().default('pending'),
  tags: json('tags').$type<string[]>().notNull().default([]),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Monthly budgets table
export const monthlyBudgetsTable = pgTable('monthly_budgets', {
  id: serial('id').primaryKey(),
  project_id: integer('project_id').notNull().references(() => projectsTable.id),
  year: integer('year').notNull(),
  month: integer('month').notNull(),
  allocated_amount: numeric('allocated_amount', { precision: 12, scale: 2 }).notNull(),
  spent_amount: numeric('spent_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  currency: currencyEnum('currency').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  projects: many(projectsTable),
  expenses: many(expensesTable)
}));

export const projectsRelations = relations(projectsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [projectsTable.user_id],
    references: [usersTable.id]
  }),
  categories: many(categoriesTable),
  expenses: many(expensesTable),
  monthlyBudgets: many(monthlyBudgetsTable)
}));

export const categoriesRelations = relations(categoriesTable, ({ one, many }) => ({
  project: one(projectsTable, {
    fields: [categoriesTable.project_id],
    references: [projectsTable.id]
  }),
  expenses: many(expensesTable)
}));

export const expensesRelations = relations(expensesTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [expensesTable.project_id],
    references: [projectsTable.id]
  }),
  category: one(categoriesTable, {
    fields: [expensesTable.category_id],
    references: [categoriesTable.id]
  }),
  user: one(usersTable, {
    fields: [expensesTable.user_id],
    references: [usersTable.id]
  })
}));

export const monthlyBudgetsRelations = relations(monthlyBudgetsTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [monthlyBudgetsTable.project_id],
    references: [projectsTable.id]
  })
}));

// TypeScript types for the table schemas
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Project = typeof projectsTable.$inferSelect;
export type NewProject = typeof projectsTable.$inferInsert;
export type Category = typeof categoriesTable.$inferSelect;
export type NewCategory = typeof categoriesTable.$inferInsert;
export type Expense = typeof expensesTable.$inferSelect;
export type NewExpense = typeof expensesTable.$inferInsert;
export type MonthlyBudget = typeof monthlyBudgetsTable.$inferSelect;
export type NewMonthlyBudget = typeof monthlyBudgetsTable.$inferInsert;

// Export all tables for proper query building
export const tables = {
  users: usersTable,
  projects: projectsTable,
  categories: categoriesTable,
  expenses: expensesTable,
  monthlyBudgets: monthlyBudgetsTable
};