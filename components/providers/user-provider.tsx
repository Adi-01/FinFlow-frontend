"use client";

import React, {
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { User } from "@/types/api";
import { QUERY_KEYS } from "@/lib/constants";
import { reactQueryFetch } from "@/lib/api/clientFetchers";

interface UserContextValue {
  user: User | null;
  isLoading: boolean;
  currencySymbol: string;
  isOnboarding: boolean;
  setUser: Dispatch<SetStateAction<User | null>>; // Kept for backwards compatibility
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: QUERY_KEYS.auth.me,
    queryFn: async () => {
      try {
        const res = await reactQueryFetch<User>("/api/users/me");
        return res || null;
      } catch (err) {
        return null;
      }
    },
    initialData: initialUser,
    staleTime: 1000 * 60 * 5, // 5 minutes for session security
    initialDataUpdatedAt: () => (initialUser ? Date.now() : undefined),
  });

  // Polyfill for manual updates to user session
  const setUser: Dispatch<SetStateAction<User | null>> = (updater) => {
    queryClient.setQueryData<User | null>(QUERY_KEYS.auth.me, (old) => {
      return typeof updater === "function" ? updater(old ?? null) : updater;
    });
  };

  const currencySymbol = user?.settings?.currencySymbol || "$";
  const isOnboarding = user?.isOnboarding ?? false;

  return (
    <UserContext.Provider
      value={{
        user: user || null,
        isLoading,
        setUser,
        currencySymbol,
        isOnboarding,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}
