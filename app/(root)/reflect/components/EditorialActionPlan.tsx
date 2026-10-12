"use client";

import type { ReflectIdeaForNextMonth } from "@/types/api";

interface EditorialActionPlanProps {
  ideas: ReflectIdeaForNextMonth[];
}

export function EditorialActionPlan({ ideas }: EditorialActionPlanProps) {
  if (!ideas || ideas.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <h3 className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
          Looking Ahead: Next Month Playbook
        </h3>
        <div className="h-px flex-1 bg-border/70" />
      </div>

      <div className="space-y-4">
        {ideas.map((idea, idx) => (
          <div
            key={`${idea.title}-${idx}`}
            className="flex items-start gap-3.5 p-3.5 rounded-lg border border-border bg-card shadow-none"
          >
            <span className="text-xs font-semibold text-primary px-2 py-0.5 rounded-md bg-primary/10 shrink-0">
              0{idx + 1}
            </span>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground tracking-tight">
                {idea.title}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {idea.action}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
