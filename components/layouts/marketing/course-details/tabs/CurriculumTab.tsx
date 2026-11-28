"use client";

import { useAccessibleMotion } from "@/features/accessibility/hooks/use-accessible-motion";

import {
  AnimatePresence,
  motion,
} from "motion/react";

import {
  Award,
  ChevronDown,
  Clock3,
  Lock,
  ChevronsDownUp,
  ChevronsUpDown,
} from "lucide-react";

import type { CourseDetails, CourseLesson } from "@/features/courses/data/course-details.data";
import { ContentIcon } from "@/features/courses/materials/ContentIcon";
import { detectContentType } from "@/features/courses/materials/content-type";

interface CurriculumTabProps {
  course: CourseDetails;
  expandedModules: number[];
  onToggleModule: (index: number) => void;
  onPreviewLesson: (lesson: CourseLesson, trigger: HTMLButtonElement) => void;
}

export default function CurriculumTab({
  course,
  expandedModules,
  onToggleModule,
  onPreviewLesson,
}: CurriculumTabProps) {
  const shouldReduceMotion = useAccessibleMotion();

  const totalLessons = course.modules.reduce(
    (total, module) => total + module.lessons.length,
    0,
  );

  const allExpanded =
    course.modules.length > 0 &&
    course.modules.every((_, index) =>
      expandedModules.includes(index),
    );

  const handleToggleAll = () => {
    course.modules.forEach((_, index) => {
      const isExpanded = expandedModules.includes(index);

      if (allExpanded ? isExpanded : !isExpanded) {
        onToggleModule(index);
      }
    });
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-brand-text sm:text-3xl">
            Course Curriculum
          </h2>

          <p className="mt-1 text-xs text-brand-text-muted sm:text-sm">
            Explore your learning journey, one module at a time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Expand / Collapse All */}
          <button
            type="button"
            onClick={handleToggleAll}
            disabled={course.modules.length === 0}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-3.5 py-2.5 text-[11px] font-bold text-primary transition-all duration-300 hover:border-primary/40 hover:bg-primary/15 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {allExpanded ? (
              <>
                <ChevronsDownUp size={15} />
                Collapse All
              </>
            ) : (
              <>
                <ChevronsUpDown size={15} />
                Expand All
              </>
            )}
          </button>

          {/* Curriculum Stats */}
          <div className="flex items-center gap-3 rounded-xl border border-brand-border bg-card px-4 py-2.5 shadow-sm">
            <div className="text-center">
              <p className="text-lg font-black leading-none text-brand-text">
                {course.modules.length}
              </p>

              <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-brand-text-muted">
                Sections
              </p>
            </div>

            <div className="h-7 w-px bg-brand-border" />

            <div className="text-center">
              <p className="text-lg font-black leading-none text-brand-text">
                {totalLessons}
              </p>

              <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-brand-text-muted">
                Lessons
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Learning Roadmap */}
      <div className="relative space-y-4">
        {course.modules.map((module, index) => {
          const isExpanded = expandedModules.includes(index);
          const isLastModule =
            index === course.modules.length - 1;

          return (
            <div
              key={`${module.title}-${index}`}
              className="relative pl-12 sm:pl-16"
            >
              {/* Roadmap Connecting Line */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-[52px] left-[19px] top-9 w-[2px] sm:-bottom-[60px] sm:left-[27px] sm:top-11"
              >
                <div
                  className={`h-full w-full rounded-full bg-linear-to-b ${
                    isLastModule
                      ? "from-primary/40 via-primary/20 to-amber-500/50"
                      : "from-primary/50 via-primary/30 to-primary/50"
                  }`}
                />
              </div>

              {/* Horizontal Connector */}
              <div
                aria-hidden="true"
                className="absolute left-10 top-9 h-px w-2 bg-primary/30 sm:left-[52px] sm:top-11 sm:w-3"
              />

              {/* Module Number Node */}
              <motion.div
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, scale: 0.8 }
                }
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.3,
                }}
                className={`absolute left-0 top-4 z-10 flex size-10 items-center justify-center rounded-xl border text-xs font-black transition-all duration-300 sm:left-1 sm:top-5 sm:size-12 sm:text-sm ${
                  isExpanded
                    ? "border-primary/40 bg-primary text-primary-foreground shadow-[0_0_0_4px_var(--background),0_4px_15px_-5px_var(--primary)]"
                    : "border-primary/25 bg-card text-primary shadow-[0_0_0_4px_var(--background),0_4px_10px_-5px_var(--primary)]"
                }`}
              >
                {String(index + 1).padStart(2, "0")}
              </motion.div>

              {/* Module Card */}
              <motion.div
                className={`group relative overflow-hidden rounded-2xl border bg-card transition-[border-color,box-shadow] duration-300 ${
                  isExpanded
                    ? "border-primary/35 shadow-[0_12px_35px_-20px_var(--primary)]"
                    : "border-brand-border shadow-sm hover:border-primary/25 hover:shadow-md"
                }`}
              >
                {/* Subtle Decorative Glow */}
                <div
                  className={`pointer-events-none absolute -right-12 -top-16 size-40 rounded-full bg-primary/10 blur-3xl transition-opacity duration-300 ${
                    isExpanded
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-70"
                  }`}
                />

                {/* Module Header */}
                <button
                  type="button"
                  onClick={() => onToggleModule(index)}
                  aria-expanded={isExpanded}
                  className="relative flex w-full cursor-pointer items-center gap-3 px-4 py-4 text-left sm:gap-4 sm:px-5 sm:py-5"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.13em] text-primary">
                      Module {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="mt-1 block text-sm font-extrabold leading-relaxed text-brand-text sm:text-base">
                      {module.title}
                    </span>

                    <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium text-brand-text-muted sm:text-xs">
                      <span>
                        {module.lessons.length} lessons
                      </span>

                      <span className="size-1 rounded-full bg-brand-text-muted/50" />

                      <span className="inline-flex items-center gap-1">
                        <Clock3 size={11} />
                        {module.duration}
                      </span>
                    </span>
                  </span>

                  {/* Expand Indicator */}
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
                      isExpanded
                        ? "rotate-180 border-primary/20 bg-primary/10 text-primary"
                        : "border-brand-border bg-brand-page-secondary text-brand-text-muted group-hover:border-primary/20 group-hover:text-primary"
                    }`}
                  >
                    <ChevronDown size={17} />
                  </span>
                </button>

                {/* Module Lessons */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.3,
                        ease: "easeInOut",
                      }}
                      className="overflow-hidden"
                    >
                      <div className="mx-4 border-t border-brand-border sm:mx-5" />

                      <div className="space-y-1 px-3 py-3 sm:px-4 sm:py-4">
                        {module.lessons.map(
                          (lesson, lessonIndex) => (
                            <motion.div
                              key={`${lesson.title}-${lessonIndex}`}
                              initial={
                                shouldReduceMotion
                                  ? false
                                  : { opacity: 0, y: 6 }
                              }
                              animate={{
                                opacity: 1,
                                y: 0,
                              }}
                              transition={{
                                duration: shouldReduceMotion
                                  ? 0
                                  : 0.2,
                                delay: shouldReduceMotion
                                  ? 0
                                  : Math.min(
                                      lessonIndex * 0.035,
                                      0.2,
                                    ),
                              }}
                              className="group/lesson flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-brand-page-secondary sm:px-3"
                            >
                              {/* Lesson Icon */}
                              <span
                                className={`relative flex size-9 shrink-0 items-center justify-center rounded-xl border ${
                                  lesson.preview
                                    ? "border-primary/15 bg-primary/10 text-primary"
                                    : "border-brand-border bg-brand-page-secondary text-brand-text-muted"
                                }`}
                              >
                                <ContentIcon kind={detectContentType({ type: lesson.type })} size={17} />
                                {!lesson.preview && (
                                  <span className="absolute -bottom-0.5 -right-0.5 rounded border border-brand-border bg-brand-page-secondary p-px">
                                    <Lock size={10} aria-hidden="true" />
                                    <span className="sr-only">Locked</span>
                                  </span>
                                )}
                              </span>

                              {/* Lesson Information */}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold leading-relaxed text-brand-text transition-colors group-hover/lesson:text-primary sm:text-sm">
                                  {index + 1}.{lessonIndex + 1}{" "}
                                  {lesson.title}
                                </p>

                                <p className="mt-1 text-[10px] text-brand-text-muted sm:hidden">
                                  {lesson.duration}
                                </p>
                              </div>

                              {/* Preview Label */}
                              {lesson.preview && lesson.previewLessonId ? <button type="button"
                                onClick={(event) => onPreviewLesson(lesson, event.currentTarget)}
                                className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-ring">
                                {lesson.type === "VIDEO" ? "Play preview" : "Preview"}
                              </button> : lesson.preview && (
                                <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-primary">
                                  Preview
                                </span>
                              )}

                              {/* Lesson Duration */}
                              <span className="hidden shrink-0 text-xs font-medium tabular-nums text-brand-text-muted sm:block">
                                {lesson.duration}
                              </span>
                            </motion.div>
                          ),
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          );
        })}

        {/* Final Roadmap Milestone — Certificate */}
        <div className="relative pl-12 sm:pl-16">
          {/* Horizontal Certificate Connector */}
          <div
            aria-hidden="true"
            className="absolute left-10 top-9 h-px w-2 bg-amber-500/40 sm:left-[52px] sm:top-11 sm:w-3"
          />

          {/* Certificate Roadmap Node */}
          <motion.div
            initial={
              shouldReduceMotion
                ? false
                : { opacity: 0, scale: 0.8 }
            }
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.4,
            }}
            className="absolute left-0 top-4 z-10 flex size-10 items-center justify-center rounded-xl border border-amber-500/35 bg-card text-amber-500 shadow-[0_0_0_4px_var(--background),0_0_16px_-4px_rgba(245,158,11,0.5)] sm:left-1 sm:top-5 sm:size-12"
          >
            <Award
              size={23}
              strokeWidth={1.8}
              className="drop-shadow-[0_0_5px_rgba(245,158,11,0.3)]"
            />
          </motion.div>

          {/* Certificate Card */}
          <motion.div
            initial={
              shouldReduceMotion
                ? false
                : { opacity: 0, y: 8 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.35,
            }}
            className="relative overflow-hidden rounded-2xl border border-amber-500/25 bg-card px-4 py-4 shadow-sm transition-colors duration-300 hover:border-amber-500/40 sm:px-5 sm:py-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-[0.13em] text-amber-600 dark:text-amber-400">
                  Final Milestone
                </span>

                <h3 className="mt-1 text-sm font-extrabold text-brand-text sm:text-base">
                  Certificate of Completion
                </h3>

                <p className="mt-1.5 text-xs leading-relaxed text-brand-text-muted">
                  Complete all course modules to earn your
                  certificate.
                </p>
              </div>

              {/* Certificate Availability */}
              <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-lg border border-brand-border bg-brand-page-secondary px-2.5 py-1.5 text-[10px] font-semibold text-brand-text-muted">
                <Lock size={12} />
                After completion
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
