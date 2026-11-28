"use client";

import AdminDialog from "@/components/layouts/admin/shared/AdminDialog";
import type { CourseLesson } from "@/features/admin/types/learning.types";
import { safeMaterialUrl, statusLabel } from "@/features/commerce/commerce-format";
import LessonVideoPlayer from "@/features/commerce/LessonVideoPlayer";
import { ContentIcon } from "@/features/courses/materials/ContentIcon";
import { detectContentType } from "@/features/courses/materials/content-type";
import { PdfPreview, TextPreview } from "@/features/courses/materials/LessonPreviewDialog";
import { loadAuthorizedPreviewFile, loadExternalPreviewFile, readPdf } from "@/features/courses/materials/preview-files";
import { ManagedMedia } from "@/features/storage/ManagedMedia";
import { storageApi } from "@/features/storage/storage.api";

function LessonMaterial({ courseId, lesson }: { courseId: string; lesson: CourseLesson }) {
  const source = safeMaterialUrl(lesson.mediaUrl);
  if (lesson.type === "TEXT") return <TextPreview title={lesson.title} load={async () => lesson.content} />;
  if (lesson.type === "PDF" && lesson.mediaAssetId) return <PdfPreview title={lesson.title} load={async (signal) =>
    readPdf(await loadAuthorizedPreviewFile((requestSignal) => storageApi.lesson(courseId, lesson.id, false, undefined, requestSignal), signal))} />;
  if (lesson.type === "PDF" && source) return <PdfPreview title={lesson.title}
    load={async (signal) => readPdf(await loadExternalPreviewFile(source, signal))} fallbackUrl={source} />;
  if (lesson.type === "VIDEO" && lesson.mediaAssetId) return <ManagedMedia courseId={courseId} lessonId={lesson.id} kind="video" title={lesson.title} />;
  if (lesson.type === "VIDEO" && source) return <LessonVideoPlayer source={source} title={lesson.title} />;
  return <p className="text-brand-text-muted">Add lesson media to preview it.</p>;
}

export default function InstructorLessonDialog({ courseId, lesson, onClose }: {
  courseId: string;
  lesson: CourseLesson | null;
  onClose: () => void;
}) {
  return <AdminDialog open={lesson !== null} onOpenChange={(open) => { if (!open) onClose(); }}
    title={lesson?.title ?? "View lesson"} description={lesson?.description || undefined} size="lg">
    {lesson && <div className="space-y-4 text-sm text-brand-text">
      <p className="text-brand-text-muted">{lesson.type === "PDF" ? "PDF" : statusLabel(lesson.type)} lesson</p>
      <LessonMaterial courseId={courseId} lesson={lesson} />
      {lesson.resources.length > 0 && <div>
        <h3 className="font-semibold">Lesson resources</h3>
        <ul className="mt-2 space-y-2">
          {lesson.resources.map((resource) => <li key={resource.id} className="rounded-lg border border-brand-border p-3">
            <span className="flex items-center gap-2 font-medium">
              <ContentIcon kind={detectContentType(resource)} size={15} className="shrink-0 text-primary" />{resource.title}
            </span>
            {resource.mediaAssetId
              ? <ManagedMedia courseId={courseId} lessonId={lesson.id} resourceId={resource.id} kind="document" title={resource.title} />
              : <p className="break-all text-brand-text-muted">{resource.url}</p>}
          </li>)}
        </ul>
      </div>}
    </div>}
  </AdminDialog>;
}
