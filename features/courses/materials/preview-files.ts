import type { MediaRead } from "@/features/storage/storage.api";

const maxPreviewBytes = 200 * 1024 * 1024;

class FileResponseError extends Error {
  readonly status: number;

  constructor(status: number) {
    super("The file could not be loaded. Try again.");
    this.status = status;
  }
}

async function fetchFile(url: string, signal: AbortSignal): Promise<Blob> {
  let response: Response;
  try {
    response = await fetch(url, { signal, credentials: "omit", cache: "no-store", referrerPolicy: "no-referrer" });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new FileResponseError(0);
  }
  if (!response.ok) throw new FileResponseError(response.status);
  if (Number(response.headers.get("content-length")) > maxPreviewBytes) {
    await response.body?.cancel();
    throw new Error("This file is too large for an inline preview.");
  }
  const file = await response.blob();
  if (file.size > maxPreviewBytes) throw new Error("This file is too large for an inline preview.");
  return file;
}

export async function loadAuthorizedPreviewFile(
  read: (signal: AbortSignal) => Promise<MediaRead>, signal: AbortSignal,
): Promise<Blob> {
  signal.throwIfAborted();
  let access = await read(signal);
  for (let attempt = 0; attempt < 2; attempt++) {
    signal.throwIfAborted();
    try {
      if (access.expiresAt && Date.parse(access.expiresAt) <= Date.now()) throw new FileResponseError(403);
      return await fetchFile(access.url, signal);
    } catch (error) {
      // R2 can omit CORS headers on an expired response, which appears as a network failure.
      if (attempt || signal.aborted || !(error instanceof FileResponseError) ||
          ![0, 401, 403].includes(error.status)) throw error;
      access = await read(signal);
    }
  }
  throw new Error("The file could not be loaded. Try again.");
}

export function loadExternalPreviewFile(url: string, signal: AbortSignal) {
  return fetchFile(url, signal);
}

export async function readPdf(file: Blob): Promise<Blob> {
  const prefix = await file.slice(0, 1024).text();
  if (!/^%PDF-\d+\.\d+/.test(prefix)) throw new Error("This file is not a readable PDF.");
  return file.slice(0, file.size, "application/pdf");
}

export function readPlainText(file: Blob): Promise<string> {
  const type = file.type.split(";")[0];
  if (type && !["text/plain", "text/markdown", "application/octet-stream"].includes(type)) {
    return Promise.reject(new Error("This file is not supported as plain text."));
  }
  return file.text();
}

export function materialFilename(title: string, extension: "txt" | "pdf"): string {
  const printable = [...title].filter((character) => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127).join("");
  const base = printable.replace(/[<>:"/\\|?*\u202a-\u202e\u2066-\u2069]/g, "-").trim()
    .replace(/^[. ]+|[. ]+$/g, "").replace(new RegExp(`\\.${extension}$`, "i"), "").slice(0, 100)
    .replace(/[. ]+$/g, "");
  const safe = /^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i.test(base) ? `_${base}` : base;
  return `${safe || "lesson"}.${extension}`;
}

export function downloadPreview(url: string, filename: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
}

export function downloadText(text: string, title: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  try {
    downloadPreview(url, materialFilename(title, "txt"));
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }
}

export async function copyPreviewText(text: string): Promise<void> {
  if (!navigator.clipboard?.writeText) throw new Error("Clipboard access is unavailable.");
  await navigator.clipboard.writeText(text);
}
