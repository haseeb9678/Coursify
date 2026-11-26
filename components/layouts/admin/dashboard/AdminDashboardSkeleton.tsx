import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardSkeleton() {
  return (
    <section
      role="status"
      aria-busy="true"
      aria-label="Loading admin dashboard"
      className="mx-auto w-full max-w-450 space-y-5 px-4 py-6 sm:px-6 lg:space-y-6 lg:px-8 lg:py-8"
    >
      <Skeleton className="h-40 rounded-2xl border border-brand-border motion-reduce:animate-none sm:h-36" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 xl:gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex min-h-36 flex-col justify-between rounded-2xl border border-brand-border bg-card p-4 sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-3">
                <Skeleton className="h-4 w-28 motion-reduce:animate-none" />
                <Skeleton className="h-8 w-32 motion-reduce:animate-none" />
              </div>
              <Skeleton className="size-10 rounded-xl motion-reduce:animate-none" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-36 motion-reduce:animate-none" />
              <Skeleton className="h-3 w-44 motion-reduce:animate-none" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-3">
        <Skeleton className="h-[390px] rounded-2xl border border-brand-border motion-reduce:animate-none xl:col-span-2" />
        <Skeleton className="h-[390px] rounded-2xl border border-brand-border motion-reduce:animate-none" />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        <Skeleton className="h-[390px] rounded-2xl border border-brand-border motion-reduce:animate-none" />
        <Skeleton className="h-[390px] rounded-2xl border border-brand-border motion-reduce:animate-none" />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-3">
        <Skeleton className="h-[370px] rounded-2xl border border-brand-border motion-reduce:animate-none xl:col-span-2" />
        <Skeleton className="h-[370px] rounded-2xl border border-brand-border motion-reduce:animate-none" />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        <Skeleton className="h-[390px] rounded-2xl border border-brand-border motion-reduce:animate-none" />
        <Skeleton className="h-[330px] rounded-2xl border border-brand-border motion-reduce:animate-none" />
      </div>
    </section>
  );
}
