"use client";

import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InsufficientTransactionsStateProps {
  currentCount: number;
  requiredCount?: number;
  monthName: string;
}

export function InsufficientTransactionsState({
  currentCount,
  requiredCount = 15,
  monthName,
}: InsufficientTransactionsStateProps) {
  const percentage = Math.min(100, Math.round((currentCount / requiredCount) * 100));
  const remaining = Math.max(0, requiredCount - currentCount);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 text-center shadow-xs max-w-2xl mx-auto my-8">
      <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
        Unlock Your {monthName} Reflection
      </h3>

      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
        FinFlow Reflect needs at least {requiredCount} logged transactions in {monthName} to detect your spending rhythm and reveal your monthly Spender Personality.
      </p>

      {/* Progress Meter */}
      <div className="mt-6 max-w-md mx-auto">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-foreground">
            {currentCount} of {requiredCount} transactions logged
          </span>
          <span className="text-primary font-bold">{percentage}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Log <strong className="text-foreground">{remaining} more {remaining === 1 ? "transaction" : "transactions"}</strong> to unlock AI insights.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button asChild size="sm" className="w-full sm:w-auto gap-2">
          <Link href="/expenses">
            <Plus className="size-4" />
            Log Expenses
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto gap-2">
          <Link href="/transactions">
            View Ledger
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
