export default function ExpensesLoading() {
  return (
    <div className="space-y-6 pb-12">
      {/* Header and Action Button Shell */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Expenses
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and manage your spending.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Add Expense Button Shell */}
          <div className="h-10 w-36 rounded-md bg-muted/50 border shimmer shimmer-bg" />
        </div>
      </div>

      <div className="space-y-4">
        {/* Pure Table Card Shell */}
        <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
          {/* Table Header Shell */}
          <div className="border-b border-border bg-muted/40 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="h-4 w-16 rounded bg-muted shimmer shimmer-bg" />
              <div className="h-4 w-24 rounded bg-muted shimmer shimmer-bg" />
              <div className="hidden sm:block h-4 w-28 rounded bg-muted shimmer shimmer-bg" />
              <div className="hidden md:block h-4 w-24 rounded bg-muted shimmer shimmer-bg" />
            </div>
            <div className="h-4 w-16 rounded bg-muted shimmer shimmer-bg" />
          </div>

          {/* Rows Shell */}
          <div className="divide-y divide-border/60">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="px-4 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="h-4 w-20 rounded bg-muted/60 shimmer shimmer-bg" />
                  <div className="h-4 w-28 rounded bg-muted/60 shimmer shimmer-bg" />
                  <div className="hidden sm:block h-5 w-24 rounded-md bg-muted/40 shimmer shimmer-bg" />
                  <div className="hidden md:block h-4 w-32 rounded bg-muted/40 shimmer shimmer-bg" />
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
