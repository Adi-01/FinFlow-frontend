"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Profile error:", error);
  }, [error]);

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
      <div className="flex flex-col items-center space-y-2 text-center">
        <div className="rounded-full bg-destructive/10 p-3 text-destructive">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold tracking-[-0.02em] text-foreground">
          Something went wrong!
        </h2>
        <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
          {error.message || "Failed to load profile details. Please try again."}
        </p>
      </div>
      <Button onClick={() => reset()} variant="outline" size="sm" className="h-8.5 px-4 text-xs font-medium">
        Try again
      </Button>
    </div>
  );
}

