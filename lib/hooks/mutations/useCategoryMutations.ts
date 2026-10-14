import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import { getClientId } from "@/lib/sync/clientId";
import {
  createCategoryAction,
  deleteCategoryAction,
} from "@/app/actions/category";
import type {
  CreateCategoryPayload,
  GetCategoriesResponse,
  UserCategory,
} from "@/types/api";

export function useCreateCategory(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCategoryPayload) => {
      const res = await createCategoryAction(payload, getClientId());
      if (!res || !res.success || !res.data) {
        throw new Error(res?.message || "Failed to create custom category");
      }
      return res.data;
    },
    onMutate: async (payload: CreateCategoryPayload) => {
      // 1. Cancel in-flight category queries
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.categories.all });

      // 2. Snapshot previous state across all category query variants
      const previousCategories = queryClient.getQueriesData<GetCategoriesResponse>({
        queryKey: QUERY_KEYS.categories.all,
      });

      const optimisticCategory: UserCategory = {
        id: `temp-cat-${Date.now()}`,
        userId: "current-user",
        name: payload.name,
        type: payload.type,
        icon: payload.icon,
        color: payload.color,
        isSystem: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 3. Optimistically append new custom category and update quota counts
      queryClient.setQueriesData<GetCategoriesResponse>(
        { queryKey: QUERY_KEYS.categories.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            custom: [...old.custom, optimisticCategory],
            quota: {
              ...old.quota,
              incomeCustomCount:
                payload.type === "INCOME"
                  ? old.quota.incomeCustomCount + 1
                  : old.quota.incomeCustomCount,
              expenseCustomCount:
                payload.type === "EXPENSE"
                  ? old.quota.expenseCustomCount + 1
                  : old.quota.expenseCustomCount,
            },
          };
        }
      );

      return { previousCategories };
    },
    onError: (_err, _variables, context) => {
      context?.previousCategories?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all });
    },
    onSuccess: () => {
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
  });
}

export function useDeleteCategory(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteCategoryAction(id, getClientId());
      if (!res || !res.success) {
        throw new Error(res?.message || "Failed to delete category");
      }
      return res.data;
    },
    onMutate: async (id: string) => {
      // 1. Cancel in-flight category queries
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.categories.all });

      // 2. Snapshot previous state across all category query variants
      const previousCategories = queryClient.getQueriesData<GetCategoriesResponse>({
        queryKey: QUERY_KEYS.categories.all,
      });

      // 3. Optimistically remove category and decrement quota counts
      queryClient.setQueriesData<GetCategoriesResponse>(
        { queryKey: QUERY_KEYS.categories.all },
        (old) => {
          if (!old) return old;
          const target = old.custom.find((c) => c.id === id);
          return {
            ...old,
            custom: old.custom.filter((c) => c.id !== id),
            quota: {
              ...old.quota,
              incomeCustomCount:
                target?.type === "INCOME"
                  ? Math.max(0, old.quota.incomeCustomCount - 1)
                  : old.quota.incomeCustomCount,
              expenseCustomCount:
                target?.type === "EXPENSE"
                  ? Math.max(0, old.quota.expenseCustomCount - 1)
                  : old.quota.expenseCustomCount,
            },
          };
        }
      );

      return { previousCategories };
    },
    onError: (_err, _variables, context) => {
      context?.previousCategories?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all });
    },
    onSuccess: () => {
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
  });
}

