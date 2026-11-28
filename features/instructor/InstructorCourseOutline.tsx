"use client";

import { Accordion } from "@base-ui/react/accordion";
import { ArrowUpRight, BookOpen, ChevronDown, ChevronsDownUp, ChevronsUpDown, Clock3, Eye } from "lucide-react";
import { useState } from "react";
import AdminEmptyState from "@/components/layouts/admin/shared/AdminEmptyState";
import { InstructorRowsSkeleton } from "@/components/layouts/instructor/InstructorPageSkeletons";
import { Button } from "@/components/ui/button";
import { useAccessibleMotion } from "@/features/accessibility/hooks/use-accessible-motion";
import { mapLesson } from "@/features/admin/api/learning.api";
import { useAdminCurriculum } from "@/features/admin/hooks/use-admin-learning";
import type { SectionRecord } from "@/features/admin/types/learning-api.types";
import type { CourseLesson } from "@/features/admin/types/learning.types";
import { formatLearningDuration } from "@/features/admin/utils/learning.utils";
import { ContentIcon } from "@/features/courses/materials/ContentIcon";
import { detectContentType } from "@/features/courses/materials/content-type";
import { cn } from "@/lib/utils";
import InstructorLessonDialog from "./InstructorLessonDialog";
import { QueryPanel, WorkspaceLink } from "./InstructorUI";

const lessonTypeLabel = { VIDEO: "Video", TEXT: "Reading", PDF: "PDF" } as const;

function lessonCount(count: number) {
  return `${count} ${count === 1 ? "lesson" : "lessons"}`;
}

