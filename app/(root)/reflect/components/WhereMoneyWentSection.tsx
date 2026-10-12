"use client";

import { PieChart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ReflectWhereMoneyWent } from "@/types/api";

interface WhereMoneyWentSectionProps {
  whereMoneyWent: ReflectWhereMoneyWent;
  currencySymbol: string;
}

export function WhereMoneyWentSection({
  whereMoneyWent,
  currencySymbol,
}: WhereMoneyWentSectionProps) {
  const breakdown = whereMoneyWent.breakdown || [];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <PieChart className="size-4 text-primary" />
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          Where Your Money Went
        </h3>
      </div>

      {whereMoneyWent.summary && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {whereMoneyWent.summary}
        </p>
      )}

      <div className="space-y-3 pt-2">
        {breakdown.map((item, idx) => {
          const numericPercent = parseFloat(item.percentage.replace("%", "")) || 0;
          return (
            <div key={`${item.category}-${idx}`} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-medium text-foreground">{item.category}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {formatCurrency(item.amount, currencySymbol)}
                  </span>
                  <span className="text-xs text-muted-foreground">({item.percentage})</span>
                </div>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary/80 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(2, numericPercent))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
