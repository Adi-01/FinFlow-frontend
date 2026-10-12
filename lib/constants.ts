/**
 * Centralized Query Key Factory
 * Required by frontend-architecture rules.
 * All React Query hooks, prefetch calls, and invalidations MUST derive keys strictly from QUERY_KEYS.
 */

export const QUERY_KEYS = {
  auth: {
    me: ["auth", "me"] as const,
  },
  profile: {
    me: ["profile", "me"] as const,
    sessions: ["profile", "sessions"] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    byMonth: (year: number, month: number) =>
      [...QUERY_KEYS.dashboard.all, year, month] as const,
  },
  income: {
    all: ["income"] as const,
    list: (filters?: Record<string, unknown> | object) =>
      [...QUERY_KEYS.income.all, "list", filters] as const,
  },
  expenses: {
    all: ["expenses"] as const,
    list: (filters?: Record<string, unknown> | object) =>
      [...QUERY_KEYS.expenses.all, "list", filters] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    list: (filters?: Record<string, unknown> | object) =>
      [...QUERY_KEYS.transactions.all, "list", filters] as const,
  },

  user: {
    settings: ["user", "settings"] as const,
  },
  allowance: {
    all: ["allowance"] as const,
    byMonth: (year: number, month: number) =>
      [...QUERY_KEYS.allowance.all, year, month] as const,
    summary: (year: number, month: number) =>
      [...QUERY_KEYS.allowance.all, "summary", year, month] as const,
  },
  categories: {
    all: ["categories"] as const,
    byType: (type?: string) => [...QUERY_KEYS.categories.all, type] as const,
  },
  paymentMethods: {
    all: ["paymentMethods"] as const,
  },
  reflect: {
    all: ["reflect"] as const,
    byMonth: (year: number, month: number) =>
      [...QUERY_KEYS.reflect.all, year, month] as const,
  },
} as const;

export const BACKEND_URL =
  process.env.BACKEND_URL || "http://localhost:5000/api/v1";
