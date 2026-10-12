import { useSuspenseQuery } from "@tanstack/react-query";
import { reactQueryFetch } from "@/lib/api/clientFetchers";
import { QUERY_KEYS } from "@/lib/constants";
import type { DashboardMetrics } from "@/types/api";

export function useDashboardMetrics(year: number, month: number) {
  return useSuspenseQuery<DashboardMetrics>({
    queryKey: QUERY_KEYS.dashboard.byMonth(year, month),
    queryFn: async () => {
      return reactQueryFetch<DashboardMetrics>(`/api/dashboard?year=${year}&month=${month}`);
    },
  });
}
