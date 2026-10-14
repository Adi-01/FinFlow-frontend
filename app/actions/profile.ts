"use server";

import { serverActionFetch } from "@/lib/api/fetchers";
import { BACKEND_URL } from "@/lib/constants";
import { getSessionCookie, removeSessionCookie } from "@/lib/auth";
import type {
  UserProfile,
  UpdateProfilePayload,
  ApiResponse,
  ChangePasswordPayload,
  DeleteAccountPayload,
} from "@/types/api";

import { headers as nextHeaders } from "next/headers";

export async function updateProfileAction(
  payload: UpdateProfilePayload,
  clientId?: string,
): Promise<ApiResponse<UserProfile> | null> {
  return serverActionFetch<UserProfile>("/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
    clientId,
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

export async function revokeSessionAction(
  sessionId: string,
  clientId?: string,
): Promise<ApiResponse<{ revokedSessionId: string; wasCurrent: boolean }> | null> {
  const res = await serverActionFetch<{ revokedSessionId: string; wasCurrent: boolean }>(
    `/profile/account/sessions/${sessionId}`,
    {
      method: "DELETE",
      clientId,
    },
  );

  if (res?.data?.wasCurrent) {
    await removeSessionCookie();
  }

  return res;
}

export async function revokeAllOtherSessionsAction(
  clientId?: string,
): Promise<ApiResponse<{ revokedCount: number }> | null> {
  return serverActionFetch<{ revokedCount: number }>("/profile/account/sessions", {
    method: "DELETE",
    clientId,
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
  clientId?: string,
): Promise<ApiResponse<UserProfile> | null> {
  let token: string | undefined;
  try {
    token = await getSessionCookie();
  } catch {}

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (clientId) {
    headers["x-client-id"] = clientId;
  }

  try {
    const reqHeaders = await nextHeaders();
    const ua = reqHeaders.get("user-agent");
    if (ua && !headers["x-forwarded-user-agent"]) {
      headers["x-forwarded-user-agent"] = ua;
    }
    const incomingCid = reqHeaders.get("x-client-id");
    if (incomingCid && !headers["x-client-id"]) {
      headers["x-client-id"] = incomingCid;
    }
  } catch {}

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

export async function removeAvatarAction(
  clientId?: string,
): Promise<ApiResponse<UserProfile> | null> {
  return serverActionFetch<UserProfile>("/profile/avatar", {
    method: "DELETE",
    clientId,
  });
}


