
"use client";

import { AnimatePresence, motion } from "motion/react";
import { FilterX, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import CourseCard from "./CourseCard";

import type { CatalogCourse } from "@/features/courses/data/catalog-courses.data";

interface CourseGridProps {
  courses: CatalogCourse[];
  resetFilters: () => void;
  animationKey: string;
}

export default function CourseGrid({
  courses,
  resetFilters,
  animationKey,
}: CourseGridProps) {
  return (
    <AnimatePresence mode="wait">
      {courses.length > 0 ? (
        <motion.div
          key={animationKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
        >
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </motion.div>
      ) : (
        <motion.div
          key="empty-state"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/50 px-5 text-center"
        >
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <FilterX className="h-6 w-6" />
          </div>

          <h3 className="text-lg font-bold text-gray-900">
            No Courses Found
          </h3>

          <p className="mt-2 max-w-sm text-sm text-gray-500">
           {` We couldn't find any courses matching your search or
            filters. Try adjusting your selection.`}
          </p>

          <Button
            onClick={resetFilters}
            className="mt-5 rounded-lg bg-blue-600 hover:bg-blue-700"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
