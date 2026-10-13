export function ProfileSkeleton() {
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      {/* Fixed Top Section Skeleton */}
      <div className="sticky top-0 z-20 shrink-0 space-y-4 bg-background pb-3">
        {/* Header Card Skeleton */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-16 shrink-0 rounded-full bg-muted/60 shimmer shimmer-bg" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-36 rounded bg-muted/60 shimmer shimmer-bg" />
                  <div className="h-4 w-16 rounded-full bg-muted/40 shimmer shimmer-bg" />
                </div>
                <div className="h-4 w-24 rounded bg-muted/40 shimmer shimmer-bg" />
                <div className="h-3 w-48 rounded bg-muted/30 shimmer shimmer-bg" />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="h-8 w-16 rounded-md bg-muted/50 shimmer shimmer-bg" />
              <div className="h-8 w-24 rounded-md bg-muted/50 shimmer shimmer-bg" />
            </div>
          </div>
        </div>

        {/* TabsList Skeleton */}
        <div className="h-9 w-full rounded-md bg-muted/50 shimmer shimmer-bg grid grid-cols-3 p-0.5 gap-0.5">
          <div className="h-full rounded-[4px] bg-background/50" />
          <div className="h-full" />
          <div className="h-full" />
        </div>
      </div>

      {/* Scrollable Content Skeleton */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-16 space-y-6">
        {/* Card 1: Personal Info Skeleton */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-none space-y-6">
          <div className="space-y-2">
            <div className="h-5 w-40 rounded bg-muted/60 shimmer shimmer-bg" />
            <div className="h-4 w-72 rounded bg-muted/40 shimmer shimmer-bg" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-muted/40 shimmer shimmer-bg" />
              <div className="h-8.5 w-full rounded-[4px] bg-muted/30 shimmer shimmer-bg" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-muted/40 shimmer shimmer-bg" />
              <div className="h-8.5 w-full rounded-[4px] bg-muted/30 shimmer shimmer-bg" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-muted/40 shimmer shimmer-bg" />
              <div className="h-8.5 w-full rounded-[4px] bg-muted/30 shimmer shimmer-bg" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-muted/40 shimmer shimmer-bg" />
              <div className="h-8.5 w-full rounded-[4px] bg-muted/30 shimmer shimmer-bg" />
            </div>
          </div>
        </div>

        {/* Card 2: Financial Preferences Skeleton */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-none space-y-6">
          <div className="space-y-2">
            <div className="h-5 w-44 rounded bg-muted/60 shimmer shimmer-bg" />
            <div className="h-4 w-64 rounded bg-muted/40 shimmer shimmer-bg" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-3 w-36 rounded bg-muted/40 shimmer shimmer-bg" />
              <div className="h-8.5 w-full rounded-[4px] bg-muted/30 shimmer shimmer-bg" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-36 rounded bg-muted/40 shimmer shimmer-bg" />
              <div className="h-8.5 w-full rounded-[4px] bg-muted/30 shimmer shimmer-bg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

