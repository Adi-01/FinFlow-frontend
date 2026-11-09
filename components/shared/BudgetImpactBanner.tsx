"use client";

import { AlertTriangle } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface BudgetImpactBannerProps {
  type: "INCOME" | "EXPENSE";
  amount: number;
  currencySymbol: string;
  currentRemaining: number;
  newRemaining: number;
  isOverBudget: boolean;
  overBudgetAmount: number;
  impactPercentage: number;
  isLoading?: boolean;
}

export function BudgetImpactBanner({
  type,
  amount,
  currencySymbol,
  currentRemaining,
  newRemaining,
  isOverBudget,
  overBudgetAmount,
  impactPercentage,
  isLoading,
}: BudgetImpactBannerProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-muted/20 p-3 animate-pulse">
        <div className="h-4 w-32 bg-muted rounded mb-2" />
        <div className="h-6 w-48 bg-muted rounded" />
      </div>
    );
  }

  const isIncome = type === "INCOME";

  const getProgressBarColor = () => {
    if (isOverBudget || impactPercentage > 100) {
      return "[&>div]:bg-rose-600 dark:[&>div]:bg-rose-500";
    }
    if (impactPercentage <= 25) {
      return "[&>div]:bg-emerald-500";
    }
    if (impactPercentage <= 50) {
      return "[&>div]:bg-sky-500";
    }
    if (impactPercentage <= 75) {
      return "[&>div]:bg-amber-500";
    }
    return "[&>div]:bg-rose-500";
  };

  return (
    <div className="space-y-2">
      {/* Main Budget Preview Card */}
      <div
        className={cn(
          "rounded-lg border p-3 space-y-2.5 transition-all shadow-none",
          isOverBudget
            ? "border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10"
            : isIncome && amount > 0
            ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10"
            : "border-border bg-card"
        )}
      >
        <div className="flex items-center justify-between text-xs min-w-0 gap-2">
          <span className="text-muted-foreground font-medium shrink-0">
            Remaining Balance
          </span>
          <span
            className={cn(
              "text-sm font-normal tracking-tight truncate max-w-[180px]",
              isOverBudget
                ? "text-rose-600 dark:text-rose-400"
                : isIncome && amount > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : newRemaining < currentRemaining * 0.15 && !isIncome
                ? "text-amber-600 dark:text-amber-400"
                : "text-foreground"
            )}
            title={formatCurrency(newRemaining, currencySymbol)}
          >
            {formatCurrency(newRemaining, currencySymbol)}
          </span>
        </div>

        {/* Impact Progress Bar (for Expenses with amount > 0) */}
        {!isIncome && amount > 0 && currentRemaining > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Budget impact</span>
              <span className="font-medium text-foreground">
                {impactPercentage}%
              </span>
            </div>
            <Progress
              value={Math.min(100, impactPercentage)}
              className={`h-1.5 transition-all ${getProgressBarColor()}`}
            />
          </div>
        )}
      </div>

      {/* Inline Over-Budget Warning Banner */}
      {isOverBudget && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs font-medium text-rose-700 dark:text-rose-400 animate-in fade-in slide-in-from-top-1">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-500" />
          <span>
            Exceeds remaining monthly balance by{" "}
            <strong>{formatCurrency(overBudgetAmount, currencySymbol)}</strong>.
          </span>
        </div>
      )}
    </div>
  );
}
