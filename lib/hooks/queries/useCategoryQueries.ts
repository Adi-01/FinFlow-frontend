import { useQuery } from "@tanstack/react-query";
import { reactQueryFetch } from "@/lib/api/clientFetchers";
import { QUERY_KEYS } from "@/lib/constants";
import type { GetCategoriesResponse } from "@/types/api";

export function useCategories(
  type?: "INCOME" | "EXPENSE",
  options?: { enabled?: boolean }
) {
  return useQuery<GetCategoriesResponse>({
    queryKey: QUERY_KEYS.categories.byType(type),
    queryFn: async () => {
      const endpoint = `/api/categories${type ? `?type=${type}` : ""}`;
      return reactQueryFetch<GetCategoriesResponse>(endpoint);
    },
    ...options,
  });
}
