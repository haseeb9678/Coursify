"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { File, Link2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fileSize, isMediaUrl, uploadFile, validateSelectedFile, type UploadAttempt } from "@/features/storage/direct-upload";
import { storageApi, type MediaAsset, type MediaPurpose } from "@/features/storage/storage.api";
import { getGraphQLErrorCode, getGraphQLErrorMessage } from "@/lib/graphql/error";

export type VideoMetadata = { duration: number; width: number; height: number };

function readVideoMetadata(file: File, signal: AbortSignal): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    const timer = window.setTimeout(() => finish(new Error("The browser could not read the video resolution.")), 8000);
    const abort = () => finish(signal.reason ?? new Error("Upload cancelled."));
    function finish(error?: Error) {
      const metadata = { duration: video.duration, width: video.videoWidth, height: video.videoHeight };
      window.clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      video.onloadedmetadata = null;
      video.onerror = null;
      video.removeAttribute("src");
      video.load();
      URL.revokeObjectURL(url);
      if (error) reject(error);
      else resolve(metadata);
    }
    signal.addEventListener("abort", abort, { once: true });
    video.onloadedmetadata = () => finish();
    video.onerror = () => finish(new Error("Choose an MP4 whose resolution can be read in this browser."));
    video.preload = "metadata";
    video.src = url;
  });
}

interface MediaUploadProps {
  purpose: MediaPurpose;
  courseId?: string;
  label: string;
  mode?: "UPLOAD_OR_URL" | "UPLOAD_ONLY" | "URL_ONLY";
  value?: string | null;
  existingFile?: string;
  disabled?: boolean;
  allowLocalPath?: boolean;
  expectedVideoHeight?: number;
  onUrlChange?: (value: string) => void;
  onAsset: (asset: MediaAsset, metadata?: VideoMetadata) => void;
  onRemove?: () => void;
  onBusyChange?: (busy: boolean) => void;
}

