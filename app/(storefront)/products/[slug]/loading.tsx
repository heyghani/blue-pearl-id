export default function ProductDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-3">
          <div className="aspect-square w-full animate-pulse rounded-2xl bg-muted lg:rounded-3xl" />
          <div className="flex gap-2 overflow-x-auto px-4 lg:px-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-16 w-16 shrink-0 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-10 w-3/4 animate-pulse rounded-lg bg-muted" />
            <div className="h-6 w-28 animate-pulse rounded bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-12 w-full max-w-sm animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}
