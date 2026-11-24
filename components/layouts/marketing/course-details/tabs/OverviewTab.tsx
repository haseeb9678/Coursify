
import {
  Check,
  Clock3,
  PlayCircle,
  Users,
  Target,
  BookOpen,
  Layers3,
  ChartNoAxesColumnIncreasing,
} from "lucide-react";

import type { CourseDetails } from "@/features/courses/data/course-details.data";

export default function OverviewTab({
  course,
}: {
  course: CourseDetails;
}) {
  const stats = [
    {
      icon: Clock3,
      label: "Course Duration",
      value: course.duration,
    },
    {
      icon: PlayCircle,
      label: "Total Lessons",
      value: String(course.lessonsCount),
    },
    {
      icon: Users,
      label: "Enrolled Students",
      value: course.students,
    },
    {
      icon: ChartNoAxesColumnIncreasing,
      label: "Skill Level",
      value: course.level,
    },
  ];

  return (
    <div className="space-y-9 sm:space-y-10">
      {/* Learning Objectives */}
      <section className="relative isolate overflow-hidden rounded-2xl border border-brand-border bg-card p-5 shadow-sm sm:rounded-3xl sm:p-7">
        {/* Background Decorations */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-primary/[0.07] blur-3xl"
        />

        <Target
          aria-hidden="true"
          strokeWidth={0.8}
          className="pointer-events-none absolute -right-5 -top-8 size-40 rotate-[-15deg] text-primary/[0.04] sm:size-52"
        />

        {/* Section Header */}
        <div className="relative mb-6 flex items-center gap-4 sm:mb-7">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-linear-to-br from-primary/15 to-primary/5 text-primary shadow-[0_5px_0_-2px_var(--primary)] sm:size-14">
            <Target size={25} strokeWidth={1.8} />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              Learning Objectives
            </span>

            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-brand-text sm:text-2xl">
              What you&apos;ll learn
            </h2>
          </div>
        </div>

        {/* Learning Outcomes */}
        <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2">
          {course.learningOutcomes.map((outcome, index) => (
            <div
              key={`${outcome}-${index}`}
              className="group flex items-start gap-3 rounded-xl border border-transparent bg-brand-page-secondary/60 p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/15 hover:bg-card hover:shadow-sm motion-reduce:transform-none sm:p-4"
            >
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <Check size={14} strokeWidth={2.8} />
              </span>

              <p className="text-[13px] font-medium leading-relaxed text-brand-text-muted transition-colors group-hover:text-brand-text sm:text-sm">
                {outcome}
              </p>
            </div>
          ))}
        </div>

        {course.learningOutcomes.length === 0 && (
          <p className="text-sm text-brand-text-muted">
            Learning objectives will be available soon.
          </p>
        )}

        {/* Section Footer */}
        {course.learningOutcomes.length > 0 && (
          <div className="relative mt-6 flex items-center gap-2 border-t border-brand-border pt-4">
            <Layers3 size={15} className="text-primary" />

            <p className="text-xs font-medium text-brand-text-muted">
              <span className="font-bold text-brand-text">
                {course.learningOutcomes.length} learning objectives
              </span>{" "}
              designed to develop your skills.
            </p>
          </div>
        )}
      </section>

      {/* Course Description */}
      <section className="space-y-5">
        {/* Section Header */}
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
            <BookOpen size={21} strokeWidth={1.8} />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              About this course
            </span>

            <h2 className="mt-0.5 text-xl font-extrabold tracking-tight text-brand-text sm:text-2xl">
              Course Description
            </h2>
          </div>
        </div>

        {/* Description Content */}
        <div className="space-y-4 border-l-2 border-primary/20 pl-4 sm:pl-5">
          <p className="whitespace-pre-line text-sm font-normal leading-[1.9] text-brand-text-muted sm:text-[15px]">
            {course.description}
          </p>

          <p className="text-sm font-normal leading-[1.9] text-brand-text-muted sm:text-[15px]">
            Throughout the learning experience, you will work on
            practical exercises, explore real-world workflows, and
            develop the confidence to apply your skills to
            professional projects.
          </p>
        </div>
      </section>

      {/* Course Statistics */}
      <section className="space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
            At a glance
          </span>

          <h2 className="mt-1 text-lg font-extrabold tracking-tight text-brand-text sm:text-xl">
            Course Highlights
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {stats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="group relative isolate flex min-w-0 flex-col overflow-hidden rounded-2xl border border-brand-border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_12px_30px_-18px_var(--primary)] motion-reduce:transform-none sm:p-5"
            >
              {/* Decorative Glow */}
              <div className="pointer-events-none absolute -right-10 -top-10 size-24 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

              {/* Background Watermark */}
              <Icon
                aria-hidden="true"
                strokeWidth={1}
                className="pointer-events-none absolute -bottom-3 -right-3 size-20 -rotate-12 text-primary/[0.04] transition-transform duration-500 group-hover:rotate-0 motion-reduce:transform-none"
              />

              {/* Stat Icon */}
              <div className="relative flex size-10 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md">
                <Icon size={20} strokeWidth={1.8} />
              </div>

              {/* Stat Value */}
              <p className="relative mt-4 break-words text-xl font-black leading-tight tracking-tight text-brand-text sm:text-2xl">
                {value}
              </p>

              {/* Stat Label */}
              <p className="relative mt-1.5 text-[11px] font-medium leading-relaxed text-brand-text-muted sm:text-xs">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
