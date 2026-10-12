"use client";

import { Activity, CheckCircle2 } from "lucide-react";
import type { ReflectSpendingHabit } from "@/types/api";

interface SpendingHabitsSectionProps {
  habits: ReflectSpendingHabit[];
}

export function SpendingHabitsSection({ habits }: SpendingHabitsSectionProps) {
  if (!habits || habits.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <Activity className="size-4 text-primary" />
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          Your Spending Habits
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        {habits.map((habit, idx) => (
          <div
            key={`${habit.title}-${idx}`}
            className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-2 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
              <h4 className="text-sm font-semibold text-foreground leading-snug">
                {habit.title}
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-6">
              {habit.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
