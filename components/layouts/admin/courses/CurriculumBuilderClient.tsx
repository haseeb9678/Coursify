"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import MediaUpload from "@/components/shared/media/MediaUpload";
import { useCourseWorkspace } from "@/features/instructor/course-workspace";
import InstructorLessonDialog from "@/features/instructor/InstructorLessonDialog";
import { mapLesson } from "@/features/admin/api/learning.api";
import { CurriculumSkeleton } from "@/components/layouts/admin/learning/LearningPageSkeletons";
import { ContentIcon } from "@/features/courses/materials/ContentIcon";
import { detectContentType } from "@/features/courses/materials/content-type";
import { useMediaPending } from "@/features/storage/use-media-pending";
import { ManagedMedia } from "@/features/storage/ManagedMedia";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookOpen,
  Clock3,
  Eye,
  FileText,
  Film,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";
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
import {
  useAdminCourse,
  useAdminCurriculum,
  useCurriculumMutation,
} from "@/features/admin/hooks/use-admin-learning";
import type {
  CourseLesson,
  CourseSection,
  LessonInput,
  LessonResourceType,
  LessonType,
  LessonVideoQuality,
  SectionInput,
} from "@/features/admin/types/learning.types";
import {
  canEditCourse,
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
  mediaAssetId?: string | null;
  videoQualities: LessonVideoQuality[];
  measuredDuration?: number;
  resources: ({ id?: string } & LessonInput["resources"][number])[];
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
  videoQualities: [],
  resources: [],
});

