"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  Clock3,
  FileText,
  Film,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminConfirmDialog from "@/components/layouts/admin/shared/AdminConfirmDialog";
import AdminDialog from "@/components/layouts/admin/shared/AdminDialog";
import AdminErrorState from "@/components/layouts/admin/shared/AdminErrorState";
import AdminPageHeader from "@/components/layouts/admin/shared/AdminPageHeader";
import AdminStatsGrid from "@/components/layouts/admin/shared/AdminStatsGrid";
import CourseStatusBadge from "@/components/layouts/admin/courses/CourseStatusBadge";
import LearningSampleNotice from "@/components/layouts/admin/learning/LearningSampleNotice";
import { useLearningDemoStore } from "@/features/admin/store/learning-demo.store";
import type {
  CourseLesson,
  CourseSection,
  LessonInput,
  LessonResourceType,
  LessonType,
  SectionInput,
} from "@/features/admin/types/learning.types";
import {
  formatLearningDuration,
  getCurriculumStats,
} from "@/features/admin/utils/learning.utils";
import {
  lessonSchema,
  sectionSchema,
} from "@/features/admin/schemas/learning.schemas";

type SectionDraft = { id: string | null } & SectionInput;
type LessonDraft = {
  id: string | null;
  sectionId: string;
  title: string;
  description: string;
  type: LessonType;
  durationMinutes: string;
  isPreview: boolean;
  content: string;
  mediaUrl: string;
  resources: LessonInput["resources"];
};
type PendingDelete =
  | { kind: "section"; section: CourseSection }
  | { kind: "lesson"; lesson: CourseLesson }
  | null;

const emptyLessonDraft = (sectionId: string): LessonDraft => ({
  id: null,
  sectionId,
  title: "",
  description: "",
  type: "VIDEO",
  durationMinutes: "",
  isPreview: false,
  content: "",
  mediaUrl: "",
  resources: [],
});