function CurriculumTree({ sections, onViewLesson }: {
  sections: SectionRecord[];
  onViewLesson: (lesson: CourseLesson) => void;
}) {
  const reduceMotion = useAccessibleMotion();
  const [expanded, setExpanded] = useState(() => sections[0] ? [sections[0].id] : []);
  const allExpanded = sections.every((section) => expanded.includes(section.id));
  const totalLessons = sections.reduce((total, section) => total + section.lessons.length, 0);

  if (!sections.length) {
    return <div className="rounded-2xl border border-dashed border-brand-border bg-card">
      <AdminEmptyState title="No modules yet" description="Add your first module in the curriculum builder to start organizing lessons." />
    </div>;
  }

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="flex items-center gap-2 text-sm font-medium text-brand-text-muted">
        <BookOpen size={16} aria-hidden="true" className="text-primary" />
        {sections.length} {sections.length === 1 ? "module" : "modules"} · {lessonCount(totalLessons)}
      </p>
      <Button type="button" variant="outline" size="sm" onClick={() => setExpanded(allExpanded ? [] : sections.map(({ id }) => id))}>
        {allExpanded ? <ChevronsDownUp aria-hidden="true" /> : <ChevronsUpDown aria-hidden="true" />}
        {allExpanded ? "Collapse all" : "Expand all"}
      </Button>
    </div>

    <Accordion.Root value={expanded} onValueChange={setExpanded} multiple className="space-y-4">
      {sections.map((section, index) => {
        const duration = section.lessons.reduce((total, lesson) => total + (lesson.durationSeconds ?? 0), 0);

        return <Accordion.Item key={section.id} value={section.id} className="group/module relative pl-12 sm:pl-16">
          {index < sections.length - 1 && <span aria-hidden="true" className="pointer-events-none absolute -bottom-10 left-[17px] top-9 w-px bg-primary/30 sm:left-[21px]" />}
          <span aria-hidden="true" className="pointer-events-none absolute left-9 top-8 w-3 border-t border-primary/30 sm:left-11 sm:top-9 sm:w-5" />
          <span aria-hidden="true" className={cn("pointer-events-none absolute left-0 top-3.5 z-10 grid size-9 place-items-center rounded-xl border border-primary/25 bg-card text-xs font-bold tabular-nums text-primary shadow-sm group-data-open/module:border-primary group-data-open/module:bg-primary group-data-open/module:text-primary-foreground sm:size-11 sm:text-sm", !reduceMotion && "transition-colors duration-300")}>
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className={cn("overflow-hidden rounded-2xl border border-brand-border bg-card shadow-sm group-data-open/module:border-primary/30", !reduceMotion && "transition-[box-shadow,border-color] duration-300 group-data-open/module:shadow-md")}>
            <Accordion.Header render={<h3 />}>
              <Accordion.Trigger className="group/trigger flex min-h-17 w-full cursor-pointer items-center gap-3 px-3 py-3.5 text-left outline-offset-[-3px] focus-visible:outline-2 focus-visible:outline-ring data-panel-open:bg-primary/5 sm:gap-4 sm:px-5 sm:py-4">
                <span className="min-w-0 flex-1 space-y-1.5">
                  <span className="block wrap-break-word text-sm font-semibold text-brand-text sm:text-base">{section.title}</span>
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-normal text-brand-text-muted">
                    <span>{lessonCount(section.lessons.length)}</span>
                    {duration > 0 && <span className="inline-flex items-center gap-1"><Clock3 size={13} aria-hidden="true" />{formatLearningDuration(duration)}</span>}
                  </span>
                </span>
                <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-brand-border bg-card text-brand-text-muted group-data-panel-open/trigger:border-primary/20 group-data-panel-open/trigger:text-primary">
                  <ChevronDown size={16} aria-hidden="true" className={cn("group-data-panel-open/trigger:rotate-180", !reduceMotion && "transition-transform duration-300")} />
                </span>
              </Accordion.Trigger>
            </Accordion.Header>

            <Accordion.Panel className={cn("h-(--accordion-panel-height) overflow-hidden", !reduceMotion && "transition-[height,opacity] duration-300 ease-in-out data-starting-style:h-0 data-starting-style:opacity-0 data-ending-style:h-0 data-ending-style:opacity-0")}>
              <div className="space-y-3 border-t border-brand-border px-3 py-3 sm:px-5 sm:py-4">
                {section.description && <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-brand-text-muted">{section.description}</p>}
                {section.lessons.length ? <ol className="ml-2 space-y-1 border-l border-brand-border pl-2 sm:ml-3 sm:pl-3">
                  {section.lessons.map((lesson) => <li key={lesson.id} className="relative">
                    <span aria-hidden="true" className="absolute -left-2 top-[1.7rem] w-2 border-t border-brand-border sm:-left-3 sm:w-3" />
                    <button type="button" aria-label={`View lesson ${lesson.title}`} onClick={() => onViewLesson(mapLesson(lesson))}
                      className="group/lesson flex w-full cursor-pointer items-start gap-2 rounded-xl p-2 text-left transition-colors hover:bg-primary/5 focus-visible:ring-2 focus-visible:ring-ring sm:items-center sm:gap-3 sm:p-2.5">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-primary/10 bg-brand-soft text-primary">
                        <ContentIcon kind={detectContentType(lesson)} size={17} />
                      </span>
                      <span className="min-w-0 flex-1 space-y-1">
                        <span className="block wrap-break-word text-sm font-medium text-brand-text group-hover/lesson:text-primary">{lesson.title}</span>
                        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-brand-text-muted">
                          <span>{lessonTypeLabel[lesson.type]}</span>
                          {!!lesson.durationSeconds && <span className="tabular-nums">{formatLearningDuration(lesson.durationSeconds)}</span>}
                          {lesson.isPreview && <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">Free preview</span>}
                        </span>
                      </span>
                      <Eye size={16} aria-hidden="true" className="mt-2 shrink-0 text-brand-text-muted group-hover/lesson:text-primary sm:mt-0" />
                    </button>
                  </li>)}
                </ol> : <p className="rounded-lg bg-muted/60 p-3 text-sm text-brand-text-muted">No lessons in this module yet.</p>}
              </div>
            </Accordion.Panel>
          </div>
        </Accordion.Item>;
      })}
    </Accordion.Root>
  </div>;
}

export default function InstructorCourseOutline({ courseId }: { courseId: string }) {
  const query = useAdminCurriculum(courseId);
  const [lesson, setLesson] = useState<CourseLesson | null>(null);

  return <section aria-labelledby="instructor-course-outline" className="space-y-5">
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="space-y-1">
        <h2 id="instructor-course-outline" className="text-xl font-bold tracking-tight text-brand-text sm:text-2xl">Course curriculum</h2>
        <p className="text-sm text-brand-text-muted">Explore modules and preview lessons from this outline.</p>
      </div>
      <WorkspaceLink href={`/instructor/courses/${courseId}/curriculum`}>
        Manage curriculum <ArrowUpRight size={16} aria-hidden="true" />
      </WorkspaceLink>
    </header>
    <QueryPanel query={query} fallback={<div className="pl-12 sm:pl-16"><InstructorRowsSkeleton /></div>}>
      {({ sections }) => <CurriculumTree sections={sections} onViewLesson={setLesson} />}
    </QueryPanel>
    <InstructorLessonDialog courseId={courseId} lesson={lesson} onClose={() => setLesson(null)} />
  </section>;
}
