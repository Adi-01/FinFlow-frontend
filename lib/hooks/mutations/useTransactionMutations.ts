import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import { addIncomeAction } from "@/app/actions/income";
import { addExpenseAction } from "@/app/actions/expenses";
import type {
  CreateIncomePayload,
  CreateExpensePayload,
  Income,
  Expense,
  UnifiedTransaction,
  PaginatedResponse,
  DashboardMetrics,
  AllowanceSummary,
  DailyAnalyticItem,
  CategoryBreakdownItem,
  SourceBreakdownItem,
} from "@/types/api";

function insertSortedByDateDesc<T extends { date: string }>(items: T[], newItem: T): T[] {
  const newTimestamp = new Date(newItem.date).getTime();
  const index = items.findIndex((item) => new Date(item.date).getTime() <= newTimestamp);
  if (index === -1) {
    return [...items, newItem];
  }
  return [...items.slice(0, index), newItem, ...items.slice(index)];
}

function parseYearMonthDay(dateStr: string): { year: number; month: number; day: number } {
  if (dateStr && dateStr.includes("-")) {
    const parts = dateStr.split("T")[0].split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return { year, month, day };
    }
  }
  const d = new Date(dateStr);
  const year = !isNaN(d.getFullYear()) ? d.getFullYear() : new Date().getFullYear();
  const month = !isNaN(d.getMonth()) ? d.getMonth() + 1 : new Date().getMonth() + 1;
  const day = !isNaN(d.getDate()) ? d.getDate() : new Date().getDate();
  return { year, month, day };
}

function updateDailyAnalytics(
  daily: DailyAnalyticItem[],
  day: number,
  type: "INCOME" | "EXPENSE",
  amount: number
): DailyAnalyticItem[] {
  if (!daily || daily.length === 0) return daily;
  const idx = daily.findIndex((item) => item.day === day);
  if (idx === -1) return daily;
  const updated = [...daily];
  const current = updated[idx];
  updated[idx] = {
    ...current,
    income: type === "INCOME" ? current.income + amount : current.income,
    expense: type === "EXPENSE" ? current.expense + amount : current.expense,
  };
  return updated;
}

function updateIncomeSourceBreakdown(
  breakdown: SourceBreakdownItem[],
  source: string,
  amount: number,
  newTotalIncome: number
): SourceBreakdownItem[] {
  const list = breakdown ? [...breakdown] : [];
  const idx = list.findIndex(
    (item) => item.source.toUpperCase() === source.toUpperCase()
  );
  if (idx >= 0) {
    list[idx] = {
      ...list[idx],
      amount: list[idx].amount + amount,
    };
  } else {
    list.push({
      source,
      amount,
      percentage: 0,
    });
  }

  return list.map((item) => ({
    ...item,
    percentage: newTotalIncome > 0 ? (item.amount / newTotalIncome) * 100 : 0,
  }));
}

function updateExpenseCategoryBreakdown(
  breakdown: CategoryBreakdownItem[],
  category: string,
  amount: number,
  newTotalExpense: number
): CategoryBreakdownItem[] {
  const list = breakdown ? [...breakdown] : [];
  const idx = list.findIndex(
    (item) => item.category.toUpperCase() === category.toUpperCase()
  );
  if (idx >= 0) {
    list[idx] = {
      ...list[idx],
      amount: list[idx].amount + amount,
    };
  } else {
    list.push({
      category,
      amount,
      percentage: 0,
    });
  }

  return list.map((item) => ({
    ...item,
    percentage: newTotalExpense > 0 ? (item.amount / newTotalExpense) * 100 : 0,
  }));
}

