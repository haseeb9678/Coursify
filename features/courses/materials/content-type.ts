export type ContentKind = "video" | "text" | "pdf" | "image" | "audio" | "link" |
  "archive" | "document" | "spreadsheet" | "presentation" | "code" | "file";

interface MaterialMetadata {
  type?: string;
  mimeType?: string | null;
  fileName?: string | null;
  url?: string | null;
}

const specificTypes = new Map<string, ContentKind>([
  ["VIDEO", "video"], ["TEXT", "text"], ["PDF", "pdf"], ["IMAGE", "image"], ["AUDIO", "audio"],
  ["LINK", "link"], ["ARCHIVE", "archive"], ["SPREADSHEET", "spreadsheet"], ["PRESENTATION", "presentation"], ["CODE", "code"],
]);

const extensions = new Map<string, ContentKind>(
  ([
    ["video", "mp4 webm mov m4v avi mkv ogv"], ["text", "txt md markdown log"], ["pdf", "pdf"],
    ["image", "jpg jpeg png webp svg gif avif bmp tif tiff ico"], ["audio", "mp3 wav ogg opus flac aac m4a"],
    ["archive", "zip rar tar gz tgz 7z bz2 xz"], ["document", "doc docx odt rtf"],
    ["spreadsheet", "xls xlsx ods csv tsv"], ["presentation", "ppt pptx odp"],
    ["code", "js jsx ts tsx py html css scss xml json yaml yml sql sh java go rs c cpp cs php rb"],
  ] satisfies [ContentKind, string][]).flatMap(([kind, list]) =>
    list.split(" ").map((extension): [string, ContentKind] => [extension, kind])),
);

function extensionKind(name?: string | null): ContentKind | undefined {
  const file = name?.split(/[?#]/, 1)[0];
  if (!file) return;
  const extension = /\.([a-z0-9]+)$/i.exec(file)?.[1];
  return extension ? extensions.get(extension.toLowerCase()) : undefined;
}

function mimeKind(mime: string): ContentKind | undefined {
  if (mime === "application/pdf") return "pdf";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("audio/")) return "audio";
  if (/spreadsheet|ms-excel|text\/(csv|tab-separated-values)/.test(mime)) return "spreadsheet";
  if (/presentation|powerpoint/.test(mime)) return "presentation";
  if (/wordprocessing|msword|opendocument\.text|\/rtf/.test(mime)) return "document";
  if (/zip|compressed|x-tar|x-rar/.test(mime)) return "archive";
  if (/javascript|json|xml|yaml|text\/(css|html|x-)/.test(mime)) return "code";
  if (mime === "text/markdown" || mime === "text/plain") return "text";
}

export function detectContentType({ type, mimeType, fileName, url }: MaterialMetadata): ContentKind {
  const declared = type?.toUpperCase() ?? "";
  const mime = mimeType?.split(";")[0].trim().toLowerCase() ?? "";
  const path = url && URL.canParse(url) ? new URL(url).pathname : url;
  return specificTypes.get(declared) ?? mimeKind(mime) ?? extensionKind(fileName) ?? extensionKind(path) ??
    (declared === "DOCUMENT" ? "document" : "file");
}
