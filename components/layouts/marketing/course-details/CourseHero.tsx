import Image from "next/image";
import Link from "next/link";
import {
  Award,
  BookOpen,
  ChevronRight,
  Clock3,
  PlayCircle,
  Star,
  Users,
} from "lucide-react";

import type { CourseDetails } from "@/features/courses/data/course-details.data";
import { QuickInfo } from "./CourseDetailUI";

interface CourseHeroProps {
  course: CourseDetails;
  onInstructorClick: () => void;
}

export default function CourseHero({
  course,
  onInstructorClick,
}: CourseHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-brand-border bg-brand-page-secondary">
      <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-primary/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 size-96 rounded-full bg-indigo-400/10 blur-[100px]" />

      <div className="relative px-4 py-9 sm:px-6 xl:px-10 2xl:px-15">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-9">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2 text-xs font-semibold text-brand-text-muted"
            >
              <Link href="/" className="transition-colors hover:text-primary">
                Home
              </Link>

              <ChevronRight size={14} />

              <Link
                href="/courses"
                className="transition-colors hover:text-primary"
              >
                Courses
              </Link>

              <ChevronRight size={14} />

              <span className="text-primary">{course.category}</span>
            </nav>

            <div className="flex flex-wrap items-center gap-2">
              {course.bestseller && (
                <span className="rounded-full bg-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground shadow-sm">
                  Bestseller
                </span>
              )}

              <span className="rounded-full border border-primary/20 bg-background px-3 py-1.5 text-[10px] font-bold text-primary">
                {course.category}
              </span>

              <span className="rounded-full border border-brand-border bg-background px-3 py-1.5 text-[10px] font-semibold text-brand-text-muted">
                Updated {course.updatedAt}
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="max-w-4xl text-2xl font-extrabold leading-tight tracking-tight text-brand-text sm:text-3xl lg:text-4xl xl:text-[42px]">
                {course.title}
              </h1>

              <p className="max-w-3xl text-sm leading-7 text-brand-text-muted sm:text-[15px]">
                {course.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-brand-text">
                  {course.rating.toFixed(1)}
                </span>

                <span className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={14} className="fill-current" />
                  ))}
                </span>

                <span className="text-brand-text-muted">
                  ({course.reviewCount.toLocaleString()} ratings)
                </span>
              </div>

              <span className="hidden h-4 w-px bg-brand-border sm:block" />

              <div className="flex items-center gap-1.5 font-semibold text-brand-text">
                <Users size={15} className="text-primary" />
                {course.students} students enrolled
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="relative size-11 shrink-0 overflow-hidden rounded-full border-2 border-background shadow-sm">
                <Image
                  src={course.instructor.image}
                  alt={course.instructor.name}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-brand-text-muted">
                  Created by
                </p>

                <button
                  type="button"
                  onClick={onInstructorClick}
                  className="text-sm font-bold text-primary hover:underline"
                >
                  {course.instructor.name}
                </button>

                <p className="max-w-md truncate text-[11px] text-brand-text-muted">
                  {course.instructor.role}
                </p>
              </div>
            </div>
          </div>

          <div className="hidden lg:col-span-3 lg:block">
            <div className="rounded-2xl border border-primary/10 bg-background/80 p-5 shadow-sm backdrop-blur-md">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-brand-text">
                <BookOpen size={17} className="text-primary" />
                Course at a glance
              </div>

              <div className="space-y-4">
                <QuickInfo
                  icon={<Clock3 size={16} />}
                  label="Duration"
                  value={course.duration}
                />

                <QuickInfo
                  icon={<PlayCircle size={16} />}
                  label="Lessons"
                  value={`${course.lessonsCount} lessons`}
                />

                <QuickInfo
                  icon={<Award size={16} />}
                  label="Certificate"
                  value={course.certificate ? "Included" : "Not included"}
                />

                <QuickInfo
                  icon={<Users size={16} />}
                  label="Level"
                  value={course.level}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}