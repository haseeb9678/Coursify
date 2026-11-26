
"use client";

import { GraduationCap } from "lucide-react";

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
    updateFilter,
    updateRating,
    updateCertificate,
    resetFilters,
    removeFilter,
    filteredCourses,
    paginatedCourses,
    totalPages,
    activeFilters,
    activeFilterCount,
    pageSize,
  } = useCourseCatalog();

  const handleSearch = (value: string | null) => {
    if(!value) return
    setSearch(value);
    setPage(1);
  };

  const handleSort = (value: string | null) => {
    if(!value) return
    setSort(value);
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <CatalogHeader
        search={search}
        onSearchChange={handleSearch}
        totalCourses={filteredCourses.length}
        page={page}
        pageSize={pageSize}
      />

      <section className="py-9 sm:py-12">
        <div className="px-4 sm:px-6 xl:px-10 2xl:px-15">
          <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-12">

            {/* Desktop Sidebar */}
            <aside className="sticky top-24 hidden rounded-xl border border-brand-border bg-card p-5 shadow-sm lg:col-span-3 lg:block">
              <CourseFilters
                filters={filters}
                onUpdateFilter={updateFilter}
                onRatingChange={updateRating}
                onCertificateChange={updateCertificate}
                onReset={resetFilters}
              />
            </aside>

            {/* Main Content */}
            <div className="min-w-0 space-y-6 lg:col-span-9">
              <CourseToolbar
                filters={filters}
                activeFilters={activeFilters}
                activeFilterCount={activeFilterCount}
                sort={sort}
                totalCourses={filteredCourses.length}
                onSortChange={handleSort}
                onUpdateFilter={updateFilter}
                onRatingChange={updateRating}
                onCertificateChange={updateCertificate}
                onReset={resetFilters}
                onRemoveFilter={removeFilter}
              />

              {/* Results */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-brand-text-muted">
                  Browse our available learning programs
                </p>

                <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-text-muted">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  {filteredCourses.length} Courses
                </span>
              </div>

              <CourseGrid
                courses={paginatedCourses}
                resetFilters={resetFilters}
                animationKey={`${page}-${search}-${sort}-${JSON.stringify(filters)}`}
              />

              <CoursePagination
                page={page}
                totalPages={totalPages}
                totalCourses={filteredCourses.length}
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
