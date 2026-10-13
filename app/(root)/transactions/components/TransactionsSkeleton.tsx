export function TransactionsSkeleton() {
  return (
    <div className="space-y-6 pb-12">
      {/* Header and Action Button Shell */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <span>Transactions</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage and view your combined income and expense ledger.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Add Transaction Button Shell */}
          <div className="h-10 w-36 rounded-md bg-muted/50 border shimmer shimmer-bg" />
        </div>
      </div>

      {/* Filters Toolbar Shell */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-1 rounded-xl bg-card border">
        <div className="flex items-center gap-2">
          {/* Month Navigator Shell */}
          <div className="h-9 w-44 rounded-lg bg-muted/40 shimmer shimmer-bg" />
          {/* Type Filter Pills Shell */}
          <div className="h-9 w-52 rounded-lg bg-muted/40 shimmer shimmer-bg" />
        </div>
        <div className="flex items-center gap-2">
          {/* Search Box Shell */}
          <div className="h-9 w-48 sm:w-64 rounded-lg bg-muted/40 shimmer shimmer-bg" />
          {/* Filter Popover Button Shell */}
          <div className="h-9 w-24 rounded-lg bg-muted/40 shimmer shimmer-bg" />
        </div>
      </div>

      <div className="space-y-4">
        {/* Pure Table Card Shell */}
        <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
          {/* Table Header Shell */}
          <div className="border-b border-border bg-muted/40 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="h-4 w-16 rounded bg-muted shimmer shimmer-bg" />
              <div className="hidden sm:block h-4 w-12 rounded bg-muted shimmer shimmer-bg" />
              <div className="h-4 w-28 rounded bg-muted shimmer shimmer-bg" />
              <div className="hidden md:block h-4 w-28 rounded bg-muted shimmer shimmer-bg" />
              <div className="hidden lg:block h-4 w-24 rounded bg-muted shimmer shimmer-bg" />
            </div>
            <div className="h-4 w-16 rounded bg-muted shimmer shimmer-bg" />
          </div>

          {/* Rows Shell */}
          <div className="divide-y divide-border/60">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="px-4 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="h-4 w-20 rounded bg-muted/60 shimmer shimmer-bg" />
                  <div className="hidden sm:block h-5 w-16 rounded-md bg-muted/40 shimmer shimmer-bg" />
                  <div className="h-4 w-32 rounded bg-muted/60 shimmer shimmer-bg" />
                  <div className="hidden md:block h-5 w-24 rounded-md bg-muted/40 shimmer shimmer-bg" />
                  <div className="hidden lg:block h-4 w-36 rounded bg-muted/40 shimmer shimmer-bg" />
                </div>
                <div className="h-4 w-16 rounded bg-muted/60 shimmer shimmer-bg" />
              </div>
            ))}
          </div>
        </div>

        {/* External Pagination Shell */}
        <div className="flex items-center justify-between px-1">
          <div className="h-4 w-32 rounded bg-muted/40 shimmer shimmer-bg" />
          <div className="flex items-center gap-3">
            <div className="h-4 w-20 rounded bg-muted/40 shimmer shimmer-bg" />
            <div className="flex items-center gap-1.5">
              <div className="h-8 w-20 rounded-md bg-muted/40 shimmer shimmer-bg" />
              <div className="h-8 w-16 rounded-md bg-muted/40 shimmer shimmer-bg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

