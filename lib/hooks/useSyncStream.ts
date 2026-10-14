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

/**
 * Real-time SSE synchronization hook.
 * Connects to Next.js BFF proxy `/api/sync` and invalidates TanStack Query keys
 * when other tabs or devices belonging to the user perform mutations.
 */
export function useSyncStream() {
  const queryClient = useQueryClient();
  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    if (typeof window === "undefined") return;

    let eventSource: EventSource | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;
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

    const connect = () => {
      if (isCleanedUp) return;

      const clientId = getClientId();
      const url = `/api/sync?clientId=${encodeURIComponent(clientId)}`;

      eventSource = new EventSource(url);

      eventSource.onopen = () => {
        // Reset reconnect delay on successful connection
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
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }

        if (!isCleanedUp) {
          // Exponential backoff capped at 15s
          reconnectTimer = setTimeout(() => {
            reconnectDelay = Math.min(reconnectDelay * 1.5, 15000);
            connect();
          }, reconnectDelay);
        }
      };
    };

    connect();

    return () => {
      isCleanedUp = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      for (const timer of debounceTimersRef.current.values()) {
        clearTimeout(timer);
      }
      debounceTimersRef.current.clear();
    };
  }, [queryClient]);
}

