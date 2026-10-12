"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSuspenseReflectReport } from "@/lib/hooks/queries/useReflectQueries";
import { useGenerateReflect } from "@/lib/hooks/mutations/useReflectMutations";
import { useUserContext } from "@/components/providers/user-provider";
import { formatDateTime, formatMonthYear } from "@/lib/utils";
import { InsufficientTransactionsState } from "./InsufficientTransactionsState";
import { EditorialPersonalityHero } from "./EditorialPersonalityHero";
import { EditorialCashflowSummary } from "./EditorialCashflowSummary";
import { EditorialCategoryBreakdown } from "./EditorialCategoryBreakdown";
import { EditorialHabitsAndNotes } from "./EditorialHabitsAndNotes";
import { EditorialActionPlan } from "./EditorialActionPlan";
import { ReflectChatDrawer } from "./ReflectChatDrawer";
import { useMonthContext } from "@/components/providers/month-provider";


function formatCooldown(seconds: number): string {
  if (seconds <= 0) return "";
  const hours = Math.floor(seconds / 3600);
  const remainingSeconds = seconds % 3600;
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;

  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  if (mins > 0) {
    return `${mins}m`;
  }
  return `${secs}s`;
}

function useCooldownCountdown(serverCooldownSeconds: number) {
  const [seconds, setSeconds] = useState(serverCooldownSeconds);
  const [prevInitial, setPrevInitial] = useState(serverCooldownSeconds);

  if (serverCooldownSeconds !== prevInitial) {
    setPrevInitial(serverCooldownSeconds);
    setSeconds(serverCooldownSeconds);
  }

  useEffect(() => {
    if (serverCooldownSeconds <= 0) return;

    const targetTime = Date.now() + serverCooldownSeconds * 1000;

    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((targetTime - Date.now()) / 1000),
      );

      setSeconds((prev) => {
        if (remaining <= 0) {
          clearInterval(interval);
          return 0;
        }
        // When more than 60 seconds remain, only trigger re-render on minute boundary change
        if (remaining > 60) {
          const currentMinute = Math.floor(remaining / 60);
          const prevMinute = Math.floor(prev / 60);
          if (currentMinute === prevMinute) {
            return prev; // Same state bails out of re-render
          }
        }
        return remaining;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [serverCooldownSeconds]);

  return seconds;
}


export function ReflectClient() {
  const { currencySymbol } = useUserContext();
  const { year, month } = useMonthContext();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: reflectData } = useSuspenseReflectReport(year, month);
  const { report, transactionCount = 0, limits } = reflectData;

  // Debug log: logs once on load or when data updates, not on re-renders
  // useEffect(() => {
  //   console.log("[Reflect Data ---> ]", reflectData);
  // }, [reflectData]);

  const serverCooldown = limits?.generate?.cooldownRemainingSeconds ?? 0;
  const cooldownCountdown = useCooldownCountdown(serverCooldown);

  const canGenerate = limits
    ? limits.generate.canGenerate &&
      limits.generate.dailyRemaining > 0 &&
      cooldownCountdown === 0
    : true;

  const monthName = formatMonthYear(year, month);

  const generateMutation = useGenerateReflect(() => {
    setErrorMessage(null);
  });

  const handleGenerate = (regenerate = false) => {
    if (!canGenerate || generateMutation.isPending) return;
    setErrorMessage(null);
    generateMutation.mutate(
      { year, month, regenerate },
      {
        onError: (err) => {
          setErrorMessage(err.message || "Failed to generate reflection report.");
        },
      },
    );
  };

  // Label describing why generation is currently blocked if applicable
  const getDisabledReason = () => {
    if (!limits) return null;
    if (cooldownCountdown > 0) {
      return `Cooldown (${formatCooldown(cooldownCountdown)})`;
    }
    if (limits.generate.dailyRemaining <= 0 || !limits.generate.canGenerate) {
      return "Daily Limit Reached (5/5)";
    }
    return null;
  };

  const disabledReason = getDisabledReason();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-0 space-y-10 pb-16">

      {/* Inline Error Banner */}
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-xs sm:text-sm text-destructive">
          <AlertCircle className="size-5 shrink-0" />
          <div className="flex-1">{errorMessage}</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setErrorMessage(null)}
            className="text-xs h-7 px-2 hover:bg-destructive/20"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Case 1: Insufficient Transactions (< 15) and no report */}
      {!report && transactionCount < 15 && (
        <InsufficientTransactionsState
          currentCount={transactionCount}
          requiredCount={15}
          monthName={monthName}
        />
      )}

      {/* Case 2: >= 15 Transactions and no report yet */}
      {!report && transactionCount >= 15 && (
        <div className="py-12 sm:py-16 text-center max-w-lg mx-auto space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-foreground sm:text-3xl">
              {monthName} Financial Reflection
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Synthesize your{" "}
              <strong className="text-foreground">
                {transactionCount} transactions
              </strong>{" "}
              into an editorial monthly report uncovering your spending archetype,
              cashflow narrative, and actionable recommendations.
            </p>
          </div>

          <div className="pt-2">
            <Button
              size="lg"
              variant="pill"
              onClick={() => handleGenerate(false)}
              disabled={!canGenerate || generateMutation.isPending}
              className="gap-2 font-medium px-6 cursor-pointer h-10 text-sm"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating Reflection...
                </>
              ) : disabledReason ? (
                `Generate (${disabledReason})`
              ) : (
                `Generate ${monthName} Reflection`
              )}
            </Button>
            <p className="text-[11px] text-muted-foreground mt-2">
              Instant AI Synthesis • Takes ~1 second
            </p>
          </div>
        </div>
      )}

      {/* Case 3: Editorial Reflection Document View */}
      {report && report.data && (
        <article className="space-y-12">
          {/* Document Header */}
          <header className="space-y-2 border-b border-border/80 pb-6">
            <div className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
              FinFlow Monthly Reflection • {monthName}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.025em] text-foreground">
              The {monthName} Reflection
            </h1>
            <div className="text-xs text-muted-foreground pt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                Based on{" "}
                {report.data.transaction_count ?? transactionCount} logged
                transactions
                {report.data.transaction_count &&
                transactionCount > report.data.transaction_count ? (
                  <span className="text-primary font-medium ml-1">
                    ({transactionCount - report.data.transaction_count} new since
                    generation)
                  </span>
                ) : null}
              </span>
              <span>•</span>
              <span>
                Generated on {formatDateTime(report.updatedAt || report.createdAt)}
              </span>
            </div>
          </header>

          {/* 1. Personality Profile */}
          <EditorialPersonalityHero
            personality={report.data.personality_reveal}
          />

          {/* 2. Executive Cashflow Flow */}
          <EditorialCashflowSummary
            atAGlance={report.data.at_a_glance}
            currencySymbol={currencySymbol}
          />

          {/* 3. Category Allocations */}
          <EditorialCategoryBreakdown
            whereMoneyWent={report.data.where_money_went}
            currencySymbol={currencySymbol}
          />

          {/* 4. Habits & Noteworthy Items */}
          <EditorialHabitsAndNotes
            habits={report.data.spending_habits}
            purchases={report.data.purchases_to_note}
            currencySymbol={currencySymbol}
          />

          {/* 5. Looking Ahead Action Plan */}
          <EditorialActionPlan ideas={report.data.ideas_for_next_month} />

          {/* Document Signoff Footer */}
          <footer className="border-t border-border/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div>FinFlow Reflect • AI Personal Finance Companion</div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsChatOpen(true)}
                className="hover:text-foreground underline underline-offset-4 cursor-pointer"
              >
                Ask AI
              </button>
              
            </div>
          </footer>

          {/* Persistent Chat Drawer with Proactive Limit Guards */}
          <ReflectChatDrawer
            isOpen={isChatOpen}
            onOpenChange={setIsChatOpen}
            report={report}
            limits={limits}
          />
        </article>
      )}

      {/* Floating Bottom Dock Actions */}
      {report && (
        <div className="sticky bottom-6 z-30 flex justify-center pointer-events-none mt-8">
          <div className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-card/95 px-3 py-1 shadow-md backdrop-blur-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsChatOpen(true)}
              className="rounded-full gap-1.5 text-xs font-medium cursor-pointer h-8 px-3 text-foreground hover:bg-muted"
            >
              <MessageSquare className="size-3.5 text-primary" />
              Chat with Report
            </Button>

            <div className="h-4 w-px bg-border/80" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleGenerate(true)}
              disabled={!canGenerate || generateMutation.isPending}
              className="rounded-full gap-1.5 text-xs font-medium cursor-pointer h-8 px-3 text-foreground hover:bg-muted disabled:opacity-50"
              title={
                disabledReason
                  ? `Generation unavailable: ${disabledReason}`
                  : "Regenerate Reflection Report"
              }
            >
              <RefreshCw
                className={`size-3.5 ${generateMutation.isPending ? "animate-spin" : ""}`}
              />
              {generateMutation.isPending
                ? "Regenerating..."
                : disabledReason || "Regenerate"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
