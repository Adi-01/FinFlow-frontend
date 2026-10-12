"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground font-sans antialiased">
        <div className="mx-auto flex max-w-md flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-red-100 p-4 text-red-600 dark:bg-red-950 dark:text-red-400">
            <svg
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Something went wrong!</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {error.message || "A critical error occurred. Please try reloading the page."}
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus:outline-none dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
