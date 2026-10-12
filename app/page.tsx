import Link from "next/link";
import { getSessionCookie } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Wallet02Icon,
  ArrowRight01Icon,
  ChartHistogramIcon,
  PiggyBankIcon,
  Calendar03Icon,
  FileExportIcon,
} from "@hugeicons/core-free-icons";

export default async function LandingPage() {
  const sessionToken = await getSessionCookie();
  const isAuthenticated = !!sessionToken;

  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-background text-foreground overflow-hidden">
      {/* Navigation Bar */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HugeiconsIcon icon={Wallet02Icon} className="h-4 w-4" />
          </div>
          <span className="text-base font-bold tracking-[-0.02em] text-foreground">FinFlow</span>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button variant="pill" size="sm" className="h-8 px-4 text-xs font-medium">
                Go to Dashboard
                <HugeiconsIcon icon={ArrowRight01Icon} className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="h-8 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="pill" size="sm" className="h-8 px-4 text-xs font-medium">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 pb-20 pt-12 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-[11px] font-medium tracking-tight text-muted-foreground shadow-none">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Smart Monthly Finance Intelligence
        </div>

        <h1 className="max-w-3xl text-4xl font-bold leading-[1.12] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
          Master Your Spending, <br />
          <span className="text-primary">One Month at a Time.</span>
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          FinFlow organizes your finances month-by-month with automatic rollover intelligence, real-time balance metrics, source breakdowns, and multi-filter transaction ledgers.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
            <Button variant="pill" size="lg" className="h-10 px-6 text-sm font-medium">
              {isAuthenticated ? "Open Dashboard" : "Start Free Tracker"}
              <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid w-full grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-none transition-colors hover:border-black/15 dark:hover:border-white/15">
            <div className="mb-3.5 flex h-8 w-8 items-center justify-center rounded-md bg-muted text-foreground">
              <HugeiconsIcon icon={Calendar03Icon} className="h-4 w-4" />
            </div>
            <h3 className="mb-1 text-sm font-bold tracking-[-0.015em] text-foreground">Monthly Scoped</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Organizes allowances, earnings, and expenses strictly per month for total clarity.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-none transition-colors hover:border-black/15 dark:hover:border-white/15">
            <div className="mb-3.5 flex h-8 w-8 items-center justify-center rounded-md bg-muted text-foreground">
              <HugeiconsIcon icon={PiggyBankIcon} className="h-4 w-4" />
            </div>
            <h3 className="mb-1 text-sm font-bold tracking-[-0.015em] text-foreground">Auto Rollover</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Surplus funds automatically carry over into your next month&apos;s starting allowance.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-none transition-colors hover:border-black/15 dark:hover:border-white/15">
            <div className="mb-3.5 flex h-8 w-8 items-center justify-center rounded-md bg-muted text-foreground">
              <HugeiconsIcon icon={ChartHistogramIcon} className="h-4 w-4" />
            </div>
            <h3 className="mb-1 text-sm font-bold tracking-[-0.015em] text-foreground">Visual Analytics</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Daily income vs expense bar charts and source/category breakdown pie charts.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-none transition-colors hover:border-black/15 dark:hover:border-white/15">
            <div className="mb-3.5 flex h-8 w-8 items-center justify-center rounded-md bg-muted text-foreground">
              <HugeiconsIcon icon={FileExportIcon} className="h-4 w-4" />
            </div>
            <h3 className="mb-1 text-sm font-bold tracking-[-0.015em] text-foreground">CSV Export</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Export filtered transactions directly to standard CSV files anytime.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mx-auto w-full max-w-6xl border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} FinFlow Tracker. All rights reserved.
      </footer>
    </div>
  );
}
