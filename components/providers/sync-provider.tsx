"use client";

import type { ReactNode } from "react";
import { useSyncStream } from "@/lib/hooks/useSyncStream";

interface SyncProviderProps {
  children: ReactNode;
}

export function SyncProvider({ children }: SyncProviderProps) {
  useSyncStream();
  return <>{children}</>;
}

