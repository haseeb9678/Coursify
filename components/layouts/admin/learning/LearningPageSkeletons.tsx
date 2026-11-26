import { Skeleton } from "@/components/ui/skeleton";

const pageClassName =
  "mx-auto w-full max-w-450 space-y-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8";

export function CategoriesSkeleton() {
  return (
    <div role="status" aria-label="Loading categories" className={pageClassName}>
      <Skeleton className="h-9 w-56" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="space-y-3 rounded-xl border border-brand-border bg-card p-4">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

export function CoursesSkeleton() {
  return (
    <div role="status" aria-label="Loading courses" className={pageClassName}>
      <Skeleton className="h-9 w-48" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-16 rounded-xl" />
      <div className="space-y-3 rounded-xl border border-brand-border bg-card p-4">
        {Array.from({ length: 7 }, (_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}

export function CourseDetailsSkeleton() {
  return (
    <div role="status" aria-label="Loading course details" className={pageClassName}>
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-52 rounded-xl" />
    </div>
  );
}

export function CourseFormSkeleton() {
  return (
    <div role="status" aria-label="Loading course form" className={pageClassName}>
      <Skeleton className="h-8 w-64" />
      {Array.from({ length: 4 }, (_, section) => (
        <section
          key={section}
          className="space-y-4 rounded-xl border border-brand-border bg-card p-5"
        >
          <Skeleton className="h-5 w-48" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: section === 0 ? 4 : 2 }, (_, field) => (
              <Skeleton key={field} className="h-11 w-full" />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function CurriculumSkeleton() {
  return (
    <div role="status" aria-label="Loading curriculum" className={pageClassName}>
      <Skeleton className="h-9 w-72" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, section) => (
          <section
            key={section}
            className="space-y-3 rounded-xl border border-brand-border bg-card p-4"
          >
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: 2 }, (_, lesson) => (
              <Skeleton key={lesson} className="h-16 w-full" />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

export function CourseApprovalsSkeleton() {
  return (
    <div role="status" aria-label="Loading course approvals" className={pageClassName}>
      <Skeleton className="h-9 w-64" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-16 rounded-xl" />
      <div className="space-y-3 rounded-xl border border-brand-border bg-card p-4">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}
