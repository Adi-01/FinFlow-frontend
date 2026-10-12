import { useSuspenseQuery } from "@tanstack/react-query";
import { reactQueryFetch } from "@/lib/api/clientFetchers";
import { QUERY_KEYS } from "@/lib/constants";
import { buildExpenseQueryParams } from "@/lib/utils";
import type { PaginatedResponse, Expense, ExpenseFilters } from "@/types/api";

export function useExpenses(filters: ExpenseFilters) {
  return useSuspenseQuery<PaginatedResponse<Expense>>({
    queryKey: QUERY_KEYS.expenses.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const queryParams = buildExpenseQueryParams(filters);
      const queryString = queryParams.toString();
      const endpoint = `/api/expenses${queryString ? `?${queryString}` : ""}`;
      return reactQueryFetch<PaginatedResponse<Expense>>(endpoint);
    },
  });
}
