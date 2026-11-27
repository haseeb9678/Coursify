
"use client";

import { motion } from "motion/react";
import { Search, X, ChevronRight } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Skeleton } from "@/components/ui/skeleton";

interface CatalogHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  totalCourses: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
}

export default function CatalogHeader({
  search,
  onSearchChange,
  totalCourses,
  page,
  pageSize,
  isLoading,
}: CatalogHeaderProps) {
  const start = totalCourses === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCourses);

  return (
    <section className="relative overflow-hidden border-b border-brand-border bg-brand-page-secondary py-9 sm:py-12">
      <div className="pointer-events-none absolute -right-20 -top-28 size-[440px] rounded-full bg-primary/[0.07] blur-[120px]" />

      <div className="relative px-4 sm:px-6 xl:px-10 2xl:px-15">
        <Breadcrumb className="mb-6">
          <BreadcrumbList className="text-xs sm:text-sm">
            <BreadcrumbItem>
              <BreadcrumbLink
              href="/"
              >
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator>
              <ChevronRight className="h-3.5 w-3.5" />
            </BreadcrumbSeparator>

            <BreadcrumbItem>
              <BreadcrumbLink
              href="/courses"
              >
                Explore Courses
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator>
              <ChevronRight className="h-3.5 w-3.5" />
            </BreadcrumbSeparator>

            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-brand-text">
                All Courses
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-2"
          >
            <h1 className="text-3xl font-extrabold tracking-tight text-brand-text sm:text-4xl">
              Explore All Courses
            </h1>

            {isLoading ? (
              <Skeleton className="h-5 w-44" aria-hidden="true" />
            ) : (
              <p className="text-sm text-brand-text-muted">
                Showing{" "}
                <span className="font-bold text-brand-text">
                  {start}–{end}
                </span>{" "}
                of{" "}
                <span className="font-bold text-brand-text">
                  {totalCourses}
                </span>{" "}
                courses
              </p>
            )}
          </motion.div>

          {/* Search */}
          <div className="relative w-full lg:max-w-[400px]">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-muted" />

            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search courses, skills, instructors..."
              aria-label="Search courses"
              className="h-12 w-full rounded-xl border border-brand-border bg-card pl-11 pr-11 text-sm text-brand-text outline-none transition-all placeholder:text-brand-text-muted focus:border-primary focus:ring-4 focus:ring-primary/10"
            />

            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text-muted hover:text-brand-text"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
