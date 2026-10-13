import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wallet, Home, LayoutGrid, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-background text-foreground">
      {/* Header */}
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

      {/* Main 404 Content */}
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <SearchX className="h-7 w-7" />
        </div>

        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          404 Not Found
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Page not found
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved, deleted, or never existed.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button
              variant="default"
              size="sm"
              className="h-9 px-4 text-xs font-medium gap-1.5 cursor-pointer"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Go to Dashboard
            </Button>
          </Link>
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

