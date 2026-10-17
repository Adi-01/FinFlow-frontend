"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { Wallet, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

interface WarmupContextType {
  isWarmedUp: boolean;
  isWakingUp: boolean;
  elapsedSeconds: number;
}

const WarmupContext = createContext<WarmupContextType>({
  isWarmedUp: false,
  isWakingUp: false,
  elapsedSeconds: 0,
});

export const useWarmupContext = () => useContext(WarmupContext);

const WARMUP_SESSION_KEY = "finflow_server_warmed_at";
const WARMUP_CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes session cache
const OVERLAY_DEBOUNCE_MS = 350; // Don't show overlay if backend is already awake and responds quickly

export const touchServerWarmup = () => {
  try {
    sessionStorage.setItem(WARMUP_SESSION_KEY, String(Date.now()));
  } catch {
    // Ignore storage errors
  }
};

const getStatusMessage = (seconds: number) => {
  if (seconds < 4) return "Initializing secure workspace...";
  if (seconds < 8) return "Waking up backend service...";
  if (seconds < 13) return "Starting serverless container...";
  return "Almost ready, preparing your ledger...";
};

export function WarmupProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [isWarmedUp, setIsWarmedUp] = useState<boolean>(false);
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const performWarmup = useCallback(async () => {
    setError(null);
    setIsRetrying(true);
    setElapsedSeconds(0);

    // Abort previous attempt if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Show overlay only if warmup takes longer than OVERLAY_DEBOUNCE_MS
    const debounceTimer = setTimeout(() => {
      setShowOverlay(true);
    }, OVERLAY_DEBOUNCE_MS);

    // Timer to track live seconds while booting
    const startTimestamp = Date.now();
    const intervalTimer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimestamp) / 1000));
    }, 1000);

    try {
      const res = await fetch("/api/health", {
        cache: "no-store",
        signal: abortController.signal,
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const json = await res.json().catch(() => ({}));
      if (json?.data?.status === "ok" || json?.success || res.status === 200) {
        touchServerWarmup();
        setIsWarmedUp(true);
        setShowOverlay(false);
        // Refresh any active queries that were queued or waiting during boot
        queryClient.invalidateQueries();
      } else {
        throw new Error(json?.message || "Health check failed");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      setShowOverlay(true);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reach the backend service. It may still be booting.",
      );
    } finally {
      clearTimeout(debounceTimer);
      clearInterval(intervalTimer);
      setIsRetrying(false);
    }
  }, [queryClient]);

  // Initial warmup check
  useEffect(() => {
    try {
      if (
        window.location.search.includes("warmup") ||
        window.location.search.includes("testWarmup")
      ) {
        sessionStorage.removeItem(WARMUP_SESSION_KEY);
      } else {
        const stored = sessionStorage.getItem(WARMUP_SESSION_KEY);
        if (stored) {
          const timestamp = Number(stored);
          if (
            !isNaN(timestamp) &&
            Date.now() - timestamp < WARMUP_CACHE_DURATION_MS
          ) {
            setIsWarmedUp(true);
            return;
          }
        }
      }
    } catch {
      // Ignore sessionStorage errors
    }

    performWarmup();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [performWarmup]);

  // Rolling Keep-Alive: Whenever any React Query request or mutation succeeds,
  // Railway has just handled fresh traffic and reset its idle scale-to-zero countdown.
  // We refresh the session timestamp so active users never encounter unnecessary cold checks.
  useEffect(() => {
    const unsubscribeQuery = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "updated" && event.action?.type === "success") {
        touchServerWarmup();
      }
    });

    const unsubscribeMutation = queryClient
      .getMutationCache()
      .subscribe((event) => {
        if (event.type === "updated" && event.action?.type === "success") {
          touchServerWarmup();
        }
      });

    return () => {
      unsubscribeQuery();
      unsubscribeMutation();
    };
  }, [queryClient]);

  return (
    <WarmupContext.Provider
      value={{
        isWarmedUp,
        isWakingUp: showOverlay,
        elapsedSeconds,
      }}
    >
      {/* 
        Hydration Safety: Always render children so server HTML matches client DOM tree.
        The overlay sits on top (fixed inset-0 z-[100]) if the backend is cold.
      */}
      {children}

      {showOverlay && (
        <div className="fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center select-none animate-in fade-in duration-300">
          <div className="flex flex-col items-center max-w-sm w-full">
            {/* FinFlow Brand Emblem with breathing pulse */}
            <div className="relative mb-6">
              <div className="relative flex size-14 items-center justify-center rounded-2xl bg-foreground text-background shadow-md transition-transform duration-300 hover:scale-105">
                <Wallet className="size-6 text-background" />
              </div>
              {!error && (
                <div className="absolute -inset-1.5 rounded-3xl border border-foreground/15 dark:border-primary/30 animate-pulse pointer-events-none" />
              )}
            </div>

            {/* Title & Dynamic Status */}
            <h1 className="text-xl font-bold tracking-[-0.025em] text-foreground">
              FinFlow
            </h1>
            <p className="mt-1.5 text-xs text-muted-foreground transition-all duration-300 min-h-[18px]">
              {error
                ? "Backend is taking longer than usual"
                : getStatusMessage(elapsedSeconds)}
            </p>

            {/* Minimalist Progress Track & Live Badge */}
            {!error ? (
              <div className="mt-6 flex flex-col items-center space-y-4 w-full">
                <div className="h-1 w-52 sm:w-60 rounded-full bg-muted overflow-hidden relative">
                  <div className="absolute inset-y-0 left-0 bg-foreground/80 dark:bg-primary rounded-full w-2/5 animate-[indeterminate_1.6s_ease-in-out_infinite]" />
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-xs">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  <span>Waking server • {elapsedSeconds}s</span>
                </div>
              </div>
            ) : (
              <div className="mt-6 w-full rounded-xl border border-border bg-card p-4 space-y-3.5 shadow-sm">
                <div className="flex items-center justify-center gap-2 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <span className="truncate">{error}</span>
                </div>
                <Button
                  onClick={performWarmup}
                  disabled={isRetrying}
                  size="sm"
                  className="w-full gap-2 text-xs h-8.5 font-medium cursor-pointer"
                >
                  <RefreshCw
                    className={`size-3.5 ${isRetrying ? "animate-spin" : ""}`}
                  />
                  {isRetrying ? "Reconnecting..." : "Retry Connection"}
                </Button>
              </div>
            )}

            {/* Reassuring Context Footer */}
            <p className="mt-8 text-[11px] text-muted-foreground/70 max-w-xs leading-relaxed">
              Instances scale to zero when idle to conserve energy and costs.
              Startup takes 10 to 15 seconds on the first visit.
            </p>
          </div>
        </div>
      )}
    </WarmupContext.Provider>
  );
}
