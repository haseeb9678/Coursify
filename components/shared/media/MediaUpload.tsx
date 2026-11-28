"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { ArrowUpRight, File, FolderOpen, Link2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fileSize, isMediaUrl, uploadFile, validateSelectedFile, type UploadAttempt } from "@/features/storage/direct-upload";
import { storageApi, type MediaAsset, type MediaPurpose } from "@/features/storage/storage.api";
import { getGraphQLErrorCode, getGraphQLErrorMessage } from "@/lib/graphql/error";
import { cn } from "@/lib/utils";
import MediaLibraryDialog from "./MediaLibraryDialog";

export type VideoMetadata = { duration: number; width: number; height: number };

function readVideoMetadata(source: File | string, signal?: AbortSignal): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const video = document.createElement("video");
    const url = typeof source === "string" ? source : URL.createObjectURL(source);
    const timer = window.setTimeout(() => finish(new Error("The browser could not read the video resolution.")), 8000);
    const abort = () => finish(signal?.reason ?? new Error("Upload cancelled."));
    function finish(error?: Error) {
      const metadata = { duration: video.duration, width: video.videoWidth, height: video.videoHeight };
      window.clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      video.onloadedmetadata = null;
      video.onerror = null;
      video.removeAttribute("src");
      video.load();
      if (typeof source !== "string") URL.revokeObjectURL(url);
      if (error) reject(error);
      else resolve(metadata);
    }
    signal?.addEventListener("abort", abort, { once: true });
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
  allowLibrary?: boolean;
  allowedExtensions?: readonly string[];
  expectedVideoHeight?: number;
  onUrlChange?: (value: string) => void;
  onAsset: (asset: MediaAsset, metadata?: VideoMetadata) => void;
  onRemove?: () => void;
  onBusyChange?: (busy: boolean) => void;
}

