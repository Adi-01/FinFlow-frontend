import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import { getClientId } from "@/lib/sync/clientId";
import {
  createPaymentMethodAction,
  deletePaymentMethodAction,
} from "@/app/actions/paymentMethod";
import type {
  CreatePaymentMethodPayload,
  GetPaymentMethodsResponse,
  UserPaymentMethod,
} from "@/types/api";

export function useCreatePaymentMethod(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePaymentMethodPayload) => {
      const res = await createPaymentMethodAction(payload, getClientId());
      if (!res || !res.success || !res.data) {
        throw new Error(res?.message || "Failed to create custom payment method");
      }
      return res.data;
    },
    onMutate: async (payload: CreatePaymentMethodPayload) => {
      // 1. Cancel in-flight payment method queries
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.paymentMethods.all });

      // 2. Snapshot previous state across all payment method queries
      const previousPaymentMethods = queryClient.getQueriesData<GetPaymentMethodsResponse>({
        queryKey: QUERY_KEYS.paymentMethods.all,
      });

      const optimisticPaymentMethod: UserPaymentMethod = {
        id: `temp-pm-${Date.now()}`,
        userId: "current-user",
        name: payload.name,
        icon: payload.icon,
        isSystem: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 3. Optimistically append new custom payment method and update quota counts
      queryClient.setQueriesData<GetPaymentMethodsResponse>(
        { queryKey: QUERY_KEYS.paymentMethods.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            custom: [...old.custom, optimisticPaymentMethod],
            quota: {
              ...old.quota,
              customCount: old.quota.customCount + 1,
            },
          };
        }
      );

      return { previousPaymentMethods };
    },
    onError: (_err, _variables, context) => {
      context?.previousPaymentMethods?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.paymentMethods.all });
    },
    onSuccess: () => {
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
  });
}

export function useDeletePaymentMethod(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deletePaymentMethodAction(id, getClientId());
      if (!res || !res.success) {
        throw new Error(res?.message || "Failed to delete payment method");
      }
      return res.data;
    },
    onMutate: async (id: string) => {
      // 1. Cancel in-flight payment method queries
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.paymentMethods.all });

      // 2. Snapshot previous state across all payment method queries
      const previousPaymentMethods = queryClient.getQueriesData<GetPaymentMethodsResponse>({
        queryKey: QUERY_KEYS.paymentMethods.all,
      });

      // 3. Optimistically remove payment method and decrement quota counts
      queryClient.setQueriesData<GetPaymentMethodsResponse>(
        { queryKey: QUERY_KEYS.paymentMethods.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            custom: old.custom.filter((pm) => pm.id !== id),
            quota: {
              ...old.quota,
              customCount: Math.max(0, old.quota.customCount - 1),
            },
          };
        }
      );

      return { previousPaymentMethods };
    },
    onError: (_err, _variables, context) => {
      context?.previousPaymentMethods?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.paymentMethods.all });
    },
    onSuccess: () => {
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
  });
}

