import { Skeleton } from "@/components/ui/skeleton";

const pageClass = "mx-auto w-full max-w-450 space-y-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8";
const cardClass = "space-y-3 rounded-xl border border-brand-border bg-card p-4 sm:p-5";

function LoadingHeading() {
  return <div className="space-y-2">
    <Skeleton className="h-8 w-52 max-w-full" />
    <Skeleton className="h-4 w-88 max-w-full" />
  </div>;
}

export function InstructorTableSkeleton() {
  return <section role="status" aria-label="Loading table" className={cardClass}>
    <Skeleton className="h-8 w-full" />
    {Array.from({ length: 5 }, (_, row) => <Skeleton key={row} className="h-11 w-full" />)}
    <Skeleton className="ml-auto h-8 w-32" />
  </section>;
}

export function InstructorListSkeleton() {
  return <div className={pageClass}>
    <LoadingHeading />
    <Skeleton className="h-16 rounded-xl" />
    <InstructorTableSkeleton />
  </div>;
}

export function InstructorCourseCardsSkeleton() {
  return <div role="status" aria-label="Loading courses" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 3 }, (_, card) => <section key={card} className={cardClass}>
      <Skeleton className="aspect-video w-full rounded-xl" />
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-8 w-40 max-w-full" />
    </section>)}
  </div>;
}

export function InstructorCourseOverviewSkeleton() {
  return <div role="status" aria-label="Loading course details" className="space-y-5">
    <section className="overflow-hidden rounded-2xl border border-brand-border bg-card">
      <div className="grid items-center gap-5 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(12rem,26%)] lg:gap-7">
        <div className="space-y-3">
          <Skeleton className="h-5 w-20" />
          <LoadingHeading />
          <Skeleton className="h-9 w-56 max-w-full" />
        </div>
        <Skeleton className="aspect-video w-full max-w-sm rounded-xl lg:justify-self-end" />
      </div>
      <div className="grid grid-cols-2 gap-3 border-t border-brand-border p-3 md:grid-cols-4 sm:p-4">
        {Array.from({ length: 4 }, (_, metric) => <Skeleton key={metric} className="h-8 w-full" />)}
      </div>
    </section>
    <div className="grid grid-cols-3 gap-2 rounded-xl border border-brand-border bg-card p-2 sm:grid-cols-6">
      {Array.from({ length: 6 }, (_, tab) => <Skeleton key={tab} className="h-9" />)}
    </div>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
      {[0, 1].map((panel) => <section key={panel} className={cardClass}>
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </section>)}
    </div>
  </div>;
}

export function InstructorCoursePageSkeleton() {
  return <div className={pageClass}><InstructorCourseOverviewSkeleton /></div>;
}

export function InstructorRowsSkeleton({ rows = 3 }: { rows?: number }) {
  return <div role="status" aria-label="Loading content" className="space-y-3 py-1">
    {Array.from({ length: rows }, (_, row) => <Skeleton key={row} className="h-9 w-full" />)}
  </div>;
}
