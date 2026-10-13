import { useQuery } from "@tanstack/react-query";
import { reactQueryFetch } from "@/lib/api/clientFetchers";
import { QUERY_KEYS } from "@/lib/constants";
import type { GetReflectResponse } from "@/types/api";

export function useReflectReport(year: number, month: number) {
  return useQuery<GetReflectResponse>({
    queryKey: QUERY_KEYS.reflect.byMonth(year, month),
    queryFn: async () => {
      return reactQueryFetch<GetReflectResponse>(
        `/api/reflect?year=${year}&month=${month}`,
      );
    },
  });
}
