import { serverActionFetch } from "@/lib/api/fetchers";
import { buildExpenseQueryParams } from "@/lib/utils";
import type { PaginatedResponse, Expense, ExpenseFilters } from "@/types/api";

export async function fetchExpenses(
  filters: ExpenseFilters
): Promise<PaginatedResponse<Expense> | null> {
  const queryParams = buildExpenseQueryParams(filters);
  const queryString = queryParams.toString();
  const endpoint = `/expenses${queryString ? `?${queryString}` : ""}`;
  
  const res = await serverActionFetch<PaginatedResponse<Expense>>(endpoint);
  if (!res.success || !res.data) {
    throw new Error(res.message || "Failed to fetch expenses");
  }
  return res.data;
}