export default function MediaUpload({
  label, purpose, courseId, mode = "UPLOAD_OR_URL", value, existingFile, disabled, allowLocalPath,
  onUrlChange, onAsset, onRemove, onBusyChange, expectedVideoHeight,
}: MediaUploadProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const abortController = useRef<AbortController>(null);
  const attempt = useRef<UploadAttempt>(null);
  const videoMetadata = useRef<VideoMetadata>(undefined);
  const [source, setSource] = useState(value || mode === "URL_ONLY" ? "url" : "upload");
  const [file, setFile] = useState<File>();
  const [objectUrl, setObjectUrl] = useState<string>();
  const [stage, setStage] = useState("");
  const [busy, setBusy] = useState(false);
  const [bytes, setBytes] = useState(0);
  const [error, setError] = useState("");
  const [invalidUrl, setInvalidUrl] = useState("");
  const settings = useQuery({
    queryKey: ["media-upload-options", purpose], queryFn: () => storageApi.options(purpose),
    enabled: mode !== "URL_ONLY", staleTime: 60_000, retry: false,
  });

  useEffect(() => () => {
    if (!abortController.current) return;
    abortController.current.abort();
    if (attempt.current?.id) void storageApi.abort(attempt.current.id).catch(() => undefined);
  }, []);
  useEffect(() => {
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [objectUrl]);

  function begin(selected: File, current: UploadAttempt) {
    if (abortController.current || disabled) return;
    const controller = new AbortController();
    abortController.current = controller;
    const active = () => abortController.current === controller && !controller.signal.aborted;
    setBusy(true);
    onBusyChange?.(true);
    setBytes(0);
    setError("");
    setStage("Preparing upload");
    async function upload() {
      if (expectedVideoHeight) {
        const metadata = await readVideoMetadata(selected, controller.signal);
        if (metadata.height !== expectedVideoHeight) {
          throw new Error(`Choose the ${expectedVideoHeight}p version. This file is ${metadata.height}p.`);
        }
      }
      return uploadFile({
      file: selected, attempt: current, purpose, courseId, signal: controller.signal,
      onStage: (value) => { if (active()) setStage(value); },
      onProgress: (value) => { if (active()) setBytes(value); },
      });
    }
    void upload().then((asset) => {
      if (!active()) return;
      onAsset(asset, videoMetadata.current);
      setBytes(selected.size);
      setStage("Upload complete");
      toast.success("File uploaded.");
    }).catch((failure: unknown) => {
      if (!active()) return;
      const message = getGraphQLErrorMessage(failure);
      const code = getGraphQLErrorCode(failure);
      if (code === "BAD_USER_INPUT" || (current.expiresAt && Date.parse(current.expiresAt) < Date.now())) {
        attempt.current = { requestId: crypto.randomUUID(), parts: new Map() };
      }
      setError(message);
      setStage("Upload failed");
      toast.error(message);
    }).finally(() => {
      if (abortController.current === controller) {
        abortController.current = null;
        setBusy(false);
        onBusyChange?.(false);
      }
    });
  }

  function choose(selected?: File) {
    if (!selected || busy || disabled) return;
    setError("");
    if (!settings.data?.enabled) {
      setError("File uploads are unavailable until R2 storage is configured.");
      return;
    }
    try { validateSelectedFile(selected, settings.data); }
    catch (failure) {
      setError(getGraphQLErrorMessage(failure));
      return;
    }
    if (attempt.current?.id && stage === "Upload failed") void storageApi.abort(attempt.current.id).catch(() => undefined);
    videoMetadata.current = undefined;
    setFile(selected);
    setObjectUrl(URL.createObjectURL(selected));
    const current = { requestId: crypto.randomUUID(), parts: new Map() };
    attempt.current = current;
    begin(selected, current);
  }

  function cancel() {
    const active = abortController.current;
    if (!active) return;
    abortController.current = null;
    active.abort();
    setStage("Upload cancelled");
    setBusy(false);
    onBusyChange?.(false);
    if (attempt.current?.id) void storageApi.abort(attempt.current.id).catch(() => toast.error("The cancelled upload will be cleaned up after it expires."));
    attempt.current = { requestId: crypto.randomUUID(), parts: new Map() };
  }

  function inputUrl(raw: string) {
    const url = raw.trim();
    if (!url || isMediaUrl(url, allowLocalPath)) {
      setInvalidUrl("");
      onUrlChange?.(raw);
    } else setInvalidUrl(raw);
  }

  const isVideo = purpose === "LESSON_VIDEO" || purpose === "COURSE_PROMOTIONAL_VIDEO";
  const isImage = !isVideo && !purpose.startsWith("LESSON_");
  const legalExistingUrl = value && (isMediaUrl(value, allowLocalPath) || /^data:image\/(?:png|jpeg|webp);base64,/i.test(value)) ? value : undefined;
  const preview = source === "upload" && objectUrl ? objectUrl : legalExistingUrl;
  const percent = file ? Math.round(bytes * 100 / file.size) : 0;

  return <div className="space-y-3" aria-label={label} aria-busy={busy}>
    {mode === "UPLOAD_OR_URL" && <div className="flex flex-wrap gap-2" role="group" aria-label={`${label} source`}>
      <Button type="button" variant={source === "upload" ? "secondary" : "outline"} aria-pressed={source === "upload"} disabled={disabled || busy}
        onClick={() => setSource("upload")}><UploadCloud aria-hidden="true" /> Upload File</Button>
      <Button type="button" variant={source === "url" ? "secondary" : "outline"} aria-pressed={source === "url"} disabled={disabled || busy}
        onClick={() => setSource("url")}><Link2 aria-hidden="true" /> Paste URL</Button>
    </div>}
    {mode !== "UPLOAD_ONLY" && source === "url" ? <>
      <Input id={id} aria-label={`${label} URL`} placeholder="https://example.com/file"
        disabled={disabled || busy} value={invalidUrl || value || ""} aria-invalid={Boolean(invalidUrl)}
        onChange={(event) => inputUrl(event.target.value)} />
      {invalidUrl && <p role="alert" className="text-xs text-destructive">Enter a valid media URL. The last valid value is kept.</p>}
    </> : <div className="space-y-2 rounded-xl border border-dashed border-brand-border bg-brand-page-secondary p-4"
      onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); choose(event.dataTransfer.files[0]); }}>
      <input ref={input} type="file" hidden aria-label={`Choose ${label.toLowerCase()} file`}
        accept={settings.data?.extensions.map((extension) => `.${extension}`).join(",")}
        onChange={(event) => { choose(event.target.files?.[0]); event.target.value = ""; }} />
      <Button type="button" variant="outline" disabled={disabled || busy || !settings.data?.enabled} onClick={() => input.current?.click()}>
        <UploadCloud aria-hidden="true" /> {file ? "Choose another file" : "Browse Files"}
      </Button>
      <p className="text-xs text-brand-text-muted">
        {settings.isPending ? "Checking upload availability…" : settings.data?.enabled
          ? `Drop a file here or browse. ${settings.data.extensions.map((extension) => extension.toUpperCase()).join(", ")} up to ${fileSize(settings.data.maxBytes)}.`
          : "File uploads are unavailable until storage is configured."}
      </p>
      {settings.isError && <Button type="button" variant="outline" size="sm" onClick={() => void settings.refetch()}>Retry storage check</Button>}
    </div>}
    {preview && isImage && <div className="max-w-xs overflow-hidden rounded-xl border border-brand-border">
      <Image src={preview} alt={`${label} preview`} width={320} height={180} unoptimized className="aspect-video w-full object-contain" />
    </div>}
    {preview && isVideo && (objectUrl === preview || /\.mp4(?:[?#]|$)/i.test(preview)) &&
      <video controls preload="metadata" src={preview} aria-label={`${label} preview`} className="max-h-60 w-full rounded-lg bg-black"
        onLoadedMetadata={(event) => {
          const video = event.currentTarget;
          const metadata = { duration: video.duration, width: video.videoWidth, height: video.videoHeight };
          if (Number.isFinite(metadata.duration) && metadata.duration > 0) videoMetadata.current = metadata;
        }} />}
    {(file || existingFile) && <p className="flex min-w-0 gap-2 text-sm text-brand-text-muted">
      <File className="size-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 wrap-break-word">{file ? `${file.name} · ${fileSize(file.size)}` : existingFile}</span>
    </p>}
    {stage && <p role="status" className="text-xs text-brand-text-muted">{stage}</p>}
    {file && busy && <div className="flex flex-wrap items-center gap-2">
      <progress max={100} value={percent} aria-label={`${label} upload progress`} className="min-w-28 flex-1 accent-primary" />
      <span className="text-xs tabular-nums text-brand-text-muted">{fileSize(bytes)} / {fileSize(file.size)} · {percent}%</span>
      <Button type="button" size="sm" variant="outline" onClick={cancel}>Cancel upload</Button>
    </div>}
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    {!busy && file && (stage === "Upload failed" || stage === "Upload cancelled") &&
      <Button type="button" variant="outline" disabled={disabled} onClick={() => { if (attempt.current) begin(file, attempt.current); }}>Retry upload</Button>}
    {onRemove && (value || existingFile || stage === "Upload complete") && !busy &&
      <Button type="button" variant="outline" disabled={disabled} onClick={() => {
        setObjectUrl(undefined); setFile(undefined); setStage(""); setInvalidUrl(""); onRemove();
      }}>Remove {label.toLowerCase()}</Button>}
  </div>;
}
