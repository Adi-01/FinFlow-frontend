import { serverActionFetch } from "@/lib/api/fetchers";
import type { UserProfile, GetSessionsResponse } from "@/types/api";

export async function fetchProfileServer(): Promise<UserProfile | null> {
  const res = await serverActionFetch<UserProfile>("/profile");
  if (!res.success || !res.data) {
    throw new Error(res.message || "Failed to fetch user profile");
  }
  return res.data;
}

export async function fetchSessionsServer(): Promise<GetSessionsResponse | null> {
  const res = await serverActionFetch<GetSessionsResponse>("/profile/account/sessions");
  if (!res.success || !res.data) {
    throw new Error(res.message || "Failed to fetch active sessions");
  }
  return res.data;
}