export default function CurriculumBuilderClient({
  courseId,
}: {
  courseId: string;
}) {
  const router = useRouter();
  const course = useLearningDemoStore((state) =>
    state.courses.find((item) => item.id === courseId),
  );
  const allSections = useLearningDemoStore((state) => state.sections);
  const allLessons = useLearningDemoStore((state) => state.lessons);
  const addSection = useLearningDemoStore((state) => state.addSection);
  const updateSection = useLearningDemoStore((state) => state.updateSection);
  const deleteSection = useLearningDemoStore((state) => state.deleteSection);
  const moveSection = useLearningDemoStore((state) => state.moveSection);
  const addLesson = useLearningDemoStore((state) => state.addLesson);
  const updateLesson = useLearningDemoStore((state) => state.updateLesson);
  const deleteLesson = useLearningDemoStore((state) => state.deleteLesson);
  const moveLesson = useLearningDemoStore((state) => state.moveLesson);
  const [sectionDraft, setSectionDraft] = useState<SectionDraft | null>(null);
  const [lessonDraft, setLessonDraft] = useState<LessonDraft | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [formError, setFormError] = useState("");
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const sections = useMemo(
    () =>
      allSections
        .filter((section) => section.courseId === courseId)
        .sort((a, b) => a.position - b.position),
    [allSections, courseId],
  );
  const sectionIds = useMemo(
    () => new Set(sections.map((section) => section.id)),
    [sections],
  );
  const lessons = useMemo(
    () =>
      allLessons
        .filter((lesson) => sectionIds.has(lesson.sectionId))
        .sort((a, b) => a.position - b.position),
    [allLessons, sectionIds],
  );
  const stats = getCurriculumStats(sections, lessons);
  const isReadOnly = course?.status === "ARCHIVED";

  if (!course) {
    return (
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8">
        <AdminErrorState
          title="Course not found"
          description="This sample course may have been removed or its ID is invalid."
        />
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/courses")}
          >
            Back to courses
          </Button>
        </div>
      </main>
    );
  }

  const wasReviewed = course.status !== "DRAFT";
  const showSaved = (message: string) => {
    toast.success(
      wasReviewed
        ? `${message} The course returned to draft and must be reviewed again.`
        : message,
    );
  };
  const openNewSection = () => {
    setFormError("");
    setSectionDraft({ id: null, title: "", description: "" });
  };
  const openEditSection = (section: CourseSection) => {
    setFormError("");
    setSectionDraft({
      id: section.id,
      title: section.title,
      description: section.description,
    });
  };
  const saveSection = () => {
    if (!sectionDraft) return;
    const parsed = sectionSchema.safeParse({
      title: sectionDraft.title,
      description: sectionDraft.description,
    });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Check the section fields.");
      return;
    }
    if (sectionDraft.id) {
      const saved = updateSection(sectionDraft.id, parsed.data);
      if (!saved) {
        setFormError("This section is no longer available.");
        return;
      }
      showSaved("Section updated in sample data.");
    } else {
      addSection(course.id, parsed.data);
      showSaved("Section added to sample data.");
    }
    setSectionDraft(null);
    setFormError("");
  };

  const openNewLesson = (sectionId: string) => {
    setFormError("");
    setLessonDraft(emptyLessonDraft(sectionId));
  };
  const openEditLesson = (lesson: CourseLesson) => {
    setFormError("");
    setLessonDraft({
      id: lesson.id,
      sectionId: lesson.sectionId,
      title: lesson.title,
      description: lesson.description,
      type: lesson.type,
      durationMinutes:
        lesson.durationSeconds === null
          ? ""
          : String(Math.round(lesson.durationSeconds / 60)),
      isPreview: lesson.isPreview,
      content: lesson.content,
      mediaUrl: lesson.mediaUrl,
      resources: lesson.resources.map(({ title, type, url }) => ({
        title,
        type,
        url,
      })),
    });
  };
  const saveLesson = () => {
    if (!lessonDraft) return;
    const minutes = lessonDraft.durationMinutes.trim()
      ? Number(lessonDraft.durationMinutes)
      : null;
    if (
      minutes !== null &&
      (!Number.isInteger(minutes) || minutes < 1 || minutes > 6000)
    ) {
      setFormError("Duration must be a whole number between 1 and 6000 minutes.");
      return;
    }
    const input: LessonInput = {
      title: lessonDraft.title,
      description: lessonDraft.description,
      type: lessonDraft.type,
      durationSeconds: minutes === null ? null : minutes * 60,
      isPreview: lessonDraft.isPreview,
      content: lessonDraft.content,
      mediaUrl: lessonDraft.mediaUrl,
      resources: lessonDraft.resources,
    };
    const parsed = lessonSchema.safeParse(input);
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Check the lesson fields.");
      return;
    }
    if (lessonDraft.id) {
      const saved = updateLesson(lessonDraft.id, parsed.data);
      if (!saved) {
        setFormError("This lesson is no longer available.");
        return;
      }
      showSaved("Lesson updated in sample data.");
    } else {
      addLesson(lessonDraft.sectionId, parsed.data);
      showSaved("Lesson added to sample data.");
    }
    setLessonDraft(null);
    setFormError("");
  };

  const selectPdf = (file: File | undefined) => {
    if (!file || !lessonDraft) return;
    if (file.type !== "application/pdf") {
      setFormError("Choose a PDF file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Choose a PDF smaller than 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") {
        setFormError("The PDF preview could not be read.");
        return;
      }
      const matchingPdf = lessonDraft.resources.findIndex(
        (resource) => resource.type === "PDF",
      );
      const nextResources = [...lessonDraft.resources];
      const resource = {
        title: file.name,
        type: "PDF" as const,
        url: dataUrl,
      };
      if (matchingPdf < 0) nextResources.push(resource);
      else nextResources[matchingPdf] = resource;
      setLessonDraft((current) =>
        current ? { ...current, mediaUrl: dataUrl, resources: nextResources } : current,
      );
      setFormError("");
    };
    reader.onerror = () => setFormError("The PDF preview could not be read.");
    reader.readAsDataURL(file);
  };

  const addResource = () => {
    setLessonDraft((current) =>
      current
        ? {
            ...current,
            resources: [
              ...current.resources,
              { title: "", type: "LINK", url: "" },
            ],
          }
        : current,
    );
  };
  const updateResource = (
    index: number,
    key: "title" | "type" | "url",
    value: string | LessonResourceType,
  ) => {
    setLessonDraft((current) => {
      if (!current) return current;
      const resources = current.resources.map((resource, resourceIndex) =>
        resourceIndex === index
          ? { ...resource, [key]: value }
          : resource,
      );
      return { ...current, resources };
    });
  };
  const confirmDelete = () => {
    if (!pendingDelete) return;
    const removed =
      pendingDelete.kind === "section"
        ? deleteSection(pendingDelete.section.id)
        : deleteLesson(pendingDelete.lesson.id);
    if (!removed) {
      toast.error(
        pendingDelete.kind === "section"
          ? "Delete the section's lessons before removing the section."
          : "This lesson could not be removed.",
      );
      return;
    }
    showSaved(
      pendingDelete.kind === "section"
        ? "Section removed from sample data."
        : "Lesson removed from sample data.",
    );
    setPendingDelete(null);
  };

  return (
    <section className="mx-auto w-full max-w-450 space-y-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <AdminPageHeader
          title="Curriculum builder"
          description={`Arrange sections and lessons for ${course.title}.`}
          actions={
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/admin/courses/${course.id}`)}
            >
              Return to course
            </Button>
          }
        />
        <Button
          type="button"
          variant="ghost"
          className="gap-2"
          onClick={() => router.push("/admin/courses")}
        >
          <ArrowLeft size={15} aria-hidden="true" />
          All courses
        </Button>
      </div>
      <LearningSampleNotice />
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-border bg-card px-4 py-3">
        <CourseStatusBadge status={course.status} />
        <span className="text-xs text-brand-text-muted">
          Editing curriculum updates the course&apos;s review status when applicable.
        </span>
      </div>
      <AdminStatsGrid
        stats={[
          {
            label: "Sections",
            value: stats.sectionCount,
            description: "Ordered curriculum units",
            icon: BookOpen,
            tone: "primary",
          },
          {
            label: "Lessons",
            value: stats.lessonCount,
            description: "Across all sections",
            icon: Film,
            tone: "violet",
          },
          {
            label: "Video lessons",
            value: stats.videoLessonCount,
            description: "Video-based content",
            icon: Film,
            tone: "green",
          },
          {
            label: "Total duration",
            value: formatLearningDuration(stats.totalDurationSeconds),
            description: `${stats.previewLessonCount} preview lessons`,
            icon: Clock3,
            tone: "amber",
          },
        ]}
      />
      {isReadOnly && (
        <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 text-xs text-amber-800 dark:text-amber-300">
          Archived courses are read-only. Restore is not part of this sample workflow.
        </div>
      )}
      {!isReadOnly && (
        <div className="flex justify-end">
          <Button type="button" className="gap-2" onClick={openNewSection}>
            <Plus size={15} aria-hidden="true" />
            Add section
          </Button>
        </div>
      )}

      {sections.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-border bg-card p-8 text-center">
          <BookOpen className="mx-auto text-brand-text-muted" size={28} aria-hidden="true" />
          <h2 className="mt-3 text-sm font-semibold text-brand-text">
            No curriculum sections yet
          </h2>
          <p className="mt-1 text-xs text-brand-text-muted">
            Add a section to begin organizing course lessons.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, index) => {
            const sectionLessons = lessons
              .filter((lesson) => lesson.sectionId === section.id)
              .sort((a, b) => a.position - b.position);
            return (
              <section
                key={section.id}
                aria-labelledby={`section-${section.id}`}
                className="overflow-hidden rounded-xl border border-brand-border bg-card"
              >
                <header className="flex flex-wrap items-start justify-between gap-3 border-b border-brand-border bg-brand-page-secondary/50 px-4 py-4 sm:px-5">
                  <div className="flex min-w-0 items-start gap-3">
                    <GripVertical
                      size={16}
                      className="mt-1 shrink-0 text-brand-text-muted"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-text-muted">
                        Section {section.position}
                      </p>
                      <h2
                        id={`section-${section.id}`}
                        className="mt-1 text-sm font-semibold text-brand-text"
                      >
                        {section.title}
                      </h2>
                      {section.description && (
                        <p className="mt-1 max-w-2xl text-xs leading-5 text-brand-text-muted">
                          {section.description}
                        </p>
                      )}
                      <p className="mt-2 text-[11px] text-brand-text-muted">
                        {sectionLessons.length} lessons
                      </p>
                    </div>
                  </div>
                  {!isReadOnly && (
                    <div className="flex flex-wrap items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Move section ${section.title} up`}
                        disabled={index === 0}
                        onClick={() => {
                          moveSection(section.id, -1);
                          showSaved("Section order updated.");
                        }}
                      >
                        <ArrowUp size={15} aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Move section ${section.title} down`}
                        disabled={index === sections.length - 1}
                        onClick={() => {
                          moveSection(section.id, 1);
                          showSaved("Section order updated.");
                        }}
                      >
                        <ArrowDown size={15} aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit section ${section.title}`}
                        onClick={() => openEditSection(section)}
                      >
                        <Pencil size={14} aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete section ${section.title}`}
                        disabled={sectionLessons.length > 0}
                        title={
                          sectionLessons.length > 0
                            ? "Delete this section's lessons first."
                            : undefined
                        }
                        onClick={() =>
                          setPendingDelete({ kind: "section", section })
                        }
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="ml-1 gap-1.5"
                        onClick={() => openNewLesson(section.id)}
                      >
                        <Plus size={13} aria-hidden="true" />
                        Add lesson
                      </Button>
                    </div>
                  )}
                </header>
                <ol className="divide-y divide-brand-border">
                  {sectionLessons.map((lesson, lessonIndex) => (
                    <li
                      key={lesson.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {lesson.type === "VIDEO" ? (
                            <Film size={15} aria-hidden="true" />
                          ) : lesson.type === "PDF" ? (
                            <FileText size={15} aria-hidden="true" />
                          ) : (
                            <BookOpen size={15} aria-hidden="true" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-brand-text">
                            {section.position}.{lesson.position} {lesson.title}
                          </p>
                          <p className="mt-1 line-clamp-1 text-[11px] text-brand-text-muted">
                            {lesson.description}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-brand-text-muted">
                            <span>{lesson.type.toLowerCase()}</span>
                            {lesson.durationSeconds !== null && (
                              <span>
                                · {formatLearningDuration(lesson.durationSeconds)}
                              </span>
                            )}
                            {lesson.isPreview && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                                Preview
                              </span>
                            )}
                            {lesson.resources.length > 0 && (
                              <span>{lesson.resources.length} resources</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {!isReadOnly && (
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Move lesson ${lesson.title} up`}
                            disabled={lessonIndex === 0}
                            onClick={() => {
                              moveLesson(lesson.id, -1);
                              showSaved("Lesson order updated.");
                            }}
                          >
                            <ArrowUp size={14} aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Move lesson ${lesson.title} down`}
                            disabled={lessonIndex === sectionLessons.length - 1}
                            onClick={() => {
                              moveLesson(lesson.id, 1);
                              showSaved("Lesson order updated.");
                            }}
                          >
                            <ArrowDown size={14} aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Edit lesson ${lesson.title}`}
                            onClick={() => openEditLesson(lesson)}
                          >
                            <Pencil size={14} aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Delete lesson ${lesson.title}`}
                            onClick={() =>
                              setPendingDelete({ kind: "lesson", lesson })
                            }
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </Button>
                        </div>
                      )}
                    </li>
                  ))}
                  {sectionLessons.length === 0 && (
                    <li className="px-5 py-5 text-center text-xs text-brand-text-muted">
                      No lessons in this section yet.
                    </li>
                  )}
                </ol>
              </section>
            );
          })}
        </div>
      )}

      <AdminDialog
        open={sectionDraft !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSectionDraft(null);
            setFormError("");
          }
        }}
        title={sectionDraft?.id ? "Edit section" : "Add section"}
        description="Organize lessons into a clear, learner-friendly sequence."
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSectionDraft(null)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={saveSection}>
              Save section
            </Button>
          </>
        }
      >
        {sectionDraft && (
          <div className="space-y-4">
            <Field label="Section title" id="section-title" error={formError}>
              <Input
                id="section-title"
                value={sectionDraft.title}
                maxLength={100}
                onChange={(event) =>
                  setSectionDraft((current) =>
                    current
                      ? { ...current, title: event.target.value }
                      : current,
                  )
                }
              />
            </Field>
            <Field label="Description" id="section-description">
              <textarea
                id="section-description"
                rows={3}
                maxLength={500}
                value={sectionDraft.description}
                onChange={(event) =>
                  setSectionDraft((current) =>
                    current
                      ? { ...current, description: event.target.value }
                      : current,
                  )
                }
                className={textareaClassName}
              />
            </Field>
          </div>
        )}
      </AdminDialog>

      <AdminDialog
        open={lessonDraft !== null}
        onOpenChange={(open) => {
          if (!open) {
            setLessonDraft(null);
            setFormError("");
          }
        }}
        title={lessonDraft?.id ? "Edit lesson" : "Add lesson"}
        description="Choose the content type and provide the lesson material."
        size="lg"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLessonDraft(null)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={saveLesson}>
              Save lesson
            </Button>
          </>
        }
      >
        {lessonDraft && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Lesson title" id="lesson-title" error={formError}>
                <Input
                  id="lesson-title"
                  value={lessonDraft.title}
                  maxLength={100}
                  onChange={(event) =>
                    setLessonDraft((current) =>
                      current
                        ? { ...current, title: event.target.value }
                        : current,
                    )
                  }
                />
              </Field>
              <Field label="Content type" id="lesson-type">
                <Select
                  value={lessonDraft.type}
                  onValueChange={(value) => {
                    if (
                      value === "VIDEO" ||
                      value === "TEXT" ||
                      value === "PDF"
                    ) {
                      setLessonDraft((current) =>
                        current ? { ...current, type: value } : current,
                      );
                    }
                  }}
                >
                  <SelectTrigger id="lesson-type" className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectItem value="VIDEO">Video lesson</SelectItem>
                    <SelectItem value="TEXT">Text lesson</SelectItem>
                    <SelectItem value="PDF">PDF lesson</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Duration in minutes (optional)" id="lesson-duration">
                <Input
                  id="lesson-duration"
                  type="number"
                  min={1}
                  max={6000}
                  step={1}
                  inputMode="numeric"
                  value={lessonDraft.durationMinutes}
                  onChange={(event) =>
                    setLessonDraft((current) =>
                      current
                        ? { ...current, durationMinutes: event.target.value }
                        : current,
                    )
                  }
                />
              </Field>
            </div>
            <Field label="Description" id="lesson-description">
              <textarea
                id="lesson-description"
                rows={2}
                maxLength={500}
                value={lessonDraft.description}
                onChange={(event) =>
                  setLessonDraft((current) =>
                    current
                      ? { ...current, description: event.target.value }
                      : current,
                  )
                }
                className={textareaClassName}
              />
            </Field>
            {lessonDraft.type === "VIDEO" && (
              <Field label="Video URL" id="lesson-video-url" error={formError}>
                <Input
                  id="lesson-video-url"
                  type="url"
                  placeholder="https://"
                  value={lessonDraft.mediaUrl}
                  onChange={(event) =>
                    setLessonDraft((current) =>
                      current
                        ? { ...current, mediaUrl: event.target.value }
                        : current,
                    )
                  }
                />
              </Field>
            )}
            {lessonDraft.type === "TEXT" && (
              <Field label="Lesson content" id="lesson-content" error={formError}>
                <textarea
                  id="lesson-content"
                  rows={7}
                  maxLength={12000}
                  value={lessonDraft.content}
                  onChange={(event) =>
                    setLessonDraft((current) =>
                      current
                        ? { ...current, content: event.target.value }
                        : current,
                    )
                  }
                  className={textareaClassName}
                />
              </Field>
            )}
            {lessonDraft.type === "PDF" && (
              <div className="space-y-2">
                <span className="text-xs font-medium text-brand-text">
                  PDF file
                </span>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  aria-label="Choose a PDF lesson file"
                  className="sr-only"
                  onChange={(event) => selectPdf(event.target.files?.[0])}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => pdfInputRef.current?.click()}
                >
                  <FileText size={14} aria-hidden="true" />
                  {lessonDraft.resources.find((resource) => resource.type === "PDF")?.title ??
                    "Choose PDF"}
                </Button>
                <p className="text-[11px] text-brand-text-muted">
                  PDF preview is stored locally in sample data; maximum 5 MB.
                </p>
              </div>
            )}
            <label className="flex items-center gap-2 text-xs text-brand-text">
              <Checkbox
                checked={lessonDraft.isPreview}
                onCheckedChange={(checked) =>
                  setLessonDraft((current) =>
                    current
                      ? { ...current, isPreview: checked === true }
                      : current,
                  )
                }
                aria-label="Make this lesson available as a preview"
              />
              Available as a course preview
            </label>
            <div className="space-y-3 border-t border-brand-border pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold text-brand-text">
                    Additional resources
                  </h3>
                  <p className="mt-1 text-[11px] text-brand-text-muted">
                    Add reference links or supplementary PDF resources.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addResource}
                >
                  <Plus size={13} aria-hidden="true" />
                  Add resource
                </Button>
              </div>
              {lessonDraft.resources.map((resource, index) => (
                <div
                  key={`resource-${index}`}
                  className="grid gap-2 rounded-lg border border-brand-border p-3 sm:grid-cols-[minmax(0,1fr)_8rem_auto]"
                >
                  <Input
                    aria-label={`Resource ${index + 1} title`}
                    placeholder="Resource title"
                    maxLength={100}
                    value={resource.title}
                    onChange={(event) =>
                      updateResource(index, "title", event.target.value)
                    }
                  />
                  <Select
                    value={resource.type}
                    onValueChange={(value) => {
                      if (value === "LINK" || value === "PDF") {
                        updateResource(index, "type", value);
                      }
                    }}
                  >
                    <SelectTrigger
                      aria-label={`Resource ${index + 1} type`}
                      className="h-10 w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectItem value="LINK">Link</SelectItem>
                      <SelectItem value="PDF">PDF</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove resource ${index + 1}`}
                    onClick={() =>
                      setLessonDraft((current) =>
                        current
                          ? {
                              ...current,
                              resources: current.resources.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            }
                          : current,
                      )
                    }
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </Button>
                  <Input
                    aria-label={`Resource ${index + 1} URL`}
                    type={resource.type === "LINK" ? "url" : "text"}
                    placeholder={
                      resource.type === "LINK" ? "https://" : "PDF data URL"
                    }
                    value={resource.url}
                    onChange={(event) =>
                      updateResource(index, "url", event.target.value)
                    }
                    className="sm:col-span-3"
                  />
                </div>
              ))}
            </div>
            {formError && (
              <p role="alert" className="text-xs text-destructive">
                {formError}
              </p>
            )}
          </div>
        )}
      </AdminDialog>

      <AdminConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title={
          pendingDelete?.kind === "section"
            ? "Delete section?"
            : "Delete lesson?"
        }
        description={
          pendingDelete?.kind === "section"
            ? `Remove ${pendingDelete.section.title}? Sections with lessons cannot be removed.`
            : pendingDelete?.kind === "lesson"
              ? `Remove ${pendingDelete.lesson.title} from this sample curriculum?`
              : ""
        }
        confirmLabel="Delete"
        isDestructive
        onConfirm={confirmDelete}
      />
    </section>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-brand-text">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

const textareaClassName =
  "min-h-20 w-full resize-y rounded-lg border border-brand-border bg-background px-3 py-2 text-sm text-brand-text outline-none placeholder:text-brand-text-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40";
