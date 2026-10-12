"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function WorkspaceRootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Workspace root error:", error);
  }, [error]);

  return (
    <div className="flex h-[70vh] flex-col items-center justify-center space-y-4 px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4 text-destructive">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h2 className="text-xl font-bold tracking-[-0.02em] text-foreground">
        Application Error
      </h2>
      <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
        {error.message ||
          "An unexpected error occurred while loading your workspace. Please refresh or try again."}
      </p>
      <div className="flex items-center gap-2.5 pt-2">
        <Button onClick={() => reset()} size="sm" className="h-8.5 px-4 text-xs font-medium gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" />
          Try Again
        </Button>
        <Button
          onClick={() => (window.location.href = "/dashboard")}
          variant="outline"
          size="sm"
          className="h-8.5 px-4 text-xs font-medium"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
