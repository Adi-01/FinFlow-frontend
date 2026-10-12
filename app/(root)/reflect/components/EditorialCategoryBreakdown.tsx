"use client";

import { formatCurrency } from "@/lib/utils";
import type { ReflectWhereMoneyWent } from "@/types/api";

interface EditorialCategoryBreakdownProps {
  whereMoneyWent: ReflectWhereMoneyWent;
  currencySymbol: string;
}

export function EditorialCategoryBreakdown({
  whereMoneyWent,
  currencySymbol,
}: EditorialCategoryBreakdownProps) {
  const breakdown = whereMoneyWent.breakdown || [];

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <h3 className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
          Where Money Flowed
        </h3>
        <div className="h-px flex-1 bg-border/70" />
      </div>

      {whereMoneyWent.summary && (
        <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
          {whereMoneyWent.summary}
        </p>
      )}

      {/* Editorial Category List */}
      <div className="space-y-3.5 pt-2">
        {breakdown.map((item, idx) => {
          const numericPercent = parseFloat(item.percentage.replace("%", "")) || 0;
          return (
            <div key={`${item.category}-${idx}`} className="space-y-1.5 group">
              <div className="flex items-baseline justify-between text-xs sm:text-sm">
                <span className="font-semibold text-foreground tracking-tight">
                  {item.category}
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-muted-foreground">
                    {item.percentage}
                  </span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatCurrency(item.amount, currencySymbol)}
                  </span>
                </div>
              </div>

              {/* Minimal Progress Line */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                <div
                  className="h-full bg-primary/70 rounded-full transition-all duration-500 group-hover:bg-primary"
                  style={{ width: `${Math.min(100, Math.max(2, numericPercent))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
