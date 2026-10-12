"use server";

import { serverActionFetch } from "@/lib/api/fetchers";
import { BACKEND_URL } from "@/lib/constants";
import { getSessionCookie, removeSessionCookie } from "@/lib/auth";
import type {
  UserProfile,
  UpdateProfilePayload,
  ApiResponse,
  ChangePasswordPayload,
  GetSessionsResponse,
  DeleteAccountPayload,
} from "@/types/api";

export async function getProfileAction(): Promise<ApiResponse<UserProfile> | null> {
  return serverActionFetch<UserProfile>("/profile", {
    method: "GET",
  });
}

export async function updateProfileAction(
  payload: UpdateProfilePayload,
): Promise<ApiResponse<UserProfile> | null> {
  return serverActionFetch<UserProfile>("/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function changePasswordAction(
  payload: ChangePasswordPayload,
): Promise<ApiResponse<null> | null> {
  return serverActionFetch<null>("/profile/account/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getSessionsAction(): Promise<ApiResponse<GetSessionsResponse> | null> {
  return serverActionFetch<GetSessionsResponse>("/profile/account/sessions", {
    method: "GET",
  });
}

export async function revokeSessionAction(
  sessionId: string,
): Promise<ApiResponse<{ revokedSessionId: string; wasCurrent: boolean }> | null> {
  const res = await serverActionFetch<{ revokedSessionId: string; wasCurrent: boolean }>(
    `/profile/account/sessions/${sessionId}`,
    {
      method: "DELETE",
    },
  );

  if (res?.data?.wasCurrent) {
    await removeSessionCookie();
  }

  return res;
}

export async function revokeAllOtherSessionsAction(): Promise<ApiResponse<{ revokedCount: number }> | null> {
  return serverActionFetch<{ revokedCount: number }>("/profile/account/sessions", {
    method: "DELETE",
  });
}

export async function deleteAccountAction(
  payload: DeleteAccountPayload,
): Promise<ApiResponse<null> | null> {
  const res = await serverActionFetch<null>("/profile/account", {
    method: "DELETE",
    body: JSON.stringify(payload),
  });

  if (res?.success) {
    await removeSessionCookie();
  }

  return res;
}

export async function uploadAvatarAction(
  formData: FormData,
): Promise<ApiResponse<UserProfile> | null> {
  let token: string | undefined;
  try {
    token = await getSessionCookie();
  } catch {}

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BACKEND_URL}/profile/avatar`, {
    method: "PATCH",
    headers,
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      success: false,
      status: response.status,
      message: data?.error?.message || data?.message || "Failed to upload avatar.",
      data: null as any,
    };
  }

  return data;
}

export async function removeAvatarAction(): Promise<ApiResponse<UserProfile> | null> {
  return serverActionFetch<UserProfile>("/profile/avatar", {
    method: "DELETE",
  });
}


