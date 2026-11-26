
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CoursePaginationProps {
  page: number;
  totalPages: number;
  totalCourses: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function CoursePagination({
  page,
  totalPages,
  totalCourses,
  pageSize,
  onPageChange,
}: CoursePaginationProps) {
  if (totalCourses === 0) return null;

  return (
    <div className="space-y-5 pt-5">
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="size-9 rounded-lg"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from(
            { length: totalPages },
            (_, index) => index + 1
          ).map((pageNumber) => (
            <Button
              key={pageNumber}
              variant={page === pageNumber ? "default" : "outline"}
              onClick={() => onPageChange(pageNumber)}
              className="size-9 rounded-lg text-xs"
            >
              {pageNumber}
            </Button>
          ))}

          <Button
            variant="outline"
            size="icon"
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className="size-9 rounded-lg"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <p className="text-center text-xs text-brand-text-muted">
        Showing {(page - 1) * pageSize + 1} to{" "}
        {Math.min(page * pageSize, totalCourses)} of {totalCourses} courses
      </p>
    </div>
  );
}
