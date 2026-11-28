import {
  CirclePlay, ExternalLink, File, FileArchive, FileCode, FileSpreadsheet,
  FileText, FileType, Headphones, Image, Presentation, type LucideProps,
} from "lucide-react";
import type { ContentKind } from "./content-type";

const icons = {
  video: CirclePlay, text: FileText, pdf: FileType, image: Image, audio: Headphones, link: ExternalLink,
  archive: FileArchive, document: FileText, spreadsheet: FileSpreadsheet, presentation: Presentation,
  code: FileCode, file: File,
};

export const contentLabels: Record<ContentKind, string> = {
  video: "Video", text: "Text", pdf: "PDF document", image: "Image", audio: "Audio", link: "External link",
  archive: "Archive", document: "Document", spreadsheet: "Spreadsheet", presentation: "Presentation",
  code: "Code file", file: "File",
};

export function ContentIcon({ kind, ...props }: LucideProps & { kind: ContentKind }) {
  const Icon = icons[kind];
  return <Icon aria-hidden="true" {...props} />;
}
