import { useSuspenseQuery } from "@tanstack/react-query";
import { reactQueryFetch } from "@/lib/api/clientFetchers";
import { QUERY_KEYS } from "@/lib/constants";
import { buildIncomeQueryParams } from "@/lib/utils";
import type { PaginatedResponse, Income, IncomeFilters } from "@/types/api";

export function useIncomes(filters: IncomeFilters) {
  return useSuspenseQuery<PaginatedResponse<Income>>({
    queryKey: QUERY_KEYS.income.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const queryParams = buildIncomeQueryParams(filters);
      const queryString = queryParams.toString();
      const endpoint = `/api/income${queryString ? `?${queryString}` : ""}`;
      return reactQueryFetch<PaginatedResponse<Income>>(endpoint);
    },
  });
}
