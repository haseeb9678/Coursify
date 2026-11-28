"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Check, Copy, Download, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ManagedMedia } from "@/features/storage/ManagedMedia";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";
import { ContentIcon, contentLabels } from "./ContentIcon";
import { copyPreviewText, downloadPreview, downloadText, materialFilename } from "./preview-files";

type Loader<T> = (signal: AbortSignal) => Promise<T>;
export type LessonPreview = { id: string; title: string } & (
  { kind: "video"; courseId: string; lessonId: string } |
  { kind: "text"; load: Loader<string>; fallbackUrl?: string } |
  { kind: "pdf"; load: Loader<Blob>; fallbackUrl?: string }
);

function usePreview<T>(load: Loader<T>) {
  const instance = useId();
  return useQuery({
    queryKey: ["material-preview", instance], queryFn: ({ signal }) => load(signal),
    retry: false, gcTime: 0, refetchOnWindowFocus: false, refetchOnReconnect: false,
  });
}

function PreviewError({ error, retry, busy, fallbackUrl }: {
  error: unknown; retry: () => void; busy: boolean; fallbackUrl?: string;
}) {
  return <div className="space-y-3 rounded-xl border border-brand-border bg-brand-page-secondary p-4 text-sm text-brand-text">
    <p role="alert">{getGraphQLErrorMessage(error)}</p>
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" busy={busy} onClick={retry}>Try again</Button>
      {fallbackUrl && <Button variant="outline" nativeButton={false}
        render={<a href={fallbackUrl} target="_blank" rel="noreferrer" />}>
        Open original file <ArrowUpRight aria-hidden="true" />
      </Button>}
    </div>
  </div>;
}

function TextPreview({ title, load, fallbackUrl }: Extract<LessonPreview, { kind: "text" }>) {
  const content = usePreview(load);
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const pendingCopy = useRef<AbortController>(null);
  useEffect(() => () => pendingCopy.current?.abort(), []);
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2_000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  if (content.isPending) return <Skeleton role="status" aria-label="Loading text preview" className="h-40 rounded-xl" />;
  if (content.isError) return <PreviewError error={content.error} retry={() => void content.refetch()}
    busy={content.isFetching} fallbackUrl={fallbackUrl} />;
  const text = content.data;
  if (!text.trim()) return <p role="status" className="rounded-xl border border-brand-border bg-brand-page-secondary p-4 text-sm text-brand-text-muted">
    This preview has no text content.
  </p>;

  async function copyText() {
    if (pendingCopy.current || copied) return;
    const request = new AbortController();
    pendingCopy.current = request;
    setCopying(true);
    try {
      await copyPreviewText(text);
      if (request.signal.aborted) return;
      setCopied(true);
      toast.success("Text copied.");
    } catch {
      if (!request.signal.aborted) toast.error("Could not copy the text. You can select it or download the file.");
    } finally {
      pendingCopy.current = null;
      if (!request.signal.aborted) setCopying(false);
    }
  }

  return <>
    <div tabIndex={0} role="region" aria-label="Preview text" className="max-h-[52dvh] overflow-y-auto rounded-xl border border-brand-border bg-brand-page-secondary p-4 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word text-brand-text focus-visible:ring-2 focus-visible:ring-ring sm:max-h-[58dvh]">
      {text}
    </div>
    <div className="mt-4 flex flex-wrap justify-end gap-2">
      <Button type="button" variant="outline" busy={copying} disabled={copied} onClick={() => void copyText()}>
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        {copied ? "Copied" : "Copy text"}
      </Button>
      <Button type="button" onClick={() => downloadText(text, title)}><Download aria-hidden="true" /> Download text</Button>
    </div>
  </>;
}

function PdfViewer({ file, title }: { file: Blob; title: string }) {
  const [url, setUrl] = useState<string>();
  const hasViewer = typeof navigator === "undefined" || navigator.pdfViewerEnabled !== false;
  useEffect(() => {
    let disposed = false;
    const objectUrl = URL.createObjectURL(file);
    queueMicrotask(() => { if (!disposed) setUrl(objectUrl); });
    return () => {
      disposed = true;
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (!url) return <Skeleton role="status" aria-label="Preparing PDF viewer" className="h-[min(50dvh,30rem)] rounded-xl" />;
  return <>
    {hasViewer ? <iframe title={title} src={url} referrerPolicy="no-referrer"
      className="h-[min(59dvh,39rem)] w-full rounded-xl border border-brand-border bg-brand-page-secondary" />
      : <p role="status" className="rounded-xl border border-brand-border bg-brand-page-secondary p-4 text-sm text-brand-text-muted">
        Your browser opens PDFs in a separate viewer. Open or download the document below.
      </p>}
    <div className="mt-4 flex flex-wrap justify-end gap-2">
      <Button variant="outline" nativeButton={false} render={<a href={url} target="_blank" rel="noreferrer" />}>
        Open PDF <ArrowUpRight aria-hidden="true" />
      </Button>
      <Button type="button" onClick={() => downloadPreview(url, materialFilename(title, "pdf"))}><Download aria-hidden="true" /> Download PDF</Button>
    </div>
  </>;
}

function PdfPreview({ title, load, fallbackUrl }: Extract<LessonPreview, { kind: "pdf" }>) {
  const pdf = usePreview(load);
  if (pdf.isPending) return <Skeleton role="status" aria-label="Loading PDF preview" className="h-[min(50dvh,30rem)] rounded-xl" />;
  if (pdf.isError) return <PreviewError error={pdf.error} retry={() => void pdf.refetch()}
    busy={pdf.isFetching} fallbackUrl={fallbackUrl} />;
  return <PdfViewer file={pdf.data} title={title} />;
}

export default function LessonPreviewDialog({ preview, onClose, returnFocus }: {
  preview: LessonPreview | null;
  onClose: () => void;
  returnFocus: RefObject<HTMLElement | null>;
}) {
  const close = useRef<HTMLButtonElement>(null);
  return <Dialog.Root open={preview !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
    <Dialog.Portal>
      <Dialog.Backdrop className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm motion-safe:transition-opacity motion-safe:duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
      <Dialog.Popup initialFocus={close} finalFocus={returnFocus} className="fixed inset-0 z-[101] m-auto h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-brand-border bg-card p-4 text-card-foreground shadow-2xl outline-none motion-safe:transition-[opacity,transform] motion-safe:duration-200 data-ending-style:translate-y-5 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:translate-y-5 data-starting-style:scale-95 data-starting-style:opacity-0 sm:p-6">
        {preview && <>
          <header className="mb-4 flex items-start gap-3 pr-10">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
              <ContentIcon kind={preview.kind} size={17} />
            </span>
            <div className="min-w-0">
              <Dialog.Title className="text-lg font-semibold wrap-break-word text-brand-text">{preview.title}</Dialog.Title>
              <Dialog.Description className="text-xs text-brand-text-muted">{contentLabels[preview.kind]}</Dialog.Description>
            </div>
          </header>
          {preview.kind === "video" ? <ManagedMedia key={preview.id} courseId={preview.courseId} lessonId={preview.lessonId}
            kind="video" title={preview.title} preview />
            : preview.kind === "text" ? <TextPreview key={preview.id} {...preview} />
              : <PdfPreview key={preview.id} {...preview} />}
        </>}
        <Dialog.Close ref={close} aria-label="Close preview"
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-ring">
          <X size={18} aria-hidden="true" />
        </Dialog.Close>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>;
}
