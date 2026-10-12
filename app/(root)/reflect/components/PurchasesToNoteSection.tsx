"use client";

import { Tag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ReflectPurchaseToNote } from "@/types/api";

interface PurchasesToNoteSectionProps {
  purchases: ReflectPurchaseToNote[];
  currencySymbol: string;
}

export function PurchasesToNoteSection({
  purchases,
  currencySymbol,
}: PurchasesToNoteSectionProps) {
  if (!purchases || purchases.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <Tag className="size-4 text-primary" />
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          Purchases to Note
        </h3>
      </div>

      <div className="space-y-3 pt-1">
        {purchases.map((item, idx) => (
          <div
            key={`${item.title}-${idx}`}
            className="rounded-xl border border-border bg-muted/15 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="space-y-1">
              <span className="text-sm font-semibold text-foreground block">
                {item.title}
              </span>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {item.note}
              </p>
            </div>

            {item.amount > 0 && (
              <div className="shrink-0 rounded-lg bg-primary/10 px-3 py-1.5 text-xs sm:text-sm font-bold text-primary">
                {formatCurrency(item.amount, currencySymbol)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
