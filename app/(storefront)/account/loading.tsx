export default function AccountLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <div className="space-y-2">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-56 max-w-full animate-pulse rounded bg-muted" />
      </div>
      <div className="h-40 w-full animate-pulse rounded-xl bg-muted" />
      <div className="h-24 w-full animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
