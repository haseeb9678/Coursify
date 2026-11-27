import { Skeleton } from "@/components/ui/skeleton";

export default function StudentLearningSkeleton() {
  return (
    <div className="w-full min-w-0" role="status">
      <span className="sr-only">Loading course content</span>
      <div className="flex flex-col gap-5 border-b border-brand-border bg-linear-to-br from-brand-soft/75 via-brand-page-secondary to-background px-4 py-6 sm:px-6 sm:py-8 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Skeleton className="size-11 shrink-0 rounded-xl sm:size-13" />
          <Skeleton className="h-7 w-56 max-w-full sm:h-9 sm:w-80" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid items-start gap-5 p-4 sm:gap-6 sm:p-6 lg:p-8 xl:grid-cols-[minmax(0,1fr)_21rem] 2xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0 space-y-5 sm:space-y-6">
          <div className="space-y-4 rounded-2xl border border-brand-border bg-card p-4 sm:p-6 lg:p-8">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-8 w-3/4 max-w-sm" />
            <Skeleton className="h-4 w-full max-w-lg" />
            <Skeleton className="mt-6 h-48 w-full rounded-xl sm:h-64" />
          </div>
          <div className="hidden space-y-4 rounded-2xl border border-brand-border bg-card p-6 sm:block">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </div>
        <div className="space-y-3 rounded-2xl border border-brand-border bg-card p-4 sm:p-5">
          <Skeleton className="mb-4 h-5 w-32" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
