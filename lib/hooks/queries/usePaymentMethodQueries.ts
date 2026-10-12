import { useQuery } from "@tanstack/react-query";
import { reactQueryFetch } from "@/lib/api/clientFetchers";
import { QUERY_KEYS } from "@/lib/constants";
import type { GetPaymentMethodsResponse } from "@/types/api";

export function usePaymentMethods(options?: { enabled?: boolean }) {
  return useQuery<GetPaymentMethodsResponse>({
    queryKey: QUERY_KEYS.paymentMethods.all,
    queryFn: async () => {
      return reactQueryFetch<GetPaymentMethodsResponse>("/api/payment-methods");
    },
    ...options,
  });
}
