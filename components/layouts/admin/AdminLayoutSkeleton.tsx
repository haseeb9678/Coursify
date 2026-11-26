export default function AdminLayoutSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading admin workspace"
      className="flex min-h-dvh bg-background"
    >
      <div className="hidden w-64 shrink-0 border-r border-brand-border p-4 md:block">
        <div className="h-10 w-36 animate-pulse rounded-lg bg-brand-soft motion-reduce:animate-none" />
        <div className="mt-9 space-y-3">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="h-9 animate-pulse rounded-lg bg-brand-soft/70 motion-reduce:animate-none"
            />
          ))}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex h-18 items-center gap-4 border-b border-brand-border px-5">
          <div className="size-8 animate-pulse rounded-lg bg-brand-soft motion-reduce:animate-none" />
          <div className="h-4 w-40 animate-pulse rounded-md bg-brand-soft motion-reduce:animate-none" />
        </div>
        <div className="space-y-6 p-6 lg:p-8">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-brand-soft motion-reduce:animate-none" />
          <div className="h-4 w-72 max-w-full animate-pulse rounded-md bg-brand-soft/70 motion-reduce:animate-none" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-2xl border border-brand-border bg-brand-soft/40 motion-reduce:animate-none"
              />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-2xl border border-brand-border bg-brand-soft/40 motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  );
}
