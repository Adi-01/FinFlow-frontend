"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "default" | "outline" | "secondary";
}

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center",
        className,
      )}
    >
      {Icon && (
        <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-none">
          <Icon className="h-4.5 w-4.5" />
        </div>
      )}

      <h3 className="text-sm sm:text-base font-semibold text-foreground">
        {title}
      </h3>

      {description && (
        <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          {action && (
            <Button
              size="sm"
              variant={action.variant || "default"}
              onClick={action.onClick}
              className="h-8 gap-1.5 text-xs font-medium"
            >
              {action.icon && <action.icon className="h-3.5 w-3.5" />}
              {action.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              size="sm"
              variant={secondaryAction.variant || "outline"}
              onClick={secondaryAction.onClick}
              className="h-8 gap-1.5 text-xs font-medium"
            >
              {secondaryAction.icon && (
                <secondaryAction.icon className="h-3.5 w-3.5" />
              )}
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
