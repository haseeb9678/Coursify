"use client";

import { ArrowUpRight } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ContentIcon, contentLabels } from "@/features/courses/materials/ContentIcon";
import { detectContentType } from "@/features/courses/materials/content-type";
import LessonPreviewDialog, { type LessonPreview } from "@/features/courses/materials/LessonPreviewDialog";
import {
  loadAuthorizedPreviewFile, loadExternalPreviewFile, readPdf, readPlainText,
} from "@/features/courses/materials/preview-files";
import { SignedDocument } from "@/features/storage/ManagedMedia";
import { storageApi } from "@/features/storage/storage.api";
import { safeMaterialUrl } from "./commerce-format";
import type { LearningLesson } from "./commerce.types";

export default function LearningLessonResources({ courseId, lesson }: { courseId: string; lesson: LearningLesson }) {
  const [preview, setPreview] = useState<LessonPreview | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const resources = lesson.resources.flatMap((resource) => {
    const href = safeMaterialUrl(resource.url);
    return href || resource.hasManagedMedia ? [{ ...resource, href }] : [];
  });

  if (!resources.length) return null;
  return <section className="space-y-3 p-4 sm:p-6 lg:p-8">
    <h3 className="font-semibold text-brand-text">Lesson resources</h3>
    <ul className="grid gap-2 lg:grid-cols-2">
      {resources.map((resource) => {
        const { id, href, title, hasManagedMedia } = resource;
        const kind = detectContentType(resource);
        const read = (signal?: AbortSignal) => storageApi.resource(courseId, lesson.id, id, signal);
        const loadFile = (signal: AbortSignal) => hasManagedMedia
          ? loadAuthorizedPreviewFile(read, signal)
          : loadExternalPreviewFile(href ?? "", signal);
        return <li key={id} className="min-w-0 space-y-2">
          {hasManagedMedia ? <SignedDocument read={read} title={title} icon={<ContentIcon kind={kind} />} />
            : <a href={href ?? undefined} target="_blank" rel="noreferrer"
              className="flex min-h-12 items-center gap-3 rounded-xl border border-brand-border px-3 py-2 text-sm font-medium text-brand-text transition-colors hover:border-primary/40 hover:bg-brand-soft hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
              <ContentIcon kind={kind} className="size-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 wrap-break-word">{title}<span className="block text-xs font-normal text-brand-text-muted">{contentLabels[kind]}</span></span>
              <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
            </a>}
          {(kind === "text" || kind === "pdf") && <Button type="button" size="sm" variant="outline"
            aria-label={`Preview ${title}`}
            onClick={(event) => {
              trigger.current = event.currentTarget;
              const fallbackUrl = hasManagedMedia ? undefined : href ?? undefined;
              setPreview(kind === "text"
                ? { kind, id, title, fallbackUrl, load: async (signal) => readPlainText(await loadFile(signal)) }
                : { kind, id, title, fallbackUrl, load: async (signal) => readPdf(await loadFile(signal)) });
            }}>
            Preview
          </Button>}
        </li>;
      })}
    </ul>
    <LessonPreviewDialog preview={preview} returnFocus={trigger} onClose={() => setPreview(null)} />
  </section>;
}
