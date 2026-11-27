
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import {
  BookOpen,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { CatalogCourse } from "@/features/courses/types/catalog.types";

interface CourseCardProps {
  course: CatalogCourse;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -3 }}
      className="group flex h-full cursor-pointer flex-row overflow-hidden rounded-xl border border-brand-border bg-card text-brand-text shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 sm:flex-col sm:hover:-translate-y-1"
    >
      {/* Image */}
      <Link
        href={`/courses/${course.id}`}
        className="relative block h-auto w-[116px] shrink-0 overflow-hidden bg-brand-page-secondary sm:h-48 sm:w-full"
      >
        {course.image ? (
          <Image
            src={course.image}
            alt={course.title}
            fill
            unoptimized
            sizes="(max-width: 639px) 116px, (max-width: 1023px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-primary" aria-hidden="true">
            <BookOpen className="h-8 w-8" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-70" />

        {/* Category */}
        <Badge className="absolute left-1.5 top-1.5 max-w-[calc(100%-12px)] truncate border border-brand-border/70 bg-card/95 px-2 py-0.5 text-[9px] font-bold text-primary shadow-sm hover:bg-card sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
          {course.category}
        </Badge>

        {/* Free Badge */}
        {course.price === 0 && (
          <Badge className="absolute bottom-1.5 left-1.5 border-0 bg-emerald-500 px-2 py-0.5 text-[9px] text-white hover:bg-emerald-500 sm:bottom-auto sm:left-auto sm:right-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
            Free
          </Badge>
        )}
      </Link>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-3 sm:p-5">
        <div className="space-y-2 sm:space-y-3">

          {/* Title */}
          <Link href={`/courses/${course.id}`}>
            <h3 className="line-clamp-2 text-[12px] font-bold leading-4 text-brand-text transition-colors group-hover:text-primary sm:min-h-12 sm:text-[15px] sm:leading-6">
              {course.title}
            </h3>
          </Link>

          {/* Instructor */}
          <p className="truncate text-[10px] text-brand-text-muted sm:text-xs">
            By {course.instructor}
          </p>

          {/* Course Meta */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-brand-text-muted sm:justify-between sm:gap-2 sm:text-xs">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3 shrink-0 text-primary sm:h-3.5 sm:w-3.5" />
              {course.level}
            </span>
          </div>
          <p className="line-clamp-2 text-[10px] leading-4 text-brand-text-muted sm:text-xs">
            {course.shortDescription}
          </p>
        </div>

        {/* Price */}
        <div className="mt-2 flex items-center justify-between border-t border-brand-border pt-2 sm:mt-5 sm:pt-4">
          <div className="flex flex-row items-baseline gap-2 sm:flex-col sm:gap-0">
            <span className="text-sm font-extrabold text-primary sm:text-lg xl:text-xl">
              {course.price === 0
                ? "Free"
                : new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency: course.currency,
                  }).format(course.price)}
            </span>

            {course.originalPrice > course.price && (
              <span className="text-[10px] text-brand-text-muted line-through sm:text-xs xl:text-sm">
                {new Intl.NumberFormat(undefined, {
                  style: "currency",
                  currency: course.currency,
                }).format(course.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
