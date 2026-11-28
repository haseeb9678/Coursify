import { Skeleton } from "@/components/ui/skeleton";
import { InstructorRowsSkeleton } from "../InstructorPageSkeletons";

export default function InstructorDashboardSkeleton({ overviewOnly = false, showCourseStats = true }: { overviewOnly?: boolean; showCourseStats?: boolean }) {
  return (
    <section
      role="status"
      aria-busy="true"
      aria-label={overviewOnly ? "Loading instructor analytics" : "Loading instructor dashboard"}
      className={overviewOnly ? "space-y-5" : "mx-auto w-full max-w-450 space-y-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"}
    >
      {!overviewOnly && <>
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-16 rounded-xl" />
      </>}
      {Array.from({ length: showCourseStats ? 2 : 1 }, (_, group) => <div key={group} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>)}
      <div className="grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-72 rounded-2xl xl:col-span-2" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
      <div className="rounded-2xl border border-brand-border bg-card p-4"><InstructorRowsSkeleton /></div>
    </section>
  );
}
