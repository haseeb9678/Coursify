"use client";

import { useCallback, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Copy, Eye, HardDrive, Image as ImageIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AdminDataTable, { type AdminTableColumn } from "@/components/layouts/admin/shared/AdminDataTable";
import AdminPageHeader from "@/components/layouts/admin/shared/AdminPageHeader";
import AdminFilterSelect from "@/components/layouts/admin/shared/AdminFilterSelect";
import AdminTableToolbar from "@/components/layouts/admin/shared/AdminTableToolbar";
import AdminConfirmDialog from "@/components/layouts/admin/shared/AdminConfirmDialog";
import AdminDialog from "@/components/layouts/admin/shared/AdminDialog";
import { AdminTableActionContent, AdminTableActionTrigger } from "@/components/layouts/admin/shared/AdminTableActionMenu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useDebouncedValue } from "@/features/admin/hooks/use-debounced-value";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { commerceDate } from "@/features/commerce/commerce-format";
import LessonVideoPlayer from "@/features/commerce/LessonVideoPlayer";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";
import { fileSize } from "./direct-upload";
import { SignedDocument, SignedPdf, SignedVideo } from "./ManagedMedia";
import { purposes, storageApi, type AdminMedia, type MediaStats } from "./storage.api";

const defaultFilters = { search: "", purpose: "all", visibility: "all", status: "all", fileType: "all", from: "", to: "" };
const noSelection = new Set<string>();
const baseMeta = { total: 0, totalPages: 0, hasNext: false, hasPrevious: false };
const label = (value: string) => value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());

function preview(asset: AdminMedia) {
  return asset.publicUrl && asset.mimeType.startsWith("image/")
    ? <Image unoptimized src={asset.publicUrl} alt="" width={56} height={40} className="h-10 w-14 rounded-lg object-cover" />
    : <div className="grid h-10 w-14 place-items-center rounded-lg bg-brand-soft text-primary"><ImageIcon className="size-4" aria-hidden="true" /></div>;
}

export default function AdminMediaLibrary() {
  const id = useAuthStore((state) => state.user?.id);
  return id ? <MediaLibrary key={id} userId={id} /> : <Skeleton className="m-6 h-32" />;
}

