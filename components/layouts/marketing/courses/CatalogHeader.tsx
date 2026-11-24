
"use client";

import Link from "next/link";
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

interface CatalogHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  totalCourses: number;
  page: number;
  pageSize: number;
}

export default function CatalogHeader({
  search,
  onSearchChange,
  totalCourses,
  page,
  pageSize,
}: CatalogHeaderProps) {
  const start = totalCourses === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCourses);

  return (
    <section className="relative overflow-hidden border-b border-gray-200 bg-[#FAFBFD] py-9 sm:py-12">
      <div className="pointer-events-none absolute -right-20 -top-28 size-[440px] rounded-full bg-blue-500/[0.07] blur-[120px]" />

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
              <BreadcrumbPage className="font-semibold text-gray-900">
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
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Explore All Courses
            </h1>

            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-bold text-gray-900">
                {start}–{end}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-900">
                {totalCourses}
              </span>{" "}
              courses
            </p>
          </motion.div>

          {/* Search */}
          <div className="relative w-full lg:max-w-[400px]">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search courses, skills, instructors..."
              className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-11 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />

            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900"
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
