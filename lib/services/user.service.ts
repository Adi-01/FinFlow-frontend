import { cache } from "react";
import { serverActionFetch } from "@/lib/api/fetchers";
import type { User } from "@/types/api";

export const fetchCurrentUser = cache(async (): Promise<User | null> => {
  const res = await serverActionFetch<User>("/users/me");
  if (!res.success || !res.data) {
    throw new Error(res.message || "Failed to fetch user");
  }
  return res.data;
});
