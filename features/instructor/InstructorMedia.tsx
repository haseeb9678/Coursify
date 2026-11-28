"use client";

import { ArrowUpRight, FolderOpen, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import AdminPageHeader from "@/components/layouts/admin/shared/AdminPageHeader";
import AdminFilterSelect from "@/components/layouts/admin/shared/AdminFilterSelect";
import AdminSearchInput from "@/components/layouts/admin/shared/AdminSearchInput";
import { AdminTableActionContent, AdminTableActionTrigger } from "@/components/layouts/admin/shared/AdminTableActionMenu";
import AdminDialog from "@/components/layouts/admin/shared/AdminDialog";
import AdminConfirmDialog from "@/components/layouts/admin/shared/AdminConfirmDialog";
import type { AdminTableColumn } from "@/components/layouts/admin/shared/AdminDataTable";
import { InstructorTableSkeleton } from "@/components/layouts/instructor/InstructorPageSkeletons";
import MediaUpload from "@/components/shared/media/MediaUpload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useAdminCourses } from "@/features/admin/hooks/use-admin-learning";
import { useDebouncedValue } from "@/features/admin/hooks/use-debounced-value";
import { canEditCourse } from "@/features/admin/utils/learning.utils";
import { commerceDate, statusLabel } from "@/features/commerce/commerce-format";
import { ContentIcon } from "@/features/courses/materials/ContentIcon";
import { detectContentType } from "@/features/courses/materials/content-type";
import { fileSize } from "@/features/storage/direct-upload";
import type { AdminMedia, MediaPurpose } from "@/features/storage/storage.api";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";
import { instructorApi } from "./instructor.api";
import { instructorKey, useCourseWorkspace } from "./course-workspace";
import { InstructorFilterBar, InstructorPage, panelClass, QueryPanel, useInstructorQuery, usePageControls, WorkspaceTable } from "./InstructorUI";

const purposes = {
  COURSE_THUMBNAIL: "Course thumbnail", COURSE_PROMOTIONAL_VIDEO: "Promotional video",
  LESSON_VIDEO: "Lesson video", LESSON_DOCUMENT: "Lesson PDF", LESSON_RESOURCE: "Lesson resource",
} satisfies Partial<Record<MediaPurpose, string>>;
type InstructorAsset = AdminMedia & { inUse: boolean };
type Purpose = keyof typeof purposes;
const label = (purpose: MediaPurpose) => purposes[purpose as Purpose] ?? statusLabel(purpose);
const purposeOptions = Object.entries(purposes).map(([value, label]) => ({ value, label }));

function MediaLink({ asset }: { asset: AdminMedia }) {
  const query = useInstructorQuery(["media-read", asset.id], () => instructorApi.readMedia(asset.id));
  return <QueryPanel query={query}>{({ url, expiresAt }) => <div className="space-y-3">
    <p className="text-sm text-brand-text-muted">{expiresAt ? "Private link · expires shortly" : "Public media"}</p>
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" nativeButton={false} render={<a href={url} target="_blank" rel="noreferrer" />}>
        Open file <ArrowUpRight aria-hidden="true" />
      </Button>
      {expiresAt && <Button type="button" variant="ghost" busy={query.isFetching} onClick={() => void query.refetch()}>Refresh link</Button>}
    </div>
  </div>}</QueryPanel>;
}

export default function InstructorMedia() {
  const controls = usePageControls();
  const { userId } = useCourseWorkspace();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [purpose, setPurpose] = useState<Purpose>("COURSE_THUMBNAIL");
  const [courseId, setCourse] = useState("");
  const [target, setTarget] = useState<AdminMedia | null>(null);
  const [remove, setRemove] = useState<AdminMedia | null>(null);
  const [uploading, setUploading] = useState(false);
  const settledSearch = useDebouncedValue(search);
  const courses = useAdminCourses({ page: 1, limit: 100 });
  const query = useInstructorQuery(["media", controls.pagination, settledSearch, filter],
    () => instructorApi.media(controls.pagination, settledSearch || undefined, filter || undefined));
  const refresh = () => queryClient.invalidateQueries({ queryKey: instructorKey(userId, "media") });
  const columns: AdminTableColumn<InstructorAsset>[] = [
    { id: "file", header: "File", cell: (asset) => <span className="flex items-center gap-3 font-semibold text-brand-text">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-soft text-primary">
        <ContentIcon kind={detectContentType({ mimeType: asset.mimeType, fileName: asset.originalFileName })} size={18} />
      </span>
      <span className="max-w-56 wrap-break-word">{asset.originalFileName}</span>
    </span> },
    { id: "purpose", header: "Purpose", cell: (asset) => label(asset.purpose) },
    { id: "size", header: "Size", cell: (asset) => fileSize(asset.sizeBytes) },
    { id: "status", header: "Status", cell: (asset) => <Badge variant="outline">{asset.inUse ? "In use" : statusLabel(asset.status)}</Badge> },
    { id: "date", header: "Uploaded", cell: (asset) => commerceDate(asset.createdAt) },
    { id: "actions", header: "Actions", className: "w-14 text-right", cell: (asset) => <DropdownMenu>
      <AdminTableActionTrigger label={`Actions for ${asset.originalFileName}`} />
      <AdminTableActionContent className="w-48">
        <DropdownMenuItem disabled={asset.status !== "READY"} onClick={() => setTarget(asset)}><FolderOpen aria-hidden="true" /> Open file</DropdownMenuItem>
        <DropdownMenuItem variant="destructive" disabled={asset.inUse || !["READY", "DELETING"].includes(asset.status)} onClick={() => setRemove(asset)}>
          <Trash2 aria-hidden="true" /> Delete file
        </DropdownMenuItem>
      </AdminTableActionContent>
    </DropdownMenu> },
  ];
  return <InstructorPage>
    <AdminPageHeader title="Media library" description="Upload and manage media for your courses. Lesson files are private." />
    <section className={panelClass}>
      <h2 className="border-b border-brand-border pb-3 text-base font-semibold text-brand-text">Upload media</h2>
      <div className="flex flex-wrap gap-2">
        <AdminFilterSelect label="Upload purpose" value={purpose} disabled={uploading}
          onChange={(value) => setPurpose(value as Purpose)} options={purposeOptions} />
        <AdminFilterSelect label="Attach upload to a course" searchable value={courseId} disabled={uploading} onChange={setCourse}
          options={[
            { value: "", label: purpose.startsWith("LESSON_") ? "Choose an editable course" : "Unassigned course media" },
            ...(courses.data?.items ?? []).filter(({ status }) => canEditCourse(status)).map(({ id, title }) => ({ value: id, label: title })),
          ]} />
      </div>
      <MediaUpload key={`${purpose}-${courseId}`} label={label(purpose)} purpose={purpose} courseId={courseId || undefined}
        disabled={purpose.startsWith("LESSON_") && !courseId} mode="UPLOAD_ONLY" allowLibrary={false} onBusyChange={setUploading}
        onAsset={() => { toast.success("File uploaded."); void refresh(); }} />
    </section>
    <InstructorFilterBar search={<AdminSearchInput label="Search media" placeholder="Search filenames" value={search} onChange={(value) => { setSearch(value); controls.setPage(1); }} />}>
      <AdminFilterSelect label="Filter media purpose" value={filter} onChange={(value) => { setFilter(value); controls.setPage(1); }}
        options={[{ value: "", label: "All purposes" }, ...purposeOptions]} />
    </InstructorFilterBar>
    <QueryPanel query={query} fallback={<InstructorTableSkeleton />}>{(result) => <WorkspaceTable result={result} columns={columns} controls={controls} empty="No matching uploads" />}</QueryPanel>
    <AdminDialog open={target !== null} onOpenChange={(open) => { if (!open) setTarget(null); }} title={target?.originalFileName ?? "Open media"}>
      {target && <MediaLink asset={target} />}
    </AdminDialog>
    <AdminConfirmDialog open={remove !== null} onOpenChange={(open) => { if (!open) setRemove(null); }}
      title="Delete this upload?" description={remove?.originalFileName ?? ""} confirmLabel="Delete file" isDestructive
      onConfirm={async () => {
        if (!remove) return;
        try {
          await instructorApi.deleteMedia(remove.id);
          setRemove(null);
          toast.success("File deleted.");
          await refresh();
        } catch (error) {
          toast.error(getGraphQLErrorMessage(error));
        }
      }} />
  </InstructorPage>;
}
