import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import { getClientId } from "@/lib/sync/clientId";
import {
  generateReflectReportAction,
  chatReflectAction,
} from "@/app/actions/reflect";
import type { GenerateReflectPayload, ChatReflectPayload } from "@/types/api";

export function useGenerateReflect(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: GenerateReflectPayload) => {
      const res = await generateReflectReportAction(payload, getClientId());
      if (!res || !res.success || !res.data) {
        throw new Error(res?.message || "Failed to generate reflection report");
      }
      return res.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.reflect.byMonth(data.year, data.month),
        });
      }
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reflect.all,
      });
    },
  });
}

export function useChatReflect() {
  return useMutation({
    mutationFn: async (payload: ChatReflectPayload) => {
      const res = await chatReflectAction(payload, getClientId());
      if (!res || !res.success) {
        throw new Error(res?.message || "Failed to send message to AI");
      }
      return res.data;
    },
  });
}
