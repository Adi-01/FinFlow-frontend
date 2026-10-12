"use client";

import { Sparkles, RefreshCw, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReflectPersonalityReveal } from "@/types/api";

interface PersonalityBadgeCardProps {
  personality: ReflectPersonalityReveal;
  onRegenerate: () => void;
  isRegenerating: boolean;
  onOpenChat: () => void;
  monthName: string;
}

export function PersonalityBadgeCard({
  personality,
  onRegenerate,
  isRegenerating,
  onOpenChat,
  monthName,
}: PersonalityBadgeCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 sm:p-7 shadow-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-border">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
          <Sparkles className="size-3.5" />
          <span>{monthName} Money Personality</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenChat}
            className="gap-2 text-xs flex-1 sm:flex-initial"
          >
            <MessageSquare className="size-3.5 text-primary" />
            Chat with Report
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="gap-2 text-xs flex-1 sm:flex-initial"
            title="Regenerate Reflection Report (2h cooldown)"
          >
            <RefreshCw className={`size-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
            {isRegenerating ? "Regenerating..." : "Regenerate"}
          </Button>
        </div>
      </div>

      <div className="pt-5 sm:pt-6 flex flex-col md:flex-row items-start md:items-center gap-5">
        {/* Emoji Badge Tile */}
        <div className="grid size-16 sm:size-20 shrink-0 place-items-center rounded-lg bg-muted/60 border border-border text-3xl sm:text-4xl shadow-none select-none">
          {personality.badge_emoji || "✨"}
        </div>

        {/* Narrative & Reveal */}
        <div className="space-y-1.5 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-[-0.02em] text-foreground">
            {personality.archetype_title}
          </h2>
          <p className="text-xs sm:text-sm font-medium italic text-muted-foreground">
            &ldquo;{personality.tagline}&rdquo;
          </p>
          <p className="text-xs sm:text-sm leading-relaxed text-foreground/90 pt-0.5">
            {personality.reveal_text}
          </p>
        </div>
      </div>
    </div>
  );
}
