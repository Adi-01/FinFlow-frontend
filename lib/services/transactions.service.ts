import { serverActionFetch } from "@/lib/api/fetchers";
import { buildTransactionQueryParams } from "@/lib/utils";
import type { PaginatedResponse, UnifiedTransaction, TransactionFilters } from "@/types/api";

export { buildTransactionQueryParams };

export async function fetchTransactions(

  filters: TransactionFilters
): Promise<PaginatedResponse<UnifiedTransaction> | null> {
  const queryParams = buildTransactionQueryParams(filters);
  const queryString = queryParams.toString();
  const endpoint = `/transactions${queryString ? `?${queryString}` : ""}`;

  const res = await serverActionFetch<PaginatedResponse<UnifiedTransaction>>(endpoint);
  if (!res.success || !res.data) {
    throw new Error(res.message || "Failed to fetch transactions");
  }
  return res.data;
}

