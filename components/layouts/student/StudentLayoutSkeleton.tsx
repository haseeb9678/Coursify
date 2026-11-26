export default function StudentLayoutSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading student workspace"
      className="flex min-h-dvh bg-background"
    >
      <div className="hidden w-64 shrink-0 border-r border-brand-border p-4 md:block">
        <div className="h-10 w-36 animate-pulse rounded-lg bg-brand-soft motion-reduce:animate-none" />
        <div className="mt-10 space-y-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="h-10 animate-pulse rounded-lg bg-brand-soft/70 motion-reduce:animate-none"
            />
          ))}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex h-18 items-center gap-4 border-b border-brand-border px-5">
          <div className="size-8 animate-pulse rounded-lg bg-brand-soft motion-reduce:animate-none" />
          <div className="h-4 w-36 animate-pulse rounded-md bg-brand-soft motion-reduce:animate-none" />
        </div>

        <div className="space-y-5 p-6">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-brand-soft motion-reduce:animate-none" />
          <div className="h-4 w-64 max-w-full animate-pulse rounded-md bg-brand-soft/70 motion-reduce:animate-none" />
          <div className="h-64 animate-pulse rounded-2xl bg-brand-soft/40 motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  );
}
