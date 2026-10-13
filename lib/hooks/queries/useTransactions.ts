import { useQuery } from "@tanstack/react-query";
import { reactQueryFetch } from "@/lib/api/clientFetchers";
import { QUERY_KEYS } from "@/lib/constants";
import { buildTransactionQueryParams } from "@/lib/utils";

import type { PaginatedResponse, UnifiedTransaction, TransactionFilters } from "@/types/api";

export function useTransactions(filters: TransactionFilters) {
  return useQuery<PaginatedResponse<UnifiedTransaction>>({
    queryKey: QUERY_KEYS.transactions.list(filters),

    queryFn: async () => {
      const queryParams = buildTransactionQueryParams(filters);
      const queryString = queryParams.toString();
      const endpoint = `/api/transactions${queryString ? `?${queryString}` : ""}`;
      return reactQueryFetch<PaginatedResponse<UnifiedTransaction>>(endpoint);
    },
  });
}

