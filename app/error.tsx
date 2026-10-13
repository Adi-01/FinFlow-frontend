"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RotateCcw, Home, AlertTriangle, Wallet } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for client-side observability
    console.error("Root application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col justify-between bg-background text-foreground">
      {/* Simple Header */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
            <Wallet className="h-4 w-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            FinFlow
          </span>
        </Link>
      </header>

      {/* Main Error Content */}
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/5 px-2.5 py-0.5 text-[11px] font-medium text-destructive">
          500 Error
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {error.message && error.message !== "An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive information. A digest property is included on this error instance which may provide additional details if the error is logged by the host."
            ? error.message
            : "An unexpected error occurred while loading this page. Our team has been notified."}
        </p>

        {error.digest && (
          <p className="mt-2 text-[11px] font-mono text-muted-foreground/70">
            Error ID: {error.digest}
          </p>
        )}

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            variant="default"
            size="sm"
            className="h-9 px-4 text-xs font-medium gap-1.5 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Try Again
          </Button>
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 text-xs font-medium gap-1.5 cursor-pointer"
            >
              <Home className="h-3.5 w-3.5" />
              Back to Home
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-6xl border-t border-border px-6 py-5 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} FinFlow. All rights reserved.
      </footer>
    </div>
  );
}

