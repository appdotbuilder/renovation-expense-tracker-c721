import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  createUserInputSchema,
  createProjectInputSchema,
  updateProjectInputSchema,
  createCategoryInputSchema,
  createExpenseInputSchema,
  updateExpenseInputSchema,
  createMonthlyBudgetInputSchema,
  expenseFilterSchema,
  analyticsQuerySchema,
  exportOptionsSchema,
  importDataSchema
} from './schema';

// Import handlers
import { createUser } from './handlers/create_user';
import { getUsers } from './handlers/get_users';
import { createProject } from './handlers/create_project';
import { getProjects } from './handlers/get_projects';
import { updateProject } from './handlers/update_project';
import { createCategory } from './handlers/create_category';
import { getCategories } from './handlers/get_categories';
import { createExpense } from './handlers/create_expense';
import { getExpenses } from './handlers/get_expenses';
import { updateExpense } from './handlers/update_expense';
import { deleteExpense } from './handlers/delete_expense';
import { createMonthlyBudget } from './handlers/create_monthly_budget';
import { getMonthlyBudgets } from './handlers/get_monthly_budgets';
import { getAnalytics } from './handlers/get_analytics';
import { exportData } from './handlers/export_data';
import { importData } from './handlers/import_data';
import { searchExpenses } from './handlers/search_expenses';
import { getDashboardSummary } from './handlers/get_dashboard_summary';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // User management
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),

  getUsers: publicProcedure
    .query(() => getUsers()),

  // Project management
  createProject: publicProcedure
    .input(createProjectInputSchema)
    .mutation(({ input }) => createProject(input)),

  getProjects: publicProcedure
    .input(z.object({ userId: z.number().optional() }))
    .query(({ input }) => getProjects(input.userId)),

  updateProject: publicProcedure
    .input(updateProjectInputSchema)
    .mutation(({ input }) => updateProject(input)),

  // Category management
  createCategory: publicProcedure
    .input(createCategoryInputSchema)
    .mutation(({ input }) => createCategory(input)),

  getCategories: publicProcedure
    .input(z.object({ projectId: z.number().optional() }))
    .query(({ input }) => getCategories(input.projectId)),

  // Expense management
  createExpense: publicProcedure
    .input(createExpenseInputSchema)
    .mutation(({ input }) => createExpense(input)),

  getExpenses: publicProcedure
    .input(expenseFilterSchema)
    .query(({ input }) => getExpenses(input)),

  updateExpense: publicProcedure
    .input(updateExpenseInputSchema)
    .mutation(({ input }) => updateExpense(input)),

  deleteExpense: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteExpense(input.id)),

  searchExpenses: publicProcedure
    .input(z.object({ 
      searchTerm: z.string().min(1), 
      projectId: z.number().optional(), 
      limit: z.number().int().positive().default(20)
    }))
    .query(({ input }) => searchExpenses(input.searchTerm, input.projectId, input.limit)),

  // Monthly budget management
  createMonthlyBudget: publicProcedure
    .input(createMonthlyBudgetInputSchema)
    .mutation(({ input }) => createMonthlyBudget(input)),

  getMonthlyBudgets: publicProcedure
    .input(z.object({ 
      projectId: z.number(), 
      year: z.number().int().optional() 
    }))
    .query(({ input }) => getMonthlyBudgets(input.projectId, input.year)),

  // Analytics and reporting
  getAnalytics: publicProcedure
    .input(analyticsQuerySchema)
    .query(({ input }) => getAnalytics(input)),

  getDashboardSummary: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(({ input }) => getDashboardSummary(input.userId)),

  // Data export/import
  exportData: publicProcedure
    .input(exportOptionsSchema)
    .mutation(({ input }) => exportData(input)),

  importData: publicProcedure
    .input(importDataSchema)
    .mutation(({ input }) => importData(input)),

  // Utility endpoints for frontend state management
  getExpenseTypes: publicProcedure
    .query(() => {
      return [
        { value: 'advance', label: 'Advance Payment' },
        { value: 'purchase', label: 'Material Purchase' },
        { value: 'work_service', label: 'Work Service' }
      ];
    }),

  getCurrencies: publicProcedure
    .query(() => {
      return [
        { value: 'USD', label: 'US Dollar', symbol: '$' },
        { value: 'EUR', label: 'Euro', symbol: '€' },
        { value: 'GBP', label: 'British Pound', symbol: '£' },
        { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
        { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' }
      ];
    }),

  getLanguages: publicProcedure
    .query(() => {
      return [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Spanish' },
        { value: 'fr', label: 'French' },
        { value: 'de', label: 'German' },
        { value: 'it', label: 'Italian' }
      ];
    }),

  getExpenseStatuses: publicProcedure
    .query(() => {
      return [
        { value: 'pending', label: 'Pending', color: '#FFA500' },
        { value: 'approved', label: 'Approved', color: '#4CAF50' },
        { value: 'rejected', label: 'Rejected', color: '#F44336' },
        { value: 'completed', label: 'Completed', color: '#2196F3' }
      ];
    })
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`🚀 Multi-language Renovation Expense Management TRPC server listening at port: ${port}`);
  console.log(`📊 Features: Analytics, Multi-currency, Real-time tracking, Export/Import, Search & Filter`);
}

start();