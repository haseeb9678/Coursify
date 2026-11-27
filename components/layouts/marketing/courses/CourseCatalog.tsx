
"use client";

import { AlertCircle, GraduationCap } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { CatalogCourseGridSkeleton } from "../MarketingCourseSkeletons";

import CourseFilters from "./CourseFilters";
import CatalogHeader from "./CatalogHeader";
import CourseToolbar from "./CourseToolbar";
import CourseGrid from "./CourseGrid";
import CoursePagination from "./CoursePagination";

import useCourseCatalog from "@/features/courses/hooks/useCourseCatalog";

export default function CourseCatalogClient() {
  const {
    search,
    setSearch,
    sort,
    setSort,
    page,
    setPage,
    filters,
    categoryOptions,
    updateFilter,
    resetFilters,
    removeFilter,
    paginatedCourses,
    totalPages,
    activeFilters,
    activeFilterCount,
    pageSize,
    totalCourses,
    isLoading,
    isError,
    error,
    retry,
  } = useCourseCatalog();

  const handleSort = (value: string | null) => {
    if (!value) return;
    setSort(value);
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <CatalogHeader
        search={search}
        onSearchChange={setSearch}
        totalCourses={totalCourses}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
      />

      <section className="py-9 sm:py-12">
        <div className="px-4 sm:px-6 xl:px-10 2xl:px-15">
          <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-12">

            {/* Desktop Sidebar */}
            <aside className="sticky top-24 hidden rounded-xl border border-brand-border bg-card p-5 shadow-sm lg:col-span-3 lg:block">
              <CourseFilters
                filters={filters}
                categoryOptions={categoryOptions}
                onUpdateFilter={updateFilter}
                onReset={resetFilters}
              />
            </aside>

            {/* Main Content */}
            <div className="min-w-0 space-y-6 lg:col-span-9">
              <CourseToolbar
                filters={filters}
                categoryOptions={categoryOptions}
                activeFilters={activeFilters}
                activeFilterCount={activeFilterCount}
                sort={sort}
                totalCourses={totalCourses}
                onSortChange={handleSort}
                onUpdateFilter={updateFilter}
                onReset={resetFilters}
                onRemoveFilter={removeFilter}
              />

              {/* Results */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-brand-text-muted">
                  Browse our available learning programs
                </p>

                {isLoading ? (
                  <Skeleton className="h-4 w-20" aria-hidden="true" />
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-text-muted">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    {totalCourses} Courses
                  </span>
                )}
              </div>

              {isLoading ? (
                <CatalogCourseGridSkeleton count={pageSize} />
              ) : isError ? (
                <div
                  className="flex min-h-[350px] flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-card px-5 text-center"
                  role="alert"
                >
                  <AlertCircle className="h-6 w-6 text-destructive" />
                  <p className="text-sm text-brand-text">
                    {error instanceof Error
                      ? error.message
                      : "Courses could not be loaded."}
                  </p>
                  <button
                    type="button"
                    onClick={retry}
                    className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <CourseGrid
                  courses={paginatedCourses}
                  resetFilters={resetFilters}
                  animationKey={`${page}-${search}-${sort}-${JSON.stringify(filters)}`}
                />
              )}

              <CoursePagination
                page={page}
                totalPages={totalPages}
                totalCourses={totalCourses}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