export function useAddIncome(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateIncomePayload) => {
      const res = await addIncomeAction(payload);
      if (!res || !res.success || !res.data) {
        throw new Error(res?.message || "Failed to add income");
      }
      return res.data;
    },
    onMutate: async (payload: CreateIncomePayload) => {
      // 1. Cancel in-flight queries across target domain
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.income.all });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.transactions.all });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.dashboard.all });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.allowance.all });

      // 2. Snapshot previous cache states
      const previousIncomes = queryClient.getQueriesData<PaginatedResponse<Income>>({
        queryKey: QUERY_KEYS.income.all,
      });
      const previousTransactions = queryClient.getQueriesData<PaginatedResponse<UnifiedTransaction>>({
        queryKey: QUERY_KEYS.transactions.all,
      });
      const previousDashboard = queryClient.getQueriesData<DashboardMetrics>({
        queryKey: QUERY_KEYS.dashboard.all,
      });
      const previousAllowance = queryClient.getQueriesData<AllowanceSummary>({
        queryKey: QUERY_KEYS.allowance.all,
      });

      const { year, month, day } = parseYearMonthDay(payload.date);
      const tempId = `temp-income-${Date.now()}`;
      const nowIso = new Date().toISOString();

      const optimisticIncome: Income = {
        id: tempId,
        userId: "current-user",
        year,
        month,
        amount: payload.amount,
        source: payload.source,
        date: payload.date,
        paymentMethod: payload.paymentMethod,
        notes: payload.notes || null,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      const optimisticTransaction: UnifiedTransaction = {
        id: tempId,
        type: "INCOME",
        amount: payload.amount,
        categoryOrSource: payload.source,
        date: payload.date,
        paymentMethod: payload.paymentMethod,
        descriptionOrNotes: payload.notes || null,
        createdAt: nowIso,
      };

      // 3. Optimistically update Income list queries
      queryClient.setQueriesData<PaginatedResponse<Income>>(
        { queryKey: QUERY_KEYS.income.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: insertSortedByDateDesc(old.items, optimisticIncome),
            pagination: {
              ...old.pagination,
              total: old.pagination.total + 1,
            },
          };
        }
      );

      // 4. Optimistically update Transactions list queries
      queryClient.setQueriesData<PaginatedResponse<UnifiedTransaction>>(
        { queryKey: QUERY_KEYS.transactions.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: insertSortedByDateDesc(old.items, optimisticTransaction),
            pagination: {
              ...old.pagination,
              total: old.pagination.total + 1,
            },
          };
        }
      );

      // 5. Optimistically update Dashboard metrics for matching month
      queryClient.setQueriesData<DashboardMetrics>(
        { queryKey: QUERY_KEYS.dashboard.all },
        (old) => {
          if (!old) return old;
          if (old.year === year && old.month === month) {
            const newTotalIncome = old.summary.totalIncome + payload.amount;
            return {
              ...old,
              summary: {
                ...old.summary,
                totalIncome: newTotalIncome,
                remainingBalance: old.summary.remainingBalance + payload.amount,
                extraIncome: old.summary.extraIncome + payload.amount,
                totalTransactions: old.summary.totalTransactions + 1,
              },
              dailyAnalytics: updateDailyAnalytics(
                old.dailyAnalytics,
                day,
                "INCOME",
                payload.amount
              ),
              incomeSourceBreakdown: updateIncomeSourceBreakdown(
                old.incomeSourceBreakdown,
                payload.source,
                payload.amount,
                newTotalIncome
              ),
            };
          }
          return old;
        }
      );

      // 6. Optimistically update Allowance summary for matching month
      queryClient.setQueriesData<AllowanceSummary>(
        { queryKey: QUERY_KEYS.allowance.all },
        (old) => {
          if (!old) return old;
          if (old.year === year && old.month === month) {
            return {
              ...old,
              totalIncome: old.totalIncome + payload.amount,
              remainingBalance: old.remainingBalance + payload.amount,
              extraIncome: old.extraIncome + payload.amount,
            };
          }
          return old;
        }
      );

      return {
        previousIncomes,
        previousTransactions,
        previousDashboard,
        previousAllowance,
      };
    },
    onError: (_err, _variables, context) => {
      // Rollback to snapshots
      context?.previousIncomes?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      context?.previousTransactions?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      context?.previousDashboard?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      context?.previousAllowance?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      // Invalidate full blast radius to ensure server consistency
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.income.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allowance.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reflect.all });
    },
    onSuccess: () => {
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
  });
}

export function useAddExpense(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateExpensePayload) => {
      const res = await addExpenseAction(payload);
      if (!res || !res.success || !res.data) {
        throw new Error(res?.message || "Failed to add expense");
      }
      return res.data;
    },
    onMutate: async (payload: CreateExpensePayload) => {
      // 1. Cancel in-flight queries across target domain
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.expenses.all });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.transactions.all });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.dashboard.all });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.allowance.all });

      // 2. Snapshot previous cache states
      const previousExpenses = queryClient.getQueriesData<PaginatedResponse<Expense>>({
        queryKey: QUERY_KEYS.expenses.all,
      });
      const previousTransactions = queryClient.getQueriesData<PaginatedResponse<UnifiedTransaction>>({
        queryKey: QUERY_KEYS.transactions.all,
      });
      const previousDashboard = queryClient.getQueriesData<DashboardMetrics>({
        queryKey: QUERY_KEYS.dashboard.all,
      });
      const previousAllowance = queryClient.getQueriesData<AllowanceSummary>({
        queryKey: QUERY_KEYS.allowance.all,
      });

      const { year, month, day } = parseYearMonthDay(payload.date);
      const tempId = `temp-expense-${Date.now()}`;
      const nowIso = new Date().toISOString();

      const optimisticExpense: Expense = {
        id: tempId,
        userId: "current-user",
        year,
        month,
        amount: payload.amount,
        category: payload.category,
        date: payload.date,
        paymentMethod: payload.paymentMethod,
        description: payload.description || null,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      const optimisticTransaction: UnifiedTransaction = {
        id: tempId,
        type: "EXPENSE",
        amount: payload.amount,
        categoryOrSource: payload.category,
        date: payload.date,
        paymentMethod: payload.paymentMethod,
        descriptionOrNotes: payload.description || null,
        createdAt: nowIso,
      };

      // 3. Optimistically update Expenses list queries
      queryClient.setQueriesData<PaginatedResponse<Expense>>(
        { queryKey: QUERY_KEYS.expenses.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: insertSortedByDateDesc(old.items, optimisticExpense),
            pagination: {
              ...old.pagination,
              total: old.pagination.total + 1,
            },
          };
        }
      );

      // 4. Optimistically update Transactions list queries
      queryClient.setQueriesData<PaginatedResponse<UnifiedTransaction>>(
        { queryKey: QUERY_KEYS.transactions.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: insertSortedByDateDesc(old.items, optimisticTransaction),
            pagination: {
              ...old.pagination,
              total: old.pagination.total + 1,
            },
          };
        }
      );

      // 5. Optimistically update Dashboard metrics for matching month
      queryClient.setQueriesData<DashboardMetrics>(
        { queryKey: QUERY_KEYS.dashboard.all },
        (old) => {
          if (!old) return old;
          if (old.year === year && old.month === month) {
            const newTotalExpense = old.summary.totalExpense + payload.amount;
            return {
              ...old,
              summary: {
                ...old.summary,
                totalExpense: newTotalExpense,
                remainingBalance: old.summary.remainingBalance - payload.amount,
                totalTransactions: old.summary.totalTransactions + 1,
              },
              dailyAnalytics: updateDailyAnalytics(
                old.dailyAnalytics,
                day,
                "EXPENSE",
                payload.amount
              ),
              expenseCategoryBreakdown: updateExpenseCategoryBreakdown(
                old.expenseCategoryBreakdown,
                payload.category,
                payload.amount,
                newTotalExpense
              ),
            };
          }
          return old;
        }
      );

      // 6. Optimistically update Allowance summary for matching month
      queryClient.setQueriesData<AllowanceSummary>(
        { queryKey: QUERY_KEYS.allowance.all },
        (old) => {
          if (!old) return old;
          if (old.year === year && old.month === month) {
            return {
              ...old,
              totalExpense: old.totalExpense + payload.amount,
              remainingBalance: old.remainingBalance - payload.amount,
            };
          }
          return old;
        }
      );

      return {
        previousExpenses,
        previousTransactions,
        previousDashboard,
        previousAllowance,
      };
    },
    onError: (_err, _variables, context) => {
      // Rollback to snapshots
      context?.previousExpenses?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      context?.previousTransactions?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      context?.previousDashboard?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      context?.previousAllowance?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      // Invalidate full blast radius to ensure server consistency
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.expenses.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allowance.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reflect.all });
    },
    onSuccess: () => {
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
  });
}

