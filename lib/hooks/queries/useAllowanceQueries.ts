import { useQuery } from "@tanstack/react-query";
import { reactQueryFetch } from "@/lib/api/clientFetchers";
import { QUERY_KEYS } from "@/lib/constants";
import type { AllowanceSummary } from "@/types/api";

export function useAllowanceSummary(year: number, month: number) {
  return useQuery<AllowanceSummary>({
    queryKey: QUERY_KEYS.allowance.summary(year, month),
    queryFn: async () => {
      return reactQueryFetch<AllowanceSummary>(
        `/api/allowance/summary?year=${year}&month=${month}`
      );
    },
    enabled: Boolean(year && month),
  });
}
