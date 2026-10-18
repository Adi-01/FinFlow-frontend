"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constants";
import { getClientId } from "@/lib/sync/clientId";

type SyncScope =
  | "CATEGORIES"
  | "PAYMENT_METHODS"
  | "ALLOWANCE"
  | "INCOME"
  | "EXPENSES"
  | "TRANSACTIONS"
  | "PROFILE"
  | "REFLECT";

interface SyncEventPayload {
  type: "CONNECTED" | "INVALIDATE";
  scope?: SyncScope;
  originClientId?: string;
  timestamp?: number;
  entityId?: string;
  status?: "GENERATING" | "CHATTING" | "COMPLETED" | "IDLE";
}

const IDLE_DISCONNECT_MS = 5 * 60 * 1000; // 5 minutes inactivity timeout to permit serverless scale-to-zero

/**
 * Real-time SSE synchronization hook with idle and visibility awareness.
 * Connects to Next.js BFF proxy `/api/sync` and invalidates TanStack Query keys.
 * Disconnects when the tab is hidden or idle to permit Railway scale-to-zero.
 */
export function useSyncStream() {
  const queryClient = useQueryClient();
  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    if (typeof window === "undefined") return;

    let eventSource: EventSource | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;
    let idleTimer: NodeJS.Timeout | null = null;
    let reconnectDelay = 1000;
    let isCleanedUp = false;

    const scheduleInvalidate = (key: readonly unknown[]) => {
      const serializedKey = JSON.stringify(key);
      const existing = debounceTimersRef.current.get(serializedKey);
      if (existing) {
        clearTimeout(existing);
      }

      const timer = setTimeout(() => {
        debounceTimersRef.current.delete(serializedKey);
        queryClient.invalidateQueries({ queryKey: key });
      }, 150);

      debounceTimersRef.current.set(serializedKey, timer);
    };

    const handleSyncEvent = (event: SyncEventPayload) => {
      if (event.type !== "INVALIDATE" || !event.scope) {
        return;
      }

      const currentClientId = getClientId();
      // Exclude self if originClientId matches current tab
      if (event.originClientId && event.originClientId === currentClientId) {
        return;
      }

      switch (event.scope) {
        case "CATEGORIES":
          scheduleInvalidate(QUERY_KEYS.categories.all);
          scheduleInvalidate(QUERY_KEYS.dashboard.all);
          break;

        case "PAYMENT_METHODS":
          scheduleInvalidate(QUERY_KEYS.paymentMethods.all);
          scheduleInvalidate(QUERY_KEYS.dashboard.all);
          break;

        case "ALLOWANCE":
          scheduleInvalidate(QUERY_KEYS.allowance.all);
          scheduleInvalidate(QUERY_KEYS.dashboard.all);
          scheduleInvalidate(QUERY_KEYS.reflect.all);
          break;

        case "INCOME":
          scheduleInvalidate(QUERY_KEYS.income.all);
          scheduleInvalidate(QUERY_KEYS.transactions.all);
          scheduleInvalidate(QUERY_KEYS.dashboard.all);
          scheduleInvalidate(QUERY_KEYS.allowance.all);
          scheduleInvalidate(QUERY_KEYS.reflect.all);
          break;

        case "EXPENSES":
          scheduleInvalidate(QUERY_KEYS.expenses.all);
          scheduleInvalidate(QUERY_KEYS.transactions.all);
          scheduleInvalidate(QUERY_KEYS.dashboard.all);
          scheduleInvalidate(QUERY_KEYS.allowance.all);
          scheduleInvalidate(QUERY_KEYS.reflect.all);
          break;

        case "TRANSACTIONS":
          scheduleInvalidate(QUERY_KEYS.transactions.all);
          scheduleInvalidate(QUERY_KEYS.dashboard.all);
          scheduleInvalidate(QUERY_KEYS.allowance.all);
          scheduleInvalidate(QUERY_KEYS.reflect.all);
          break;

        case "PROFILE":
          scheduleInvalidate(QUERY_KEYS.profile.me);
          scheduleInvalidate(QUERY_KEYS.auth.me);
          scheduleInvalidate(QUERY_KEYS.profile.sessions);
          scheduleInvalidate(QUERY_KEYS.user.settings);
          scheduleInvalidate(QUERY_KEYS.dashboard.all);
          break;

        case "REFLECT":
          if (event.status === "GENERATING") {
            queryClient.setQueryData(QUERY_KEYS.reflect.generating, true);
          } else if (event.status === "CHATTING") {
            queryClient.setQueryData(QUERY_KEYS.reflect.chatting, true);
          } else if (event.status === "COMPLETED" || event.status === "IDLE") {
            queryClient.setQueryData(QUERY_KEYS.reflect.generating, false);
            queryClient.setQueryData(QUERY_KEYS.reflect.chatting, false);
            scheduleInvalidate(QUERY_KEYS.reflect.all);
          } else {
            scheduleInvalidate(QUERY_KEYS.reflect.all);
          }
          break;

        default:
          break;
      }
    };

    const disconnect = () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };

    const connect = () => {
      if (isCleanedUp || eventSource) return;
      if (document.visibilityState === "hidden") return;

      const clientId = getClientId();
      const url = `/api/sync?clientId=${encodeURIComponent(clientId)}`;

      eventSource = new EventSource(url);

      eventSource.onopen = () => {
        reconnectDelay = 1000;
      };

      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as SyncEventPayload;
          handleSyncEvent(data);
        } catch {
          // Ignore malformed heartbeats or messages
        }
      };

      eventSource.onerror = () => {
        disconnect();

        if (!isCleanedUp && document.visibilityState === "visible") {
          reconnectTimer = setTimeout(() => {
            reconnectDelay = Math.min(reconnectDelay * 1.5, 15000);
            connect();
          }, reconnectDelay);
        }
      };
    };

    const resetIdleTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);

      // Reconnect if returning from idle state in active tab
      if (!eventSource && document.visibilityState === "visible" && !isCleanedUp) {
        connect();
        queryClient.invalidateQueries();
      }

      idleTimer = setTimeout(() => {
        disconnect();
      }, IDLE_DISCONNECT_MS);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        disconnect();
      } else if (document.visibilityState === "visible") {
        resetIdleTimer();
        connect();
        queryClient.invalidateQueries();
      }
    };

    const handleBeforeUnload = () => {
      disconnect();
    };

    // Event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("mousemove", resetIdleTimer, { passive: true });
    window.addEventListener("keydown", resetIdleTimer, { passive: true });
    window.addEventListener("touchstart", resetIdleTimer, { passive: true });

    // Initial connection
    connect();
    resetIdleTimer();

    return () => {
      isCleanedUp = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
      window.removeEventListener("touchstart", resetIdleTimer);

      if (idleTimer) clearTimeout(idleTimer);
      disconnect();

      for (const timer of debounceTimersRef.current.values()) {
        clearTimeout(timer);
      }
      debounceTimersRef.current.clear();
    };
  }, [queryClient]);
}
