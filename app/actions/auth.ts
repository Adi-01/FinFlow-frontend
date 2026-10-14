"use server";

import { serverActionFetch } from "@/lib/api/fetchers";
import { setSessionCookie, removeSessionCookie } from "@/lib/auth";
import type { AuthResponse } from "@/types/api";

export interface LoginPayload {
  email: string;
  password: string;
  userAgent?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  userAgent?: string;
}

export async function loginAction(payload: LoginPayload) {
  const customHeaders: Record<string, string> = {};
  if (payload.userAgent) {
    customHeaders["x-client-device"] = payload.userAgent;
    customHeaders["x-forwarded-user-agent"] = payload.userAgent;
  }

  const res = await serverActionFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: customHeaders,
  });

  if (res.success && res.data?.sessionToken) {
    await setSessionCookie(res.data.sessionToken);
    return {
      success: true,
      message: res.message || "Logged in successfully.",
      user: res.data.user,
    };
  }

  return {
    success: false,
    message: res.message || "Failed to log in.",
  };
}

export async function registerAction(payload: RegisterPayload) {
  const customHeaders: Record<string, string> = {};
  if (payload.userAgent) {
    customHeaders["x-client-device"] = payload.userAgent;
    customHeaders["x-forwarded-user-agent"] = payload.userAgent;
  }

  const res = await serverActionFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: customHeaders,
  });

  if (res.success && res.data?.sessionToken) {
    await setSessionCookie(res.data.sessionToken);
    return {
      success: true,
      message: res.message || "Account created successfully.",
      user: res.data.user,
    };
  }

  return {
    success: false,
    message: res.message || "Failed to register account.",
  };
}

export async function logoutAction() {
  await removeSessionCookie();

  return { success: true };
}