export default function MediaUpload({
  label, purpose, courseId, mode = "UPLOAD_OR_URL", value, existingFile, disabled, allowLocalPath, allowLibrary = true, allowedExtensions,
  onUrlChange, onAsset, onRemove, onBusyChange, expectedVideoHeight,
}: MediaUploadProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const libraryTrigger = useRef<HTMLButtonElement>(null);
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
  const [dragging, setDragging] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryFile, setLibraryFile] = useState<{ asset: MediaAsset; url: string }>();
  const isVideo = purpose === "LESSON_VIDEO" || purpose === "COURSE_PROMOTIONAL_VIDEO";
  const settings = useQuery({
    queryKey: ["media-upload-options", purpose], queryFn: () => storageApi.options(purpose),
    enabled: mode !== "URL_ONLY", staleTime: 60_000, retry: false,
  });
  const extensions = allowedExtensions ?? settings.data?.extensions ?? [];

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
      if (isVideo) {
        const metadata = await readVideoMetadata(selected, controller.signal).catch((error: unknown) => {
          if (expectedVideoHeight || controller.signal.aborted) throw error;
          return undefined;
        });
        if (expectedVideoHeight && metadata?.height !== expectedVideoHeight) {
          throw new Error(`Choose the ${expectedVideoHeight}p version. This file is ${metadata?.height ?? "not readable"}p.`);
        }
        saveVideoMetadata(metadata);
      }
      controller.signal.throwIfAborted();
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

  function validationError(message: string) {
    setError(message);
    toast.error(message);
  }

  function saveVideoMetadata(metadata?: VideoMetadata) {
    if (metadata && Number.isFinite(metadata.duration) && metadata.duration > 0) videoMetadata.current = metadata;
  }

  function choose(files: FileList | null) {
    if (!files || busy || abortController.current || disabled) return;
    if (files.length !== 1) {
      validationError("Choose one file for this field.");
      return;
    }
    const selected = files[0];
    setError("");
    if (!settings.data?.enabled) {
      validationError("File uploads are unavailable until R2 storage is configured.");
      return;
    }
    try { validateSelectedFile(selected, { ...settings.data, formats: settings.data.formats.filter(({ extension }) => extensions.includes(extension)) }); }
    catch (failure) {
      validationError(getGraphQLErrorMessage(failure));
      return;
    }
    if (file && file.name === selected.name && file.size === selected.size && file.lastModified === selected.lastModified && file.type === selected.type) {
      validationError(stage === "Upload failed" || stage === "Upload cancelled" ? "Use Retry upload for the selected file." : "This file is already selected.");
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
      setLibraryFile(undefined);
      setFile(undefined);
      setObjectUrl(undefined);
      setStage("");
      onUrlChange?.(raw);
    } else setInvalidUrl(raw);
  }

  async function selectFromLibrary(asset: MediaAsset, url: string) {
    if (disabled || busy || abortController.current) throw new Error("This field is busy. Try again when it is available.");
    const metadata = isVideo ? await readVideoMetadata(url).catch((error: unknown) => {
      if (expectedVideoHeight) throw error;
      return undefined;
    }) : undefined;
    if (expectedVideoHeight && metadata?.height !== expectedVideoHeight) {
      throw new Error(`Select a ${expectedVideoHeight}p video for this field.`);
    }
    if (attempt.current?.id && stage === "Upload failed") void storageApi.abort(attempt.current.id).catch(() => undefined);
    attempt.current = null;
    setSource("upload");
    setFile(undefined);
    setObjectUrl(undefined);
    setInvalidUrl("");
    setError("");
    setLibraryFile({ asset, url });
    setStage("Media selected");
    onAsset(asset, metadata && Number.isFinite(metadata.duration) && metadata.duration > 0 ? metadata : undefined);
  }

  const isImage = !isVideo && !purpose.startsWith("LESSON_");
  const legalExistingUrl = value && (isMediaUrl(value, allowLocalPath) || /^data:image\/(?:png|jpeg|webp);base64,/i.test(value)) ? value : undefined;
  const preview = source === "upload" ? objectUrl ?? libraryFile?.url ?? legalExistingUrl : legalExistingUrl;
  const percent = file ? Math.round(bytes * 100 / file.size) : 0;

  return <div className="space-y-3" aria-label={label} aria-busy={busy}>
    {(mode === "UPLOAD_OR_URL" || (mode === "UPLOAD_ONLY" && allowLibrary)) && <div className="flex flex-wrap gap-2" role="group" aria-label={`${label} source`}>
      <Button type="button" variant={source === "upload" ? "secondary" : "outline"} aria-pressed={source === "upload"} disabled={disabled || busy}
        onClick={() => setSource("upload")}><UploadCloud aria-hidden="true" /> Upload from Device</Button>
      {mode === "UPLOAD_OR_URL" && <Button type="button" variant={source === "url" ? "secondary" : "outline"} aria-pressed={source === "url"} disabled={disabled || busy}
        onClick={() => setSource("url")}><Link2 aria-hidden="true" /> Enter Media URL</Button>}
      {allowLibrary && <Button ref={libraryTrigger} type="button" variant="outline" disabled={disabled || busy} onClick={() => setLibraryOpen(true)}>
        <FolderOpen aria-hidden="true" /> Select from Media Library
      </Button>}
    </div>}
    {mode !== "UPLOAD_ONLY" && source === "url" ? <>
      <Input id={id} aria-label={`${label} URL`} placeholder="https://example.com/file"
        disabled={disabled || busy} value={invalidUrl || value || ""} aria-invalid={Boolean(invalidUrl)}
        onChange={(event) => inputUrl(event.target.value)} />
      {invalidUrl && <p role="alert" className="text-xs text-destructive">Enter a valid media URL. The last valid value is kept.</p>}
    </> : <div className={cn("space-y-2 rounded-xl border border-dashed border-brand-border bg-brand-page-secondary p-4 transition-colors", dragging && "border-primary bg-primary/10")}
      onDragOver={(event) => {
        event.preventDefault();
        const ready = !disabled && !busy && settings.data?.enabled && event.dataTransfer.types.includes("Files");
        event.dataTransfer.dropEffect = ready ? "copy" : "none";
        setDragging(Boolean(ready));
      }} onDragLeave={(event) => {
        if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setDragging(false);
      }} onDrop={(event) => { event.preventDefault(); event.stopPropagation(); setDragging(false); choose(event.dataTransfer.files); }}>
      <input ref={input} type="file" hidden aria-label={`Choose ${label.toLowerCase()} file`}
        accept={extensions.map((extension) => `.${extension}`).join(",")}
        onChange={(event) => { if (event.target.files?.length) choose(event.target.files); event.target.value = ""; }} />
      <Button type="button" variant="outline" disabled={disabled || busy || !settings.data?.enabled} onClick={() => input.current?.click()}>
        <UploadCloud aria-hidden="true" /> {file || libraryFile || existingFile ? "Choose another file" : "Browse Files"}
      </Button>
      <p className="text-xs text-brand-text-muted">
        {settings.isPending ? "Checking upload availability…" : settings.data?.enabled
          ? `Drop a file here or browse. ${extensions.map((extension) => extension.toUpperCase()).join(", ")} up to ${fileSize(settings.data.maxBytes)}.`
          : "File uploads are unavailable until storage is configured."}
      </p>
      {settings.isError && <Button type="button" variant="outline" size="sm" onClick={() => void settings.refetch()}>Retry storage check</Button>}
    </div>}
    {preview && isImage && <div className="max-w-xs overflow-hidden rounded-xl border border-brand-border">
      <Image src={preview} alt={`${label} preview`} width={320} height={180} unoptimized className="aspect-video w-full object-contain" />
    </div>}
    {preview && isVideo && (objectUrl === preview || libraryFile?.url === preview || /\.mp4(?:[?#]|$)/i.test(preview)) &&
      <video controls preload="metadata" src={preview} aria-label={`${label} preview`} className="max-h-60 w-full rounded-lg bg-black"
        onLoadedMetadata={(event) => {
          const video = event.currentTarget;
          const metadata = { duration: video.duration, width: video.videoWidth, height: video.videoHeight };
          if (objectUrl === preview) saveVideoMetadata(metadata);
        }} />}
    {libraryFile && !isImage && !isVideo && <Button type="button" variant="outline" size="sm" nativeButton={false}
      render={<a href={libraryFile.url} target="_blank" rel="noreferrer" />}>Open selected file <ArrowUpRight aria-hidden="true" /></Button>}
    {(file || libraryFile || existingFile) && <p className="flex min-w-0 gap-2 text-sm text-brand-text-muted">
      <File className="size-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 wrap-break-word">{file ? `${file.name} · ${fileSize(file.size)}${file.type ? ` · ${file.type}` : ""}`
        : libraryFile ? `${libraryFile.asset.originalFileName} · ${fileSize(libraryFile.asset.sizeBytes)}` : existingFile}</span>
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
    {onRemove && (value || existingFile || libraryFile || stage === "Upload complete") && !busy &&
      <Button type="button" variant="outline" disabled={disabled} onClick={() => {
        setObjectUrl(undefined); setFile(undefined); setLibraryFile(undefined); setStage(""); setInvalidUrl(""); setError(""); onRemove();
      }}>Remove {label.toLowerCase()}</Button>}
    {libraryOpen && <MediaLibraryDialog field={{ purpose, courseId }} label={label} extensions={extensions}
      requiredExtension={allowedExtensions?.length === 1 ? allowedExtensions[0] : undefined}
      onClose={() => {
        setLibraryOpen(false);
        requestAnimationFrame(() => libraryTrigger.current?.focus());
      }} onSelect={selectFromLibrary} />}
  </div>;
}
