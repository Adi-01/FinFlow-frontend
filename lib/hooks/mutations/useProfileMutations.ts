import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfileAction } from "@/app/actions/profile";
import { QUERY_KEYS } from "@/lib/constants";
import { getClientId } from "@/lib/sync/clientId";
import type {
  UpdateProfilePayload,
  UserProfile,
  User,
  UserSettings,
} from "@/types/api";

export function useUpdateProfile(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const res = await updateProfileAction(payload, getClientId());
      if (!res || !res.success || !res.data) {
        throw new Error(res?.message || "Failed to update profile");
      }
      return res.data;
    },
    onMutate: async (payload: UpdateProfilePayload) => {
      // 1. Cancel in-flight queries across target domain
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.profile.me });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.auth.me });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.user.settings });

      // 2. Snapshot previous cache data
      const previousProfile = queryClient.getQueryData<UserProfile>(
        QUERY_KEYS.profile.me
      );
      const previousAuth = queryClient.getQueryData<User | null>(
        QUERY_KEYS.auth.me
      );
      const previousSettings = queryClient.getQueryData<UserSettings>(
        QUERY_KEYS.user.settings
      );

      // Determine effective onboarding status
      const effectiveDob =
        payload.dob !== undefined
          ? payload.dob
          : previousProfile?.dob ?? previousAuth?.dob;

      const effectiveCurrency =
        payload.currencySymbol !== undefined
          ? payload.currencySymbol.trim()
          : previousProfile?.settings?.currencySymbol ??
            previousSettings?.currencySymbol ??
            "";

      const effectiveAllowance =
        payload.monthlyStartingAllowance !== undefined
          ? payload.monthlyStartingAllowance
          : previousProfile?.settings?.monthlyStartingAllowance ??
            previousSettings?.monthlyStartingAllowance ??
            0;

      let nextIsOnboarding =
        previousProfile?.isOnboarding ?? previousAuth?.isOnboarding ?? true;

      if (nextIsOnboarding) {
        if (effectiveDob && effectiveCurrency !== "" && effectiveAllowance > 0) {
          nextIsOnboarding = false;
        } else if (payload.isOnboarding !== undefined) {
          nextIsOnboarding = payload.isOnboarding;
        }
      } else {
        nextIsOnboarding = false;
      }

      // 3. Optimistically update profile cache
      queryClient.setQueryData<UserProfile>(QUERY_KEYS.profile.me, (old) => {
        if (!old) return old;
        return {
          ...old,
          name: payload.name !== undefined ? payload.name.trim() : old.name,
          dob: payload.dob !== undefined ? payload.dob : old.dob,
          isOnboarding: nextIsOnboarding,
          settings: {
            ...old.settings,
            currencySymbol:
              payload.currencySymbol !== undefined
                ? payload.currencySymbol
                : old.settings?.currencySymbol,
            monthlyStartingAllowance:
              payload.monthlyStartingAllowance !== undefined
                ? payload.monthlyStartingAllowance
                : old.settings?.monthlyStartingAllowance,
            defaultPaymentMethod:
              payload.defaultPaymentMethod !== undefined
                ? payload.defaultPaymentMethod
                : old.settings?.defaultPaymentMethod,
            selectedMonth:
              payload.selectedMonth !== undefined
                ? payload.selectedMonth
                : old.settings?.selectedMonth,
          },
        };
      });

      // 4. Optimistically update auth user context
      queryClient.setQueryData<User | null>(QUERY_KEYS.auth.me, (old) => {
        if (!old) return old;
        return {
          ...old,
          name: payload.name !== undefined ? payload.name.trim() : old.name,
          dob: payload.dob !== undefined ? payload.dob : old.dob,
          isOnboarding: nextIsOnboarding,
          settings: {
            ...old.settings,
            currencySymbol:
              payload.currencySymbol !== undefined
                ? payload.currencySymbol
                : old.settings?.currencySymbol || "",
            monthlyStartingAllowance:
              payload.monthlyStartingAllowance !== undefined
                ? payload.monthlyStartingAllowance
                : old.settings?.monthlyStartingAllowance,
            defaultPaymentMethod:
              payload.defaultPaymentMethod !== undefined
                ? payload.defaultPaymentMethod
                : old.settings?.defaultPaymentMethod,
            selectedMonth:
              payload.selectedMonth !== undefined
                ? payload.selectedMonth
                : old.settings?.selectedMonth,
          },
        };
      });

      // 5. Optimistically update user settings cache
      queryClient.setQueryData<UserSettings>(
        QUERY_KEYS.user.settings,
        (old) => {
          if (!old) return old;
          return {
            ...old,
            currencySymbol:
              payload.currencySymbol !== undefined
                ? payload.currencySymbol
                : old.currencySymbol,
          };
        }
      );

      return { previousProfile, previousAuth, previousSettings };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousProfile !== undefined) {
        queryClient.setQueryData(
          QUERY_KEYS.profile.me,
          context.previousProfile
        );
      }
      if (context?.previousAuth !== undefined) {
        queryClient.setQueryData(QUERY_KEYS.auth.me, context.previousAuth);
      }
      if (context?.previousSettings !== undefined) {
        queryClient.setQueryData(
          QUERY_KEYS.user.settings,
          context.previousSettings
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile.me });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.me });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.settings });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allowance.all });
    },
    onSuccess: () => {
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: async (payload: import("@/types/api").ChangePasswordPayload) => {
      const { changePasswordAction } = await import("@/app/actions/profile");
      const res = await changePasswordAction(payload);
      if (!res || !res.success) {
        throw new Error(res?.message || "Failed to change password");
      }
      return res;
    },
  });
}

export function useRevokeSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { revokeSessionAction } = await import("@/app/actions/profile");
      const res = await revokeSessionAction(sessionId, getClientId());
      if (!res || !res.success) {
        throw new Error(res?.message || "Failed to revoke session");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile.sessions });
    },
  });
}

export function useRevokeOtherSessionsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { revokeAllOtherSessionsAction } = await import("@/app/actions/profile");
      const res = await revokeAllOtherSessionsAction(getClientId());
      if (!res || !res.success) {
        throw new Error(res?.message || "Failed to revoke other sessions");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile.sessions });
    },
  });
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: import("@/types/api").DeleteAccountPayload) => {
      const { deleteAccountAction } = await import("@/app/actions/profile");
      const res = await deleteAccountAction(payload);
      if (!res || !res.success) {
        throw new Error(res?.message || "Failed to delete account");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/login";
    },
  });
}

export function useUploadAvatarMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { uploadAvatarAction } = await import("@/app/actions/profile");
      const res = await uploadAvatarAction(formData, getClientId());
      if (!res || !res.success || !res.data) {
        throw new Error(res?.message || "Failed to upload avatar");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile.me });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.me });
    },
  });
}

export function useRemoveAvatarMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { removeAvatarAction } = await import("@/app/actions/profile");
      const res = await removeAvatarAction(getClientId());
      if (!res || !res.success || !res.data) {
        throw new Error(res?.message || "Failed to remove avatar");
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile.me });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auth.me });
    },
  });
}


