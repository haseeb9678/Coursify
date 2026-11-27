"use client";

import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Download, FileText, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import LessonVideoPlayer from "@/features/commerce/LessonVideoPlayer";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";
import { storageApi, type MediaRead } from "./storage.api";

export function ManagedMedia({ courseId, lessonId, resourceId, kind, title, preview = false }: {
  courseId: string; lessonId: string; resourceId?: string; kind: "video" | "pdf" | "document"; title: string; preview?: boolean;
}) {
  const userId = useAuthStore((state) => state.user?.id);
  const read = useCallback((height?: number) => resourceId ? storageApi.resource(courseId, lessonId, resourceId)
    : storageApi.lesson(courseId, lessonId, preview, height), [courseId, lessonId, preview, resourceId]);
  return kind === "video" ? <SignedVideo cacheKey={["lesson-media", preview ? "preview" : userId, courseId, lessonId]}
    read={read} title={title} /> : kind === "pdf" ? <SignedPdf read={read} title={title} /> : <SignedDocument read={read} title={title} />;
}

export function SignedVideo({ cacheKey, title, read }: { cacheKey: unknown[]; title: string; read: (height?: number) => Promise<MediaRead> }) {
  const initial = useQuery({
    queryKey: cacheKey, queryFn: () => read(), gcTime: 0, retry: false,
    staleTime: Infinity, refetchOnMount: "always", refetchOnWindowFocus: false, refetchOnReconnect: false,
  });
  if (initial.isPending) return <Skeleton role="status" aria-label="Preparing video" className="aspect-video w-full rounded-2xl" />;
  if (initial.isError || !initial.data) return <div className="space-y-2 text-sm text-brand-text-muted">
    <p role="alert">{getGraphQLErrorMessage(initial.error)}</p>
    <Button variant="outline" busy={initial.isFetching} onClick={() => void initial.refetch()}><Play aria-hidden="true" /> Try again</Button>
  </div>;
  return <LessonVideoPlayer key={initial.data.url} source={initial.data.url} title={title} expiresAt={initial.data.expiresAt}
    qualities={initial.data.availableQualities ?? undefined} renew={read} />;
}

export function SignedDocument({ title, read }: { title: string; read: () => Promise<MediaRead> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function download() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const { url } = await read();
      const link = document.createElement("a");
      link.href = url;
      link.referrerPolicy = "no-referrer";
      link.download = "";
      document.body.append(link);
      link.click();
      link.remove();
    } catch (failure) {
      setError(getGraphQLErrorMessage(failure));
    } finally {
      setBusy(false);
    }
  }

  return <div className="space-y-1">
    <Button type="button" variant="outline" busy={busy} onClick={() => void download()}>
      <Download aria-hidden="true" /> Download {title}
    </Button>
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
  </div>;
}

export function SignedPdf({ title, read }: { title: string; read: () => Promise<MediaRead> }) {
  const [document, setDocument] = useState<MediaRead>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function preview() {
    setBusy(true);
    setError("");
    try { setDocument(await read()); }
    catch (failure) { setError(getGraphQLErrorMessage(failure)); }
    finally { setBusy(false); }
  }

  return <div className="w-full space-y-2">
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" busy={busy} onClick={() => void preview()}>
        <FileText aria-hidden="true" /> {document ? "Refresh PDF preview" : "Preview PDF"}
      </Button>
      {document && <Button variant="outline" nativeButton={false}
        render={<a href={document.url} target="_blank" rel="noreferrer" />}>
        Open PDF in new tab <ArrowUpRight aria-hidden="true" />
      </Button>}
    </div>
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    {document && <iframe title={title} src={document.url} referrerPolicy="no-referrer"
      className="h-[min(60vh,40rem)] w-full rounded-xl border border-brand-border" />}
  </div>;
}
