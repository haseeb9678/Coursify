"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronsDownUp, ChevronsUpDown, FileText, ListVideo, Play, ScrollText } from "lucide-react";
import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatLearningDuration } from "@/features/admin/utils/learning.utils";
import type { LearningContent } from "./commerce.types";

export const lessonTypes = {
  VIDEO: { label: "Video", icon: Play },
  TEXT: { label: "Text", icon: ScrollText },
  PDF: { label: "PDF", icon: FileText },
};

export default function StudentCourseModules({ sections, lessonCount, activeLesson, onSelect }: {
  sections: LearningContent["sections"];
  lessonCount: number;
  activeLesson: string;
  onSelect: (id: string) => void;
}) {
  const [expandedModules, setExpandedModules] = useState(() =>
    sections.filter((section) => section.lessons.some(({ id }) => id === activeLesson)).map(({ id }) => id),
  );
  const allExpanded = sections.every(({ id }) => expandedModules.includes(id));

  return (
    <nav id="student-course-content" tabIndex={-1} aria-labelledby="student-course-content-heading"
      className="min-w-0 scroll-mt-24 rounded-2xl border border-brand-border bg-card shadow-sm xl:sticky xl:top-24">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border p-4 sm:px-5">
        <div className="flex items-center gap-2.5">
          <ListVideo className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h2 id="student-course-content-heading" className="font-extrabold text-brand-text">Course content</h2>
            <p className="text-xs text-brand-text-muted">
              {sections.length} {sections.length === 1 ? "module" : "modules"} · {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
            </p>
          </div>
        </div>
        {sections.length > 1 && <Button type="button" variant="outline" size="sm"
          onClick={() => setExpandedModules(allExpanded ? [] : sections.map(({ id }) => id))}>
          {allExpanded ? <ChevronsDownUp aria-hidden="true" /> : <ChevronsUpDown aria-hidden="true" />}
          {allExpanded ? "Collapse all" : "Expand all"}
        </Button>}
      </div>
      <div className="space-y-3 p-3 sm:p-4 xl:max-h-[calc(100dvh-11rem)] xl:overflow-y-auto">
        {sections.map((section, index) => {
          const open = expandedModules.includes(section.id);
          const containsActive = section.lessons.some(({ id }) => id === activeLesson);
          const bodyId = `student-module-${section.id}`;
          return (
            <section key={section.id} className={cn("rounded-xl border border-brand-border", containsActive && "border-primary/30")}>
              <h3>
                <button type="button" aria-expanded={open} aria-controls={bodyId}
                  onClick={() => setExpandedModules((previous) => open ? previous.filter((id) => id !== section.id) : [...previous, section.id])}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-brand-soft/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg border border-brand-border bg-brand-page-secondary text-xs font-bold text-brand-text-muted",
                    containsActive && "border-brand-soft-border bg-brand-soft text-primary")}>
                    <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block wrap-break-word text-sm font-bold leading-snug text-brand-text">{section.title}</span>
                    <span className="block pt-0.5 text-xs font-normal text-brand-text-muted">
                      {section.lessons.length} {section.lessons.length === 1 ? "lesson" : "lessons"}
                    </span>
                  </span>
                  <ChevronDown className={cn("size-4 shrink-0 text-brand-text-muted motion-safe:transition-transform", open && "rotate-180")} aria-hidden="true" />
                </button>
              </h3>
              <div id={bodyId} hidden={!open} className="border-t border-brand-border p-1.5">
                {section.lessons.length === 0 ? <p className="flex gap-2 px-2 py-3 text-xs text-brand-text-muted">
                  <BookOpen className="size-4" aria-hidden="true" /> No lessons in this module
                </p> : <ul className="space-y-1">
                  {section.lessons.map((lesson) => {
                    const current = lesson.id === activeLesson;
                    const { icon: Icon, label } = lessonTypes[lesson.type];
                    return <li key={lesson.id}>
                      <Button type="button" variant="ghost" aria-current={current ? "true" : undefined}
                        className={cn("h-auto min-h-11 w-full justify-start gap-2.5 rounded-lg px-2 py-1.5 text-left whitespace-normal hover:bg-brand-page-secondary",
                          current && "bg-brand-soft text-primary hover:bg-brand-soft")}
                        onClick={() => onSelect(lesson.id)}>
                        <Icon className="size-4 shrink-0" aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                          <span className="block wrap-break-word text-xs font-semibold leading-snug sm:text-[13px]">{lesson.title}</span>
                          <span className="block pt-0.5 text-xs font-normal text-brand-text-muted">{label}</span>
                        </span>
                        {lesson.durationSeconds != null && lesson.durationSeconds > 0 && (
                          <Badge variant="outline">{formatLearningDuration(lesson.durationSeconds)}</Badge>
                        )}
                      </Button>
                    </li>;
                  })}
                </ul>}
              </div>
            </section>
          );
        })}
      </div>
    </nav>
  );
}
