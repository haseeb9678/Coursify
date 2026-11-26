export default function UsersSkeleton() {
  return (
    <div role="status" aria-label="Loading users" className="mx-auto w-full max-w-450 space-y-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <span className="sr-only">Loading user management</span>
      <div className="h-8 w-40 animate-pulse rounded-lg bg-brand-soft motion-reduce:animate-none" />
      <div className="h-4 w-80 max-w-full animate-pulse rounded bg-brand-soft/70 motion-reduce:animate-none" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-xl border border-brand-border bg-card motion-reduce:animate-none" />
        ))}
      </div>
      <div className="h-20 animate-pulse rounded-xl border border-brand-border bg-card motion-reduce:animate-none" />
      <div className="space-y-4 rounded-xl border border-brand-border bg-card p-4">
        {Array.from({ length: 7 }, (_, index) => (
          <div key={index} className="h-10 animate-pulse rounded-lg bg-brand-soft/60 motion-reduce:animate-none" />
        ))}
      </div>
    </div>
  );
}
