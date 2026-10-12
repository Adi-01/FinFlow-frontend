"use client";

import { Wallet, TrendingDown, TrendingUp, PiggyBank } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ReflectAtAGlance } from "@/types/api";

interface AtAGlanceSectionProps {
  atAGlance: ReflectAtAGlance;
  currencySymbol: string;
}

export function AtAGlanceSection({
  atAGlance,
  currencySymbol,
}: AtAGlanceSectionProps) {
  const cards = [
    {
      label: "Starting Allowance",
      amount: atAGlance.starting_allowance,
      icon: Wallet,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Total Spent",
      amount: atAGlance.total_spent,
      icon: TrendingDown,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
    {
      label: "Extra Income",
      amount: atAGlance.extra_income,
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Remaining Balance",
      amount: atAGlance.remaining_balance,
      icon: PiggyBank,
      color: atAGlance.remaining_balance >= 0 ? "text-primary" : "text-destructive",
      bg: atAGlance.remaining_balance >= 0 ? "bg-primary/10" : "bg-destructive/10",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground truncate">
                  {card.label}
                </span>
                <div className={`grid size-8 shrink-0 place-items-center rounded-lg ${card.bg}`}>
                  <Icon className={`size-4 ${card.color}`} />
                </div>
              </div>

              <div className="mt-3">
                <span className={`text-xl sm:text-2xl font-bold tracking-tight ${card.color}`}>
                  {formatCurrency(card.amount, currencySymbol)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {atAGlance.summary_text && (
        <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-foreground/90">
          {atAGlance.summary_text}
        </div>
      )}
    </div>
  );
}
