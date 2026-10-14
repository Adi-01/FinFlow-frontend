import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import { getClientId } from "@/lib/sync/clientId";
import { updateAllowanceAction } from "@/app/actions/dashboard";
import type { DashboardMetrics, AllowanceSummary } from "@/types/api";

export function useUpdateAllowance(
  year: number,
  month: number,
  onSuccessCallback?: () => void
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      const res = await updateAllowanceAction(
        { year, month, amount },
        getClientId(),
      );
      if (!res || !res.success || !res.data) {
        throw new Error(res?.message || "Failed to update allowance");
      }
      return res.data;
    },
    onMutate: async (amount: number) => {
      // 1. Cancel in-flight queries
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.dashboard.byMonth(year, month),
      });
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.allowance.all,
      });

      // 2. Snapshot previous state
      const previousDashboard = queryClient.getQueryData<DashboardMetrics>(
        QUERY_KEYS.dashboard.byMonth(year, month)
      );
      const previousAllowanceSummary = queryClient.getQueryData<AllowanceSummary>(
        QUERY_KEYS.allowance.summary(year, month)
      );

      // 3. Optimistically update DashboardMetrics
      queryClient.setQueryData<DashboardMetrics>(
        QUERY_KEYS.dashboard.byMonth(year, month),
        (old) => {
          if (!old) return old;
          const currentAllowance = old.summary.startingAllowance || 0;
          const diff = amount - currentAllowance;
          return {
            ...old,
            allowance: old.allowance
              ? { ...old.allowance, amount }
              : {
                  id: `temp-allowance-${Date.now()}`,
                  userId: "current-user",
                  year,
                  month,
                  amount,
                  isRollover: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
            needsAllowancePrompt: false,
            summary: {
              ...old.summary,
              startingAllowance: amount,
              remainingBalance: old.summary.remainingBalance + diff,
            },
          };
        }
      );

      // 4. Optimistically update AllowanceSummary
      queryClient.setQueryData<AllowanceSummary>(
        QUERY_KEYS.allowance.summary(year, month),
        (old) => {
          if (!old) return old;
          const currentAllowance = old.startingAllowance || 0;
          const diff = amount - currentAllowance;
          return {
            ...old,
            startingAllowance: amount,
            remainingBalance: old.remainingBalance + diff,
            needsAllowancePrompt: false,
          };
        }
      );

      return { previousDashboard, previousAllowanceSummary };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousDashboard) {
        queryClient.setQueryData(
          QUERY_KEYS.dashboard.byMonth(year, month),
          context.previousDashboard
        );
      }
      if (context?.previousAllowanceSummary) {
        queryClient.setQueryData(
          QUERY_KEYS.allowance.summary(year, month),
          context.previousAllowanceSummary
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.dashboard.all,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.allowance.all,
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reflect.all,
      });
    },
    onSuccess: () => {
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
  });
}

