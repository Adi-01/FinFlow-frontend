export function ReflectSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-0 space-y-10 pb-16">
      {/* 2. Document Editorial Header */}
      <header className="space-y-3 border-b border-border/80 pb-6">
        <div className="h-3 w-52 rounded bg-muted/50 shimmer shimmer-bg" />
        <div className="h-9 sm:h-10 w-72 sm:w-96 rounded bg-muted/70 shimmer shimmer-bg" />
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
          <div className="h-3.5 w-28 rounded bg-muted/40 shimmer shimmer-bg" />
          <div className="size-1 rounded-full bg-muted/50" />
          <div className="h-3.5 w-44 rounded bg-muted/40 shimmer shimmer-bg" />
          <div className="size-1 rounded-full bg-muted/50" />
          <div className="h-3.5 w-32 rounded bg-muted/40 shimmer shimmer-bg" />
        </div>
      </header>

      {/* 3. Personality Profile (Editorial Typography & Pull Quote) */}
      <section className="space-y-5 pt-2">
        <div className="space-y-2">
          <div className="h-3 w-40 rounded bg-primary/40 shimmer shimmer-bg" />
          <div className="h-8 sm:h-9 w-64 sm:w-80 rounded bg-muted/70 shimmer shimmer-bg" />
        </div>

        {/* Editorial Pull Quote Skeleton */}
        <div className="border-l-2 border-primary/40 pl-4 sm:pl-5 py-1 space-y-2">
          <div className="h-4.5 w-11/12 rounded bg-muted/60 shimmer shimmer-bg" />
          <div className="h-4.5 w-3/4 rounded bg-muted/60 shimmer shimmer-bg" />
        </div>

        {/* Narrative Prose */}
        <div className="space-y-2 pt-1">
          <div className="h-3.5 w-full rounded bg-muted/40 shimmer shimmer-bg" />
          <div className="h-3.5 w-full rounded bg-muted/40 shimmer shimmer-bg" />
          <div className="h-3.5 w-4/5 rounded bg-muted/40 shimmer shimmer-bg" />
        </div>
      </section>

      {/* 4. Cashflow & Net Position Ledger */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-3 w-44 rounded bg-muted/50 shimmer shimmer-bg" />
          <div className="h-px flex-1 bg-border/70" />
        </div>

        {/* Sleek Minimalist Financial Ledger Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-6 py-4 border-y border-border/80">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-24 rounded bg-muted/40 shimmer shimmer-bg" />
              <div className="h-6 w-28 rounded bg-muted/60 shimmer shimmer-bg" />
            </div>
          ))}
        </div>

        {/* Narrative Memo */}
        <div className="space-y-2">
          <div className="h-3.5 w-full rounded bg-muted/40 shimmer shimmer-bg" />
          <div className="h-3.5 w-3/4 rounded bg-muted/40 shimmer shimmer-bg" />
        </div>
      </section>

      {/* 5. Where Money Flowed (Category Allocations) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-3 w-36 rounded bg-muted/50 shimmer shimmer-bg" />
          <div className="h-px flex-1 bg-border/70" />
        </div>

        <div className="h-3.5 w-3/4 rounded bg-muted/40 shimmer shimmer-bg" />

        <div className="space-y-3.5 pt-2">
          {[
            { w: "80%", catW: "w-28" },
            { w: "55%", catW: "w-36" },
            { w: "35%", catW: "w-24" },
            { w: "20%", catW: "w-32" },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <div className={`h-4 ${item.catW} rounded bg-muted/60 shimmer shimmer-bg`} />
                <div className="flex items-baseline gap-3">
                  <div className="h-3 w-8 rounded bg-muted/40 shimmer shimmer-bg" />
                  <div className="h-4 w-16 rounded bg-muted/60 shimmer shimmer-bg" />
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                <div
                  className="h-full bg-primary/40 rounded-full shimmer shimmer-bg"
                  style={{ width: item.w }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Behavioral Habits & Purchases to Note */}
      <section className="space-y-8">
        {/* Behavioral Habits */}
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-3 w-48 rounded bg-muted/50 shimmer shimmer-bg" />
            <div className="h-px flex-1 bg-border/70" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(2)].map((_, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary/40 shrink-0" />
                  <div className="h-4 w-36 rounded bg-muted/60 shimmer shimmer-bg" />
                </div>
                <div className="space-y-1.5 pl-3.5">
                  <div className="h-3 w-full rounded bg-muted/40 shimmer shimmer-bg" />
                  <div className="h-3 w-4/5 rounded bg-muted/40 shimmer shimmer-bg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Purchases to Note */}
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-3 w-32 rounded bg-muted/50 shimmer shimmer-bg" />
            <div className="h-px flex-1 bg-border/70" />
          </div>

          <div className="divide-y divide-border/60">
            {[...Array(2)].map((_, idx) => (
              <div
                key={idx}
                className="py-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 sm:gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-44 rounded bg-muted/60 shimmer shimmer-bg" />
                  <div className="h-3 w-3/4 rounded bg-muted/40 shimmer shimmer-bg" />
                </div>
                <div className="h-4 w-16 rounded bg-muted/60 shimmer shimmer-bg shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Looking Ahead: Next Month Playbook */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-3 w-56 rounded bg-muted/50 shimmer shimmer-bg" />
          <div className="h-px flex-1 bg-border/70" />
        </div>

        <div className="space-y-4">
          {[...Array(2)].map((_, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 rounded-xl border border-primary/20 bg-primary/5"
            >
              <div className="h-6 w-8 rounded bg-primary/10 shimmer shimmer-bg shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-48 rounded bg-muted/70 shimmer shimmer-bg" />
                <div className="h-3.5 w-full rounded bg-muted/40 shimmer shimmer-bg" />
                <div className="h-3.5 w-4/5 rounded bg-muted/40 shimmer shimmer-bg" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Document Signoff Footer */}
      <footer className="border-t border-border/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="h-3.5 w-56 rounded bg-muted/40 shimmer shimmer-bg" />
        <div className="flex items-center gap-3">
          <div className="h-3.5 w-40 rounded bg-muted/40 shimmer shimmer-bg" />
          <div className="size-1 rounded-full bg-muted/50" />
          <div className="h-3.5 w-20 rounded bg-muted/40 shimmer shimmer-bg" />
        </div>
      </footer>
    </div>
  );
}

