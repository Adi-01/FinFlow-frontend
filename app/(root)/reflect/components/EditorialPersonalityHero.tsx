"use client";

import type { ReflectPersonalityReveal } from "@/types/api";

interface EditorialPersonalityHeroProps {
  personality: ReflectPersonalityReveal;
}

export function EditorialPersonalityHero({
  personality,
}: EditorialPersonalityHeroProps) {
  return (
    <section className="space-y-5 pt-2">
      {/* Archetype Title */}
      <div className="space-y-1.5">
        <div className="text-[11px] uppercase tracking-widest font-semibold text-primary">
          Money Archetype Profile
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[-0.025em] text-foreground leading-tight">
          {personality.archetype_title}
        </h2>
      </div>

      {/* Editorial Pull Quote */}
      {personality.tagline && (
        <blockquote className="border-l-2 border-primary/50 pl-4 sm:pl-5 py-1 italic text-base sm:text-lg text-foreground/80 leading-relaxed">
          &ldquo;{personality.tagline}&rdquo;
        </blockquote>
      )}

      {/* Narrative Reveal Prose */}
      <p className="text-sm sm:text-base leading-relaxed sm:leading-loose text-foreground/90 font-normal">
        {personality.reveal_text}
      </p>
    </section>
  );
}
