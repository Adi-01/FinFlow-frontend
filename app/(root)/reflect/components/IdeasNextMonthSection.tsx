"use client";

import { Lightbulb } from "lucide-react";
import type { ReflectIdeaForNextMonth } from "@/types/api";

interface IdeasNextMonthSectionProps {
  ideas: ReflectIdeaForNextMonth[];
}

export function IdeasNextMonthSection({ ideas }: IdeasNextMonthSectionProps) {
  if (!ideas || ideas.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <Lightbulb className="size-4 text-amber-500" />
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          Ideas for Next Month
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        {ideas.map((idea, idx) => (
          <div
            key={`${idea.title}-${idx}`}
            className="rounded-xl border border-border bg-amber-500/5 dark:bg-amber-500/10 p-4 space-y-2 border-amber-500/20"
          >
            <div className="flex items-center gap-2">
              <span className="grid size-5 place-items-center rounded-full bg-amber-500 text-[10px] font-bold text-white shrink-0">
                {idx + 1}
              </span>
              <h4 className="text-sm font-semibold text-foreground">
                {idea.title}
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pl-7">
              {idea.action}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
