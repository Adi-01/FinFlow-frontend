"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon } from "@hugeicons/core-free-icons";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
      <div className="flex flex-col items-center space-y-2 text-center">
        <div className="rounded-full bg-destructive/10 p-3 text-destructive">
          <HugeiconsIcon icon={AlertCircleIcon} className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Something went wrong!
        </h2>
        <p className="text-sm text-muted-foreground max-w-md">
          {error.message || "Failed to load dashboard metrics. Please try again."}
        </p>
      </div>
      <Button onClick={() => reset()} variant="outline">
        Try again
      </Button>
    </div>
  );
}
