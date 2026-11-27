import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedCoursesSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Loading featured courses</span>
      <div aria-hidden="true" className="grid grid-cols-1 gap-3 px-2 py-5 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 xl:gap-7">
        {["block", "hidden sm:block", "hidden xl:block"].map((visibility) => (
          <div key={visibility} className={visibility}>
            <div className="flex h-full min-h-[154px] overflow-hidden rounded-xl border border-primary/30 bg-card shadow-sm sm:flex-col sm:p-5 lg:p-6">
              <Skeleton className="w-[116px] shrink-0 rounded-none sm:h-48 sm:w-full sm:rounded-xl lg:h-56" />
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-3 sm:p-0 sm:pt-5 lg:pt-6">
                <div className="space-y-2 sm:space-y-3">
                  <Skeleton className="h-2.5 w-16 sm:hidden" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full sm:h-5" />
                    <Skeleton className="h-4 w-3/4 sm:h-5" />
                  </div>
                  <Skeleton className="h-3 w-24 max-w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
                <Skeleton className="h-8 w-24 max-w-full rounded-lg sm:h-11 sm:w-36" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CourseCategoriesSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Loading course categories</span>
      <div aria-hidden="true" className="-mx-4 -my-3 grid auto-cols-[85%] grid-flow-col grid-rows-2 gap-3 overflow-hidden px-4 py-3 sm:mx-0 sm:my-0 sm:auto-cols-auto sm:grid-flow-row sm:grid-rows-none sm:grid-cols-2 sm:gap-5 sm:p-0 lg:grid-cols-3 lg:gap-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex min-w-0 items-center gap-4 rounded-xl border border-brand-border bg-card p-4 sm:p-5">
            <Skeleton className="size-12 shrink-0 rounded-xl sm:size-14" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-16 max-w-full" />
            </div>
            <Skeleton className="size-8 shrink-0 rounded-full sm:invisible" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CareerCourseCardsSkeleton() {
  return (
    <div role="status" className="xl:px-8">
      <span className="sr-only">Loading career courses</span>
      <div aria-hidden="true" className="grid grid-cols-2 gap-3 py-5 sm:gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
        {["block", "block", "hidden md:block", "hidden xl:block"].map((visibility, index) => (
          <div key={index} className={visibility}>
            <div className="flex h-full flex-col overflow-hidden rounded-xl border border-brand-border bg-card shadow-sm">
              <Skeleton className="h-55 w-full rounded-none" />
              <div className="flex flex-1 flex-col gap-5 p-4 sm:p-5">
                <div className="space-y-3">
                  <Skeleton className="h-3 w-16 max-w-full" />
                  <div className="min-h-11 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <Skeleton className="h-3 w-24 max-w-full" />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-border pt-3">
                  <Skeleton className="h-6 w-14" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CatalogCourseGridSkeleton({ count }: { count: number }) {
  return (
    <div role="status">
      <span className="sr-only">Loading courses</span>
      <div aria-hidden="true" className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="flex min-w-0 overflow-hidden rounded-xl border border-brand-border bg-card shadow-sm sm:flex-col">
            <Skeleton className="w-[116px] shrink-0 rounded-none sm:h-48 sm:w-full" />
            <div className="flex min-w-0 flex-1 flex-col justify-between p-3 sm:p-5">
              <div className="space-y-2 sm:space-y-3">
                <div className="space-y-2 sm:min-h-12">
                  <Skeleton className="h-4 w-full sm:h-5" />
                  <Skeleton className="h-4 w-3/4 sm:h-5" />
                </div>
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-5/6" />
              </div>
              <div className="mt-2 border-t border-brand-border pt-2 sm:mt-5 sm:pt-4">
                <Skeleton className="h-4 w-16 max-w-full sm:h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
