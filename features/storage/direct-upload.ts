import { storageApi, type MediaOptions, type MediaPurpose, type UploadedPart } from "./storage.api";

export function fileSize(bytes: number) {
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(3, Math.max(0, Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024))));
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: index ? 1 : 0 }).format(bytes / (1024 ** index))} ${units[index]}`;
}

export function isMediaUrl(value: string, localPaths = false) {
  if (localPaths && /^\/(?![\\/])/.test(value)) return true;
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) &&
      !url.username && !url.password && ![...url.searchParams.keys()].some((key) => /^x-amz-/i.test(key));
  } catch {
    return false;
  }
}

export function validateSelectedFile(file: File, options: MediaOptions) {
  if (!options.extensions.some((extension) => file.name.toLowerCase().endsWith(`.${extension}`))) throw new Error("Choose an accepted file type.");
  if (!file.size || file.size > options.maxBytes) throw new Error(`Choose a nonempty file up to ${fileSize(options.maxBytes)}.`);
}

class UploadResponseError extends Error {
  constructor(readonly status: number) {
    super(status ? `Storage rejected the upload (HTTP ${status}).` : "Storage could not be reached. Check your connection and upload CORS settings.");
  }
}

function put(url: string, body: Blob, signal: AbortSignal, progress: (size: number) => void, type?: string) {
  return new Promise<string | null>((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    xhr.open("PUT", url);
    xhr.timeout = 5 * 60 * 1000;
    if (type) {
      xhr.setRequestHeader("Content-Type", type);
      xhr.setRequestHeader("If-None-Match", "*");
    }
    xhr.upload.onprogress = ({ loaded }) => progress(Math.min(loaded, body.size));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        progress(body.size);
        resolve(xhr.getResponseHeader("ETag"));
      } else reject(new UploadResponseError(xhr.status));
    };
    xhr.onerror = () => reject(new UploadResponseError(0));
    xhr.ontimeout = () => reject(new Error("The upload timed out. Try again."));
    xhr.onabort = () => reject(signal.reason);
    xhr.onloadend = () => signal.removeEventListener("abort", abort);
    signal.addEventListener("abort", abort, { once: true });
    xhr.send(body);
  });
}

export interface UploadAttempt { requestId: string; id?: string; expiresAt?: string; parts: Map<number, UploadedPart> }

export async function uploadFile({ file, attempt, purpose, courseId, signal, onStage, onProgress }: {
  file: File; attempt: UploadAttempt; purpose: MediaPurpose; courseId?: string; signal: AbortSignal;
  onStage: (stage: "Uploading" | "Retrying" | "Verifying") => void;
  onProgress: (bytes: number) => void;
}) {
  const authorization = await storageApi.create({
    requestId: attempt.requestId, purpose, courseId, fileName: file.name, mimeType: file.type, sizeBytes: file.size,
  });
  attempt.id = authorization.asset.id;
  attempt.expiresAt = authorization.expiresAt;
  if (signal.aborted) {
    await storageApi.abort(authorization.asset.id).catch(() => undefined);
    signal.throwIfAborted();
  }
  if (authorization.asset.status === "READY") return authorization.asset;
  onStage("Uploading");
  const partSize = authorization.partSize;
  if (partSize) {
    const workers = new AbortController();
    const stop = () => workers.abort(signal.reason);
    signal.addEventListener("abort", stop, { once: true });
    try {
      const count = Math.ceil(file.size / partSize);
      const remaining = Array.from({ length: count }, (_, index) => index + 1).filter((part) => !attempt.parts.has(part));
      const sizeOf = (part: number) => Math.min(partSize, file.size - (part - 1) * partSize);
      const progress = new Map([...attempt.parts.keys()].map((part) => [part, sizeOf(part)]));
      const track = (part: number, loaded: number) => {
        progress.set(part, loaded);
        onProgress([...progress.values()].reduce((sum, value) => sum + value, 0));
      };
      let next = 0;
      async function worker(size: number) {
        while (next < remaining.length) {
          const part = remaining[next++];
          const offset = (part - 1) * size;
          const blob = file.slice(offset, offset + sizeOf(part));
          for (let retry = 0; ; retry++) {
            workers.signal.throwIfAborted();
            try {
              const [signed] = await storageApi.parts(authorization.asset.id, [part]);
              const etag = await put(signed.url, blob, workers.signal, (bytes) => track(part, bytes));
              if (!etag) throw new Error("Storage CORS must expose the ETag header for multipart uploads.");
              attempt.parts.set(part, { partNumber: part, etag });
              onStage("Uploading");
              break;
            } catch (error) {
              if (workers.signal.aborted || retry >= 2) throw error;
              onStage("Retrying");
              track(part, 0);
            }
          }
        }
      }
      const operations = Array.from({ length: Math.min(3, remaining.length) }, () => worker(partSize).catch((error: unknown) => {
        workers.abort(error);
        throw error;
      }));
      const outcomes = await Promise.allSettled(operations);
      const failed = outcomes.find((item) => item.status === "rejected");
      if (failed) throw failed.reason;
    } finally {
      signal.removeEventListener("abort", stop);
    }
  } else if (authorization.url) {
    try {
      await put(authorization.url, file, signal, onProgress, authorization.asset.mimeType);
    } catch (error) {
      // A successful PUT may have lost its response. R2 still verifies the contents before publication.
      if (!(error instanceof UploadResponseError) || error.status !== 412) throw error;
    }
  }
  signal.throwIfAborted();
  onStage("Verifying");
  return storageApi.complete(authorization.asset.id, partSize ? [...attempt.parts.values()] : undefined);
}
