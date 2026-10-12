"use client";

import { formatCurrency } from "@/lib/utils";
import type { ReflectAtAGlance } from "@/types/api";

interface EditorialCashflowSummaryProps {
  atAGlance: ReflectAtAGlance;
  currencySymbol: string;
}

export function EditorialCashflowSummary({
  atAGlance,
  currencySymbol,
}: EditorialCashflowSummaryProps) {
  const isPositiveBalance = atAGlance.remaining_balance >= 0;

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <h3 className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
          Cashflow & Net Position
        </h3>
        <div className="h-px flex-1 bg-border/70" />
      </div>

      {/* Sleek Minimalist Financial Ledger Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-6 py-4 border-y border-border/80">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground font-medium block">
            Starting Allowance
          </span>
          <span className="text-lg sm:text-xl font-bold tracking-[-0.015em] text-foreground">
            {formatCurrency(atAGlance.starting_allowance, currencySymbol)}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-muted-foreground font-medium block">
            Total Spent
          </span>
          <span className="text-lg sm:text-xl font-bold tracking-[-0.015em] text-foreground">
            {formatCurrency(atAGlance.total_spent, currencySymbol)}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-muted-foreground font-medium block">
            Additional Income
          </span>
          <span className="text-lg sm:text-xl font-bold tracking-[-0.015em] text-foreground">
            {formatCurrency(atAGlance.extra_income, currencySymbol)}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-muted-foreground font-medium block">
            Ending Balance
          </span>
          <span
            className={`text-lg sm:text-xl font-bold tracking-[-0.015em] ${
              isPositiveBalance ? "text-primary" : "text-destructive"
            }`}
          >
            {isPositiveBalance ? "+" : ""}
            {formatCurrency(atAGlance.remaining_balance, currencySymbol)}
          </span>
        </div>
      </div>

      {/* Narrative Summary Memo */}
      {atAGlance.summary_text && (
        <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
          {atAGlance.summary_text}
        </p>
      )}
    </section>
  );
}
