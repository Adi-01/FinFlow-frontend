"use client";

import { formatCurrency } from "@/lib/utils";
import type { ReflectSpendingHabit, ReflectPurchaseToNote } from "@/types/api";

interface EditorialHabitsAndNotesProps {
  habits: ReflectSpendingHabit[];
  purchases: ReflectPurchaseToNote[];
  currencySymbol: string;
}

export function EditorialHabitsAndNotes({
  habits,
  purchases,
  currencySymbol,
}: EditorialHabitsAndNotesProps) {
  const hasHabits = habits && habits.length > 0;
  const hasPurchases = purchases && purchases.length > 0;

  if (!hasHabits && !hasPurchases) return null;

  return (
    <section className="space-y-8">
      {/* Spending Habits & Rhythm */}
      {hasHabits && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <h3 className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
              Behavioral Habits & Rhythm
            </h3>
            <div className="h-px flex-1 bg-border/70" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {habits.map((habit, idx) => (
              <div
                key={`${habit.title}-${idx}`}
                className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-1.5 hover:border-border transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary shrink-0" />
                  <h4 className="text-sm font-semibold text-foreground tracking-tight">
                    {habit.title}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-3.5">
                  {habit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notable Purchases */}
      {hasPurchases && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <h3 className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
              Purchases to Note
            </h3>
            <div className="h-px flex-1 bg-border/70" />
          </div>

          <div className="divide-y divide-border/60">
            {purchases.map((item, idx) => (
              <div
                key={`${item.title}-${idx}`}
                className="py-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 sm:gap-4"
              >
                <div className="space-y-0.5">
                  <span className="text-sm font-medium text-foreground block">
                    {item.title}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.note}
                  </p>
                </div>

                {item.amount > 0 && (
                  <span className="font-mono text-xs sm:text-sm font-semibold text-foreground shrink-0 self-start sm:self-auto">
                    {formatCurrency(item.amount, currencySymbol)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
