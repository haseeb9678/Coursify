"use client";

import { useAccessibleMotion } from "@/features/accessibility/hooks/use-accessible-motion";
import Link from "next/link";
import Image from "next/image";

import {
  ArrowRight,
  BookOpen,
  Play,
} from "lucide-react";

import { motion } from "motion/react";

import DashboardCard from "./DashboardCard";
import { LearningCourse } from "@/features/student/types/dashboard.types";


interface ContinueLearningProps {
  courses: LearningCourse[];
}

export default function ContinueLearning({
  courses,
}: ContinueLearningProps) {
  const shouldReduceMotion = useAccessibleMotion();

  return (
    <DashboardCard
      delay={0.3}
      className="xl:col-span-2"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-brand-text">
            Continue learning
          </h2>

          <p className="mt-1 text-sm text-brand-text-muted">
            Pick up where you left off.
          </p>
        </div>

        <Link
          href="/student/my-learning"
          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          View all

          <ArrowRight size={15} />
        </Link>
      </div>

      {courses.length > 0 ? (
        <div className="mt-5 space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="
                group rounded-xl
                border border-brand-border/80
                p-3 transition-colors duration-200
                hover:border-primary/30
                sm:p-4
              "
            >
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Course Thumbnail */}
                <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-soft text-primary sm:size-20">
                  {course.thumbnail ? (
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      sizes="80px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <BookOpen
                      size={28}
                      strokeWidth={1.5}
                    />
                  )}
                </div>

                {/* Course Information */}
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-primary">
                    {course.category}
                  </p>

                  <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-brand-text sm:text-base">
                    {course.title}
                  </h3>

                  <p className="mt-1 truncate text-xs text-brand-text-muted">
                    {course.currentLesson}
                  </p>
                </div>

                <Link
                  href={`/student/courses/${encodeURIComponent(course.id)}`}
                  aria-label={`Continue ${course.title}`}
                  className="
                    flex size-10 shrink-0 items-center
                    justify-center rounded-xl
                    bg-primary text-primary-foreground
                    transition-colors hover:bg-primary/90
                  "
                >
                  <Play size={17} fill="currentColor" />
                </Link>
              </div>

              {/* Course Progress */}
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                  <span className="text-brand-text-muted">
                    {course.completedLessons} of{" "}
                    {course.totalLessons} lessons
                  </span>

                  <span className="font-semibold tabular-nums text-primary">
                    {course.progress}%
                  </span>
                </div>

                <div
                  role="progressbar"
                  aria-label={`${course.title} progress`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={course.progress}
                  className="h-1.5 overflow-hidden rounded-full bg-primary/10"
                >
                  <motion.div
                    initial={{
                      width: shouldReduceMotion
                        ? `${course.progress}%`
                        : 0,
                    }}
                    animate={{
                      width: `${course.progress}%`,
                    }}
                    transition={{
                      duration: shouldReduceMotion
                        ? 0
                        : 0.8,
                      ease: "easeOut",
                    }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
          <BookOpen
            size={32}
            className="text-brand-text-muted"
          />

          <p className="text-sm text-brand-text-muted">
            {`You don't have any courses in progress.`}
          </p>

          <Link
            href="/student/courses"
            className="text-sm font-semibold text-primary"
          >
            Explore courses
          </Link>
        </div>
      )}
    </DashboardCard>
  );
}