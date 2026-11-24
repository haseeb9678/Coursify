export default function DashboardSkeleton() {
  const skeletonClass =
    "animate-pulse motion-reduce:animate-none bg-gray-200 dark:bg-gray-800";

  return (
    <section
      role="status"
      aria-busy="true"
      aria-label="Loading student dashboard"
      className="mx-auto w-full max-w-450 space-y-5 px-4 py-6 sm:px-6 lg:space-y-6 lg:px-8 lg:py-8"
    >
      {/* Welcome Banner */}
      <div
        className={`h-44 rounded-2xl border border-brand-border ${skeletonClass}`}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="space-y-4 rounded-2xl border border-brand-border bg-card p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div
                className={`h-4 w-28 rounded-md ${skeletonClass}`}
              />

              <div
                className={`size-10 shrink-0 rounded-xl ${skeletonClass}`}
              />
            </div>

            <div
              className={`h-8 w-16 rounded-md ${skeletonClass}`}
            />

            <div
              className={`h-3 w-32 rounded-md ${skeletonClass}`}
            />
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div
          className={`h-96 rounded-2xl border border-brand-border xl:col-span-2 ${skeletonClass}`}
        />

        <div
          className={`h-96 rounded-2xl border border-brand-border ${skeletonClass}`}
        />
      </div>

      {/* Learning Progress */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div
          className={`h-80 rounded-2xl border border-brand-border xl:col-span-2 ${skeletonClass}`}
        />

        <div
          className={`h-80 rounded-2xl border border-brand-border ${skeletonClass}`}
        />
      </div>
    </section>
  );
}