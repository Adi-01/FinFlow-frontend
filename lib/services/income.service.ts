import { serverActionFetch } from "@/lib/api/fetchers";
import { buildIncomeQueryParams } from "@/lib/utils";
import type { PaginatedResponse, Income, IncomeFilters } from "@/types/api";

export async function fetchIncomes(
  filters: IncomeFilters
): Promise<PaginatedResponse<Income> | null> {
  const queryParams = buildIncomeQueryParams(filters);
  const queryString = queryParams.toString();
  const endpoint = `/income${queryString ? `?${queryString}` : ""}`;
  
  const res = await serverActionFetch<PaginatedResponse<Income>>(endpoint);
  if (!res.success || !res.data) {
    throw new Error(res.message || "Failed to fetch incomes");
  }
  return res.data;
}
