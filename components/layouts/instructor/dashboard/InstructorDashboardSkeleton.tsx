export default function InstructorDashboardSkeleton() {
  return (
    <section
      role="status"
      aria-busy="true"
      aria-label="Loading instructor dashboard"
      className="mx-auto w-full max-w-450 space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
    >
      <div className="h-36 animate-pulse rounded-2xl border border-brand-border bg-brand-soft/40 motion-reduce:animate-none" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-brand-border bg-brand-soft/40 motion-reduce:animate-none"
          />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="h-96 animate-pulse rounded-2xl border border-brand-border bg-brand-soft/40 motion-reduce:animate-none xl:col-span-2" />
        <div className="h-96 animate-pulse rounded-2xl border border-brand-border bg-brand-soft/40 motion-reduce:animate-none" />
      </div>
      <div className="h-72 animate-pulse rounded-2xl border border-brand-border bg-brand-soft/40 motion-reduce:animate-none" />
    </section>
  );
}
