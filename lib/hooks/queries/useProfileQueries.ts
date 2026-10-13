import { useQuery } from "@tanstack/react-query";
import { reactQueryFetch } from "@/lib/api/clientFetchers";
import { getSessionsAction } from "@/app/actions/profile";
import { QUERY_KEYS } from "@/lib/constants";
import type { UserProfile, GetSessionsResponse } from "@/types/api";

export function useProfile() {
  return useQuery<UserProfile>({
    queryKey: QUERY_KEYS.profile.me,
    queryFn: () => {
      return reactQueryFetch<UserProfile>("/api/profile");
    },
  });
}

export function useProfileSessionsQuery() {
  return useQuery<GetSessionsResponse>({
    queryKey: QUERY_KEYS.profile.sessions,
    queryFn: async () => {
      const res = await getSessionsAction();
      if (!res || !res.success || !res.data) {
        throw new Error(res?.message || "Failed to fetch active sessions");
      }
      return res.data;
    },
  });
}