export default function CurriculumBuilderClient({
  courseId,
}: {
  courseId: string;
}) {
  const router = useRouter();
  const { instructor, coursesPath } = useCourseWorkspace();
  const media = useMediaPending();
  const qualityUploads = useMediaPending();
  const uploading = media.pending || qualityUploads.pending;
  const courseQuery = useAdminCourse(courseId);
  const curriculumQuery = useAdminCurriculum(courseId);
  const curriculumMutation = useCurriculumMutation();
  const course = courseQuery.data;
  const rawSections = curriculumQuery.data?.sections ?? [];
  const allSections: CourseSection[] = rawSections.map((section) => ({
    id: section.id,
    courseId: section.courseId,
    title: section.title,
    description: section.description,
    position: section.position,
    createdAt: section.createdAt,
    updatedAt: section.updatedAt,
  }));
  const allLessons = rawSections.flatMap((section) => section.lessons.map(mapLesson));
  const [sectionDraft, setSectionDraft] = useState<SectionDraft | null>(null);
  const [viewingLesson, setViewingLesson] = useState<CourseLesson | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);
  const [lessonDraft, setLessonDraft] = useState<LessonDraft | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [formError, setFormError] = useState("");
  const [lessonTitleError, setLessonTitleError] = useState("");
  const actionLock = useRef(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const runAction = async (key: string, action: () => Promise<void>) => {
    if (actionLock.current || isReadOnly) return;
    actionLock.current = true;
    setBusyAction(key);
    try {
      await action();
    } finally {
      actionLock.current = false;
      setBusyAction(null);
    }
  };

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
  const isReadOnly = !canEditCourse(course?.status);

  if (courseQuery.isLoading || curriculumQuery.isLoading) {
    if (instructor) return <CurriculumSkeleton />;
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8" aria-live="polite">
        <p className="text-sm text-brand-text-muted">Loading curriculum…</p>
      </main>
    );
  }

  if (courseQuery.isError || !course) {
    return (
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8">
        <AdminErrorState
          title="Course not found"
          description={courseQuery.error?.message ?? "The course could not be found."}
        />
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(coursesPath)}
          >
            Back to courses
          </Button>
        </div>
      </main>
    );
  }
  if (curriculumQuery.isError) {
    return (
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8">
        <AdminErrorState
          title="Curriculum could not be loaded"
          description={curriculumQuery.error.message}
        />
        <div className="flex justify-center">
          <Button type="button" variant="outline" onClick={() => router.push(`${coursesPath}/${course.id}`)}>
            Return to course
          </Button>
        </div>
      </main>
    );
  }

  const wasReviewed = course.status !== "DRAFT";
  const showSaved = (message: string) => {
    toast.success(wasReviewed ? `${message} Submit the updated course for review when ready.` : message);
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
  const reorderSectionBy = async (sectionIndex: number, offset: -1 | 1) => {
    const targetIndex = sectionIndex + offset;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const ordered = [...sections];
    const [section] = ordered.splice(sectionIndex, 1);
    ordered.splice(targetIndex, 0, section);
    try {
      await curriculumMutation.mutateAsync({
        action: "reorder-sections",
        courseId: course.id,
        ids: ordered.map((item) => item.id),
      });
      showSaved("Section order updated.");
    } catch (error) {
      toast.error(getGraphQLErrorMessage(error));
    }
  };
  const reorderLessonBy = async (
    sectionId: string,
    lessonIndex: number,
    offset: -1 | 1,
  ) => {
    const sectionLessons = lessons
      .filter((lesson) => lesson.sectionId === sectionId)
      .sort((left, right) => left.position - right.position);
    const targetIndex = lessonIndex + offset;
    if (targetIndex < 0 || targetIndex >= sectionLessons.length) return;
    const ordered = [...sectionLessons];
    const [lesson] = ordered.splice(lessonIndex, 1);
    ordered.splice(targetIndex, 0, lesson);
    try {
      await curriculumMutation.mutateAsync({
        action: "reorder-lessons",
        sectionId,
        ids: ordered.map((item) => item.id),
      });
      showSaved("Lesson order updated.");
    } catch (error) {
      toast.error(getGraphQLErrorMessage(error));
    }
  };
  const saveSection = async () => {
    if (!sectionDraft) return;
    const parsed = sectionSchema.safeParse({
      title: sectionDraft.title,
      description: sectionDraft.description,
    });
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Check the section fields.";
      setFormError(message);
      toast.error(message);
      return;
    }
    try {
      if (sectionDraft.id) {
        await curriculumMutation.mutateAsync({
          action: "update-section",
          id: sectionDraft.id,
          ...parsed.data,
        });
        showSaved("Section updated.");
      } else {
        await curriculumMutation.mutateAsync({
          action: "create-section",
          courseId: course.id,
          ...parsed.data,
        });
        showSaved("Section added.");
      }
      setSectionDraft(null);
      setFormError("");
    } catch (error) {
      const message = getGraphQLErrorMessage(error);
      setFormError(message);
      toast.error(message);
    }
  };

  const openNewLesson = (sectionId: string) => {
    setFormError("");
    setLessonTitleError("");
    setLessonDraft(emptyLessonDraft(sectionId));
  };
  const openEditLesson = (lesson: CourseLesson) => {
    setFormError("");
    setLessonTitleError("");
    setLessonDraft({
      id: lesson.id,
      sectionId: lesson.sectionId,
      title: lesson.title,
      description: lesson.description,
      type: lesson.type,
      durationMinutes:
        lesson.durationSeconds === null
          ? ""
          : String(Math.max(1, Math.ceil(lesson.durationSeconds / 60))),
      measuredDuration: lesson.durationSeconds ?? undefined,
      isPreview: lesson.isPreview,
      content: lesson.content,
      mediaUrl: lesson.mediaUrl,
      mediaAssetId: lesson.mediaAssetId,
      videoQualities: lesson.videoQualities ?? [],
      resources: lesson.resources.map((resource) => ({ ...resource })),
    });
  };
  const saveLesson = async () => {
    if (!lessonDraft || uploading) return;
    setFormError("");
    setLessonTitleError("");
    const minutes = lessonDraft.durationMinutes.trim()
      ? Number(lessonDraft.durationMinutes)
      : null;
    if (
      minutes !== null &&
      (!Number.isInteger(minutes) || minutes < 1 || minutes > 6000)
    ) {
      const message = "Duration must be a whole number between 1 and 6000 minutes.";
      setFormError(message);
      toast.error(message);
      return;
    }
    const resourceInput: LessonInput["resources"] = lessonDraft.resources.map(
      ({ title, type, url, mediaAssetId }) => ({ title, type, url, mediaAssetId }),
    );
    const input: LessonInput = {
      title: lessonDraft.title,
      description: lessonDraft.description,
      type: lessonDraft.type,
      durationSeconds: lessonDraft.measuredDuration ?? (minutes === null ? null : minutes * 60),
      isPreview: lessonDraft.isPreview,
      content: lessonDraft.content,
      mediaUrl: lessonDraft.mediaUrl,
      mediaAssetId: lessonDraft.mediaAssetId,
      resources: resourceInput,
    };
    const parsed = lessonSchema.safeParse(input);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      toast.error(issue?.message ?? "Check the lesson fields.");
      if (issue?.path[0] === "title") {
        setLessonTitleError(issue.message);
      } else {
        setFormError(issue?.message ?? "Check the lesson fields.");
      }
      return;
    }
    try {
      await curriculumMutation.mutateAsync({
        action: lessonDraft.id ? "update-lesson" : "create-lesson",
        id: lessonDraft.id ?? undefined,
        sectionId: lessonDraft.sectionId,
        title: parsed.data.title,
        description: parsed.data.description,
        type: parsed.data.type,
        content: parsed.data.content,
        videoUrl: parsed.data.type === "VIDEO" ? parsed.data.mediaUrl : null,
        documentUrl: parsed.data.type === "PDF" ? parsed.data.mediaUrl : null,
        durationSeconds: parsed.data.durationSeconds,
        isPreview: parsed.data.isPreview,
        mediaAssetId: parsed.data.mediaAssetId,
        videoQualities: lessonDraft.videoQualities,
        resources: parsed.data.resources.map((resource, index) => ({ ...resource, id: lessonDraft.resources[index]?.id })),
      });
      showSaved(lessonDraft.id ? "Lesson updated." : "Lesson added.");
      setLessonDraft(null);
      setFormError("");
    } catch (error) {
      const message = getGraphQLErrorMessage(error);
      setFormError(message);
      toast.error(message);
    }
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
          ? { ...resource, [key]: value, ...(key === "type" && value !== resource.type ? { url: "", mediaAssetId: undefined, fileName: undefined } : {}) }
          : resource,
      );
      return { ...current, resources };
    });
  };
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await curriculumMutation.mutateAsync(
        pendingDelete.kind === "section"
          ? { action: "delete-section", id: pendingDelete.section.id }
          : { action: "delete-lesson", id: pendingDelete.lesson.id },
      );
      showSaved(
        pendingDelete.kind === "section"
          ? "Section removed."
          : "Lesson removed.",
      );
      setPendingDelete(null);
    } catch (error) {
      toast.error(getGraphQLErrorMessage(error));
    }
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
              onClick={() => router.push(`${coursesPath}/${course.id}`)}
            >
              Return to course
            </Button>
          }
        />
        <Button
          type="button"
          variant="ghost"
          className="gap-2"
          onClick={() => router.push(coursesPath)}
        >
          <ArrowLeft size={15} aria-hidden="true" />
          All courses
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-border bg-card px-4 py-3">
        <CourseStatusBadge status={course.status} />
        <span className="text-xs text-brand-text-muted">
          Only draft and changes-requested courses can be edited.
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
          Curriculum editing is available only for drafts and courses returned for changes.
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
                  {instructor && <Button type="button" variant="ghost" size="sm"
                    aria-controls={`module-lessons-${section.id}`} aria-expanded={!collapsedSections.includes(section.id)}
                    onClick={() => setCollapsedSections((sections) => sections.includes(section.id)
                      ? sections.filter((id) => id !== section.id) : [...sections, section.id])}>
                    {collapsedSections.includes(section.id) ? "Expand lessons" : "Collapse lessons"}
                  </Button>}
                  {!isReadOnly && (
                    <div className="flex flex-wrap items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Move section ${section.title} up`}
                        disabled={busyAction !== null || index === 0}
                        busy={busyAction === `section-${section.id}--1`}
                        onClick={() => void runAction(`section-${section.id}--1`, () => reorderSectionBy(index, -1))}
                      >
                        <ArrowUp size={15} aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Move section ${section.title} down`}
                        disabled={busyAction !== null || index === sections.length - 1}
                        busy={busyAction === `section-${section.id}-1`}
                        onClick={() => void runAction(`section-${section.id}-1`, () => reorderSectionBy(index, 1))}
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
                <ol id={`module-lessons-${section.id}`} hidden={instructor && collapsedSections.includes(section.id)} className="divide-y divide-brand-border">
                  {sectionLessons.map((lesson, lessonIndex) => (
                    <li
                      key={lesson.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {instructor ? <ContentIcon kind={detectContentType(lesson)} size={15} /> : lesson.type === "VIDEO" ? (
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
                      {isReadOnly ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`View lesson ${lesson.title}`}
                          onClick={() => setViewingLesson(lesson)}
                        >
                          <Eye size={14} aria-hidden="true" />
                        </Button>
                      ) : (
                        <div className="flex shrink-0 items-center gap-1">
                          {instructor && <Button type="button" variant="ghost" size="icon-sm"
                            aria-label={`View lesson ${lesson.title}`} onClick={() => setViewingLesson(lesson)}>
                            <Eye size={14} aria-hidden="true" />
                          </Button>}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Move lesson ${lesson.title} up`}
                            disabled={busyAction !== null || lessonIndex === 0}
                            busy={busyAction === `lesson-${lesson.id}--1`}
                            onClick={() => void runAction(`lesson-${lesson.id}--1`, () => reorderLessonBy(section.id, lessonIndex, -1))}
                          >
                            <ArrowUp size={14} aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Move lesson ${lesson.title} down`}
                            disabled={busyAction !== null || lessonIndex === sectionLessons.length - 1}
                            busy={busyAction === `lesson-${lesson.id}-1`}
                            onClick={() => void runAction(`lesson-${lesson.id}-1`, () => reorderLessonBy(section.id, lessonIndex, 1))}
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
        open={!isReadOnly && sectionDraft !== null}
        busy={busyAction === "section"}
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
              disabled={busyAction !== null}
              onClick={() => setSectionDraft(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={busyAction !== null}
              busy={busyAction === "section"}
              onClick={() => void runAction("section", saveSection)}
            >
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
        open={!isReadOnly && lessonDraft !== null}
        onOpenChange={(open) => {
          if (!open) {
            setLessonDraft(null);
            setFormError("");
          }
        }}
        title={lessonDraft?.id ? "Edit lesson" : "Add lesson"}
        description="Choose the content type and provide the lesson material."
        busy={uploading || busyAction === "lesson"}
        size="lg"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              disabled={busyAction !== null || uploading}
              onClick={() => setLessonDraft(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={busyAction !== null || uploading}
              busy={busyAction === "lesson"}
              onClick={() => void runAction("lesson", saveLesson)}
            >
              Save lesson
            </Button>
          </>
        }
      >
        {lessonDraft && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Lesson title" id="lesson-title" error={lessonTitleError}>
                <Input
                  id="lesson-title"
                  value={lessonDraft.title}
                  aria-invalid={Boolean(lessonTitleError)}
                  aria-describedby={lessonTitleError ? "lesson-title-error" : undefined}
                  onChange={(event) => {
                    const title = event.currentTarget.value;
                    setLessonTitleError("");
                    setLessonDraft((current) => current ? { ...current, title } : current);
                  }}
                />
              </Field>
              <Field label="Content type" id="lesson-type">
                <Select
                  value={lessonDraft.type}
                  disabled={uploading || busyAction !== null}
                  onValueChange={(value) => {
                    if (
                      value === "VIDEO" ||
                      value === "TEXT" ||
                      value === "PDF"
                    ) {
                      setLessonDraft((current) =>
                        current && current.type !== value ? { ...current, type: value, mediaUrl: "", mediaAssetId: undefined, videoQualities: [] } : current,
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
                        ? { ...current, durationMinutes: event.target.value, measuredDuration: undefined }
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
            {lessonDraft.type !== "TEXT" && (
              <Field label={lessonDraft.type === "VIDEO" ? "Lesson video" : "Lesson PDF"} id="lesson-upload">
                <MediaUpload key={lessonDraft.type} label={lessonDraft.type === "VIDEO" ? "Lesson video" : "Lesson PDF"}
                  purpose={lessonDraft.type === "VIDEO" ? "LESSON_VIDEO" : "LESSON_DOCUMENT"} courseId={courseId} mode="UPLOAD_ONLY"
                  disabled={busyAction !== null || qualityUploads.pending}
                  existingFile={lessonDraft.mediaAssetId ? "Verified private file" : lessonDraft.mediaUrl ? "Legacy external media. Upload a local file to replace it." : undefined}
                  onBusyChange={media.track("lesson")}
                  onRemove={() => setLessonDraft((current) => current ? {
                    ...current, mediaUrl: "", mediaAssetId: null, videoQualities: [], measuredDuration: undefined,
                  } : current)}
                  onAsset={(asset, metadata) => setLessonDraft((current) => current ? {
                    ...current, mediaUrl: "", mediaAssetId: asset.id, videoQualities: [],
                    ...(metadata ? { measuredDuration: Math.max(1, Math.round(metadata.duration)), durationMinutes: String(Math.max(1, Math.ceil(metadata.duration / 60))) } : {}),
                  } : current)} />
              </Field>
            )}
            {lessonDraft.type === "VIDEO" && lessonDraft.mediaAssetId && (
              <details className="group rounded-xl border border-brand-border bg-brand-page-secondary/60 p-3 sm:p-4">
                <summary className="cursor-pointer rounded-md text-sm font-semibold text-brand-text focus-visible:ring-2 focus-visible:ring-ring">
                  Video quality options{lessonDraft.videoQualities.length ? ` (${lessonDraft.videoQualities.length})` : ""}
                </summary>
                <p className="mt-2 text-xs text-brand-text-muted">Upload optional MP4 exports of this same lesson. Learners can switch between the original and the versions you add.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[360, 480, 720, 1080].map((height) => {
                    const existing = lessonDraft.videoQualities.find((item) => item.height === height);
                    return <div key={`${lessonDraft.mediaAssetId}-${height}`} className="min-w-0 rounded-lg border border-brand-border bg-card p-3">
                      <p className="mb-2 text-xs font-semibold text-brand-text">{height}p</p>
                      <MediaUpload purpose="LESSON_VIDEO" mode="UPLOAD_ONLY" courseId={courseId} label={`${height}p version`}
                        expectedVideoHeight={height} disabled={busyAction !== null || media.pending} existingFile={existing ? "Verified version" : undefined}
                        onBusyChange={qualityUploads.track(String(height))}
                        onAsset={(asset) => setLessonDraft((current) => current ? { ...current, videoQualities: [
                          ...current.videoQualities.filter((item) => item.height !== height), { height, assetId: asset.id },
                        ] } : current)}
                        onRemove={() => setLessonDraft((current) => current ? { ...current,
                          videoQualities: current.videoQualities.filter((item) => item.height !== height),
                        } : current)} />
                    </div>;
                  })}
                </div>
              </details>
            )}
            {lessonDraft.type === "TEXT" && (
              <Field label="Lesson content" id="lesson-content">
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
                    Add reference links or upload private lesson files.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addResource}
                  disabled={media.pending}
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
                    disabled={uploading || busyAction !== null}
                    onValueChange={(value) => {
                      if (value === "LINK" || value === "PDF" || value === "DOCUMENT" || value === "FILE") {
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
                      <SelectItem value="DOCUMENT">Document</SelectItem>
                      <SelectItem value="FILE">File</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove resource ${index + 1}`}
                    disabled={uploading || busyAction !== null}
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
                  <div className="sm:col-span-3">
                    {resource.type === "LINK" ? <Input aria-label={`Resource ${index + 1} URL`} type="url" placeholder="https://"
                      value={resource.url} onChange={(event) => updateResource(index, "url", event.target.value)} />
                    : <MediaUpload label="Resource file" purpose="LESSON_RESOURCE" courseId={courseId} mode="UPLOAD_ONLY"
                        allowedExtensions={resource.type === "PDF" ? ["pdf"] : undefined}
                        existingFile={resource.fileName || (resource.mediaAssetId ? "Verified private file" : resource.url ? "Legacy external file" : undefined)}
                        disabled={busyAction !== null} onBusyChange={media.track(`resource-${index}`)}
                        onRemove={() => setLessonDraft((current) => current ? { ...current,
                          resources: current.resources.map((item, position) => position === index ? {
                            ...item, url: "", mediaAssetId: null, fileName: null, fileSize: null,
                          } : item),
                        } : current)}
                        onAsset={(asset) => setLessonDraft((current) => current ? { ...current,
                          resources: current.resources.map((item, position) => position === index ? {
                            ...item, url: "", mediaAssetId: asset.id, fileName: asset.originalFileName, fileSize: asset.sizeBytes,
                          } : item),
                        } : current)} />}
                  </div>
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

      {instructor ? <InstructorLessonDialog courseId={courseId} lesson={viewingLesson} onClose={() => setViewingLesson(null)} /> : <AdminDialog
        open={viewingLesson !== null}
        onOpenChange={(open) => { if (!open) setViewingLesson(null); }}
        title={viewingLesson?.title ?? "View lesson"}
        description={viewingLesson?.description || undefined}
        size="lg"
      >
        {viewingLesson && (
          <div className="space-y-4 text-sm text-brand-text">
            <p>{viewingLesson.type} lesson</p>
            {viewingLesson.content && <p className="whitespace-pre-wrap wrap-break-word">{viewingLesson.content}</p>}
            {viewingLesson.mediaAssetId && <ManagedMedia courseId={courseId} lessonId={viewingLesson.id} kind={viewingLesson.type === "VIDEO" ? "video" : "pdf"} title={viewingLesson.title} />}
            {viewingLesson.mediaUrl && <p className="break-all">{viewingLesson.mediaUrl}</p>}
            {viewingLesson.resources.length > 0 && (
              <div>
                <h3 className="font-semibold">Lesson resources</h3>
                <ul className="mt-2 space-y-2">
                  {viewingLesson.resources.map((resource) => (
                    <li key={resource.id}>
                      <span className="font-medium">{resource.title}</span>
                      {resource.mediaAssetId ? <ManagedMedia courseId={courseId} lessonId={viewingLesson.id} resourceId={resource.id} kind="document" title={resource.title} /> : <p className="break-all text-brand-text-muted">{resource.url}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </AdminDialog>}

      <AdminConfirmDialog
        open={!isReadOnly && pendingDelete !== null}
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
        isDisabled={busyAction !== null}
        onConfirm={() => runAction("delete", confirmDelete)}
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
        <p id={id + "-error"} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

const textareaClassName =
  "min-h-20 w-full resize-y rounded-lg border border-brand-border bg-background px-3 py-2 text-sm text-brand-text outline-none placeholder:text-brand-text-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40";