function MediaLibrary({ userId }: { userId: string }) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [oldestFirst, setOldestFirst] = useState(false);
  const [details, setDetails] = useState<AdminMedia>();
  const [deletion, setDeletion] = useState<AdminMedia | "cleanup">();
  const search = useDebouncedValue(filters.search.trim());
  const queryScope = ["admin-media", userId];
  const parameters = { search: search || undefined, purpose: filters.purpose === "all" ? undefined : filters.purpose,
    visibility: filters.visibility === "all" ? undefined : filters.visibility, status: filters.status === "all" ? undefined : filters.status,
    fileType: filters.fileType === "all" ? undefined : filters.fileType,
    from: filters.from ? `${filters.from}T00:00:00.000Z` : undefined, to: filters.to ? `${filters.to}T23:59:59.999Z` : undefined };
  const stats = useQuery({ queryKey: [...queryScope, "stats"], queryFn: storageApi.stats, retry: false });
  const records = useQuery({
    queryKey: [...queryScope, "list", page, limit, parameters, oldestFirst],
    queryFn: () => storageApi.list({ page, limit }, parameters, oldestFirst),
    placeholderData: keepPreviousData, retry: false,
  });
  const remove = useMutation<boolean | number, Error, AdminMedia | "cleanup">({
    mutationFn: (target: AdminMedia | "cleanup") => target === "cleanup" ? storageApi.cleanup() : storageApi.delete(target.id),
    onSuccess: async (result) => {
      toast.success(typeof result === "number" ? `Cleanup processed ${result} items.` : "Unused media deleted.");
      setDeletion(undefined);
      setDetails(undefined);
      await queryClient.invalidateQueries({ queryKey: queryScope });
    },
    onError: (error) => toast.error(getGraphQLErrorMessage(error)),
  });
  function change<K extends keyof typeof defaultFilters>(key: K, value: string) {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setPage(1);
  }
  async function copy(asset: AdminMedia) {
    if (!asset.publicUrl) return;
    try { await navigator.clipboard.writeText(asset.publicUrl); toast.success("Public URL copied."); }
    catch { toast.error("The browser could not copy this URL."); }
  }
  const columns: AdminTableColumn<AdminMedia>[] = [
    { id: "preview", header: "Preview", cell: preview },
    { id: "name", header: "File name", className: "min-w-44 wrap-break-word", cell: (row) => row.originalFileName },
    { id: "type", header: "File type", cell: (row) => row.mimeType },
    { id: "purpose", header: "Purpose", cell: (row) => label(row.purpose) },
    { id: "size", header: "Size", cell: (row) => fileSize(row.sizeBytes) },
    { id: "visibility", header: "Visibility", cell: (row) => label(row.visibility) },
    { id: "status", header: "Status", cell: (row) => <Badge variant="outline">{label(row.status)}</Badge> },
    { id: "uploader", header: "Uploaded by", cell: (row) => row.uploader ?? "Unavailable" },
    { id: "date", header: "Created", sortValue: (row) => row.createdAt, cell: (row) => commerceDate(row.createdAt) },
    { id: "attachment", header: "Attachments", cell: (row) => row.attachments.length || "Unattached" },
    { id: "actions", header: "Actions", hideable: false, className: "w-14 text-right", cell: (row) => <DropdownMenu>
      <AdminTableActionTrigger label={`Actions for ${row.originalFileName}`} />
      <AdminTableActionContent className="w-48">
        <DropdownMenuItem onClick={() => setDetails(row)}><Eye aria-hidden="true" /> View details</DropdownMenuItem>
        {row.publicUrl && <DropdownMenuItem onClick={() => void copy(row)}><Copy aria-hidden="true" /> Copy public URL</DropdownMenuItem>}
        {row.attachments.length === 0 && (row.status === "READY" || row.status === "DELETING") && (
          <DropdownMenuItem variant="destructive" disabled={!stats.data?.enabled} onClick={() => setDeletion(row)}>
            <Trash2 aria-hidden="true" /> Delete unused media
          </DropdownMenuItem>
        )}
      </AdminTableActionContent>
    </DropdownMenu> },
  ];
  const [visible, setVisible] = useState(() => columns.map(({ id }) => id));
  const filterOptions = (items: readonly string[]) => [{ label: "All", value: "all" }, ...items.map((value) => ({ label: label(value), value }))];
  return <main className="mx-auto w-full max-w-450 space-y-5 p-4 sm:p-6 lg:p-8">
    <AdminPageHeader title="Media Library" description="Review uploaded files and monitor LMS-tracked storage and reservations."
      actions={<Button variant="outline" disabled={!stats.data?.enabled} onClick={() => setDeletion("cleanup")}>
        <HardDrive aria-hidden="true" /> Clean up expired and unused uploads
      </Button>} />
    {stats.isPending ? <Skeleton className="h-40 w-full" /> : stats.data ? <Usage stats={stats.data} />
      : <p role="alert" className="text-sm text-destructive">{getGraphQLErrorMessage(stats.error)}</p>}
    <AdminTableToolbar search={filters.search} searchLabel="Search uploaded files" searchPlaceholder="Search file names"
      onSearchChange={(value) => change("search", value)} onClear={() => { setFilters(defaultFilters); setPage(1); }}
      filtersActive={Object.keys(defaultFilters).some((key) => filters[key as keyof typeof filters] !== defaultFilters[key as keyof typeof filters])}
      filters={<>
        <AdminFilterSelect label="File type" value={filters.fileType} options={filterOptions(["image", "video", "document"])} onChange={(value) => change("fileType", value)} />
        <AdminFilterSelect label="Purpose" value={filters.purpose} options={filterOptions(purposes)} onChange={(value) => change("purpose", value)} />
        <AdminFilterSelect label="Visibility" value={filters.visibility} options={filterOptions(["PUBLIC", "PRIVATE"])} onChange={(value) => change("visibility", value)} />
        <AdminFilterSelect label="Status" value={filters.status} options={filterOptions(["PENDING", "READY", "FAILED", "ABORTED", "DELETING", "DELETED"])} onChange={(value) => change("status", value)} />
        <Input type="date" className="w-auto" aria-label="Uploaded from" value={filters.from} max={filters.to || undefined} onChange={(event) => change("from", event.target.value)} />
        <Input type="date" className="w-auto" aria-label="Uploaded to" value={filters.to} min={filters.from || undefined} onChange={(event) => change("to", event.target.value)} />
      </>} actions={<Button variant="outline" busy={records.isFetching || stats.isFetching} onClick={() => { void records.refetch(); void stats.refetch(); }}>Refresh</Button>} />
    <AdminDataTable rows={records.data?.items ?? []} columns={columns} getRowId={(row) => row.id} showSelection={false}
      pagination={records.data?.meta ?? { ...baseMeta, page, limit }} onPageChange={setPage}
      onPageSizeChange={(value) => { setLimit(value); setPage(1); }}
      sorting={{ column: "date", direction: oldestFirst ? "asc" : "desc" }} onSort={() => { setOldestFirst(!oldestFirst); setPage(1); }}
      selectedIds={noSelection} onToggleRows={() => {}} visibleColumnIds={visible} onVisibleColumnsChange={setVisible}
      isLoading={records.isPending} isPlaceholderData={records.isPlaceholderData} isPaginationDisabled={records.isFetching}
      error={records.isError ? getGraphQLErrorMessage(records.error) : null} emptyTitle="No media found"
      emptyDescription="Uploaded files and pending reservations appear here." />
    {details && <AssetDetails key={details.id} asset={details} userId={userId} onClose={() => setDetails(undefined)} onCopy={() => void copy(details)} />}
    <AdminConfirmDialog open={Boolean(deletion)} onOpenChange={(open) => { if (!open && !remove.isPending) setDeletion(undefined); }}
      title={deletion === "cleanup" ? "Run media cleanup?" : "Delete unused media?"}
      description={deletion === "cleanup" ? "Process expired staging files and unused verified assets past their retention period."
        : `${deletion?.originalFileName ?? "This file"} will be removed from storage if it has no active references.`}
      confirmLabel={deletion === "cleanup" ? "Run cleanup" : "Delete file"} isDestructive isDisabled={remove.isPending}
      onConfirm={async () => { if (deletion) await remove.mutateAsync(deletion).catch(() => undefined); }} />
  </main>;
}

