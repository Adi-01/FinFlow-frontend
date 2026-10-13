export function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <span>Welcome</span>
              <span className="inline-block h-5 w-20 rounded-md bg-muted shimmer shimmer-bg" />
            </h1>
            <p className="text-xs text-muted-foreground">
              Monthly Financial Overview
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-9 w-24 rounded-md bg-muted shimmer shimmer-bg" />
        </div>
      </div>

      {/* Simplified Stats Cards Shell */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-32 w-full rounded-xl border border-border bg-muted/50 shadow-sm shimmer shimmer-bg"
          />
        ))}
      </div>

      {/* Simplified Charts Shell */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-96 w-full rounded-xl border border-border bg-muted/50 shadow-sm shimmer shimmer-bg" />
        <div className="h-96 w-full rounded-xl border border-border bg-muted/50 shadow-sm shimmer shimmer-bg" />
      </div>
    </div>
  );
}