function Usage({ stats }: { stats: MediaStats }) {
  const warning = stats.reservedBytes >= stats.softLimit;
  const figures = [
    ["Stored files", stats.stored], ["Images", stats.images], ["Videos", stats.videos], ["Documents", stats.documents],
    ["Public storage", fileSize(stats.publicBytes)], ["Private storage", fileSize(stats.privateBytes)],
    ["Pending", stats.pending], ["Failed", stats.failed], ["Unattached", stats.unattached],
  ];
  return <section className="space-y-3 rounded-xl border border-brand-border bg-card p-4">
    <div className="flex flex-wrap items-center justify-between gap-1 text-sm">
      <h2 className="font-semibold text-brand-text">LMS storage usage</h2>
      <span className="text-brand-text-muted">{fileSize(stats.storedBytes)} verified · {fileSize(stats.reservedBytes)} including reservations</span>
    </div>
    <progress aria-label="Application storage quota" max={stats.hardLimit} value={stats.reservedBytes} className="w-full accent-primary" />
    <p className="text-xs text-brand-text-muted">{fileSize(stats.softLimit)} warning threshold · {fileSize(stats.hardLimit)} application limit</p>
    {warning && <p role="status" className="text-sm font-medium text-destructive">Storage reservations have reached the warning threshold.</p>}
    {!stats.enabled && <p className="text-sm text-brand-text-muted">R2 uploads and private reads are disabled until storage is configured.</p>}
    <dl className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {figures.map(([name, value]) => <div key={name} className="rounded-lg border border-brand-border px-3 py-2">
        <dt className="text-xs text-brand-text-muted">{name}</dt><dd className="text-sm font-semibold text-brand-text">{value}</dd>
      </div>)}
    </dl>
  </section>;
}

function AssetDetails({ asset, userId, onClose, onCopy }: { asset: AdminMedia; userId: string; onClose: () => void; onCopy: () => void }) {
  const read = useCallback(() => storageApi.adminRead(asset.id), [asset.id]);
  const [showPreview, setShowPreview] = useState(false);
  const details = [["Type", asset.mimeType], ["Size", fileSize(asset.sizeBytes)], ["Visibility", label(asset.visibility)],
    ["Purpose", label(asset.purpose)], ["Status", label(asset.status)], ["Uploaded by", asset.uploader ?? "Unavailable"],
    ["Created", commerceDate(asset.createdAt)], ["Attachments", String(asset.attachments.length)]];
  return <AdminDialog open title={asset.originalFileName} description="Media details" onOpenChange={(open) => { if (!open) onClose(); }}>
    <div className="space-y-4">
      {asset.status === "READY" && <>
        {asset.publicUrl && asset.mimeType.startsWith("image/") && <Image unoptimized src={asset.publicUrl} alt={asset.originalFileName}
          width={480} height={280} className="max-h-56 w-full rounded-lg object-contain" />}
        {asset.mimeType.startsWith("video/") && (showPreview
          ? asset.publicUrl ? <LessonVideoPlayer source={asset.publicUrl} title={asset.originalFileName} />
            : <SignedVideo cacheKey={["admin-media-preview", userId, asset.id]} title={asset.originalFileName} read={read} />
          : <Button variant="outline" onClick={() => setShowPreview(true)}>Preview video</Button>)}
        {!asset.publicUrl && !asset.mimeType.startsWith("video/") && (asset.purpose === "LESSON_DOCUMENT"
          ? <SignedPdf title={asset.originalFileName} read={read} /> : <SignedDocument title="file" read={read} />)}
        {asset.publicUrl && <Button variant="outline" onClick={onCopy}><Copy aria-hidden="true" /> Copy public URL</Button>}
      </>}
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        {details.map(([name, value]) => <div key={name} className="min-w-0"><dt className="text-xs text-brand-text-muted">{name}</dt><dd className="wrap-break-word">{value}</dd></div>)}
      </dl>
      {asset.attachments.length > 0 && <ul className="space-y-2 text-sm">
        {asset.attachments.map(({ entityType, entityId }, index) => {
          const href = entityType === "COURSE" ? `/admin/courses/${entityId}` :
            entityType === "CATEGORY" ? "/admin/categories" : entityType === "HERO" ? "/admin/website/hero" :
            entityType === "POPUP" ? "/admin/website/popups" :
              asset.courseScopeId && (entityType === "LESSON" || entityType === "RESOURCE") ? `/admin/courses/${asset.courseScopeId}/curriculum` : null;
          const name = label(entityType);
          return <li key={`${entityType}-${entityId}-${index}`}>{href ? <Link href={href} className="text-primary underline">View {name.toLowerCase()}</Link> : name}</li>;
        })}
      </ul>}
    </div>
  </AdminDialog>;
}
