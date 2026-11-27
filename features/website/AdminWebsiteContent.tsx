"use client";

import { useDeferredValue, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarClock, CirclePlay, FileText, ImageIcon, Plus, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import AdminConfirmDialog from "@/components/layouts/admin/shared/AdminConfirmDialog";
import AdminDataTable, { type AdminTableColumn } from "@/components/layouts/admin/shared/AdminDataTable";
import AdminFilterSelect from "@/components/layouts/admin/shared/AdminFilterSelect";
import AdminPageHeader from "@/components/layouts/admin/shared/AdminPageHeader";
import AdminStatsGrid from "@/components/layouts/admin/shared/AdminStatsGrid";
import { AdminTableActionTrigger, AdminTableActionContent } from "@/components/layouts/admin/shared/AdminTableActionMenu";
import { useAdminTableState } from "@/features/admin/hooks/use-admin-table-state";
import { getPaginationMeta } from "@/features/admin/utils/management.utils";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";
import { useHeroSettings, useWebsiteAction, useWebsiteList, useWebsiteStats } from "./website-hooks";
import { statuses, type ContentStatus, type Sort, type Visibility, type WebsiteKind, type WebsiteRecord } from "./website-types";
import type { WebsiteAction } from "./website-api";
import { humanize } from "./website-forms";
import HeroSettingsDialog from "./HeroSettingsDialog";
import WebsiteEditorDialog from "./WebsiteEditorDialog";

const formatDate = (date: string | null) => date ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(date)) : "Any time";
const sortKeys: Record<string, Sort> = { name: "NAME", order: "ORDER", updated: "UPDATED", created: "CREATED" };
const visibility = ["LIVE", "SCHEDULED", "EXPIRED"] as const;

type Editor = { id?: string; mode: "edit" | "preview" };
type Confirmation = { input: WebsiteAction; title: string; description: string; label: string; destructive?: boolean };

function displayStatus(record: WebsiteRecord, now: number, enabled: boolean) {
  if (record.status !== "ACTIVE") return humanize(record.status);
  if (record.endsAt && Date.parse(record.endsAt) <= now) return "Expired";
  if (record.startsAt && Date.parse(record.startsAt) > now) return "Scheduled";
  return enabled ? "Live" : "Hidden";
}

export default function AdminWebsiteContent({ kind }: { kind: WebsiteKind }) {
  const isHero = kind === "hero";
  const table = useAdminTableState();
  const [search, setSearch] = useState("");
  const searchQuery = useDeferredValue(search.trim());
  const [status, setStatus] = useState<ContentStatus | "ALL">("ALL");
  const [visibilityFilter, setVisibilityFilter] = useState<Visibility | "ALL">("ALL");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[] | undefined>();

  const rows = useWebsiteList(kind, {
    pagination: { page: table.page, limit: table.pageSize },
    filter: {
      ...(searchQuery ? { search: searchQuery } : {}),
      ...(status !== "ALL" ? { status } : {}),
      ...(visibilityFilter !== "ALL" ? { visibility: visibilityFilter } : {}),
      ...(table.sorting ? { sort: sortKeys[table.sorting.column], descending: table.sorting.direction === "desc" } : {}),
    },
  });
  const stats = useWebsiteStats(kind);
  const settings = useHeroSettings(isHero);
  const action = useWebsiteAction(kind);

  const confirmAction = async () => {
    if (!confirmation) return;
    try {
      const wasLastItem = rows.data?.items.length === 1;
      await action.mutateAsync(confirmation.input);
      toast.success(confirmation.input.action === "delete" ? "Website content deleted." :
        confirmation.input.action === "move" ? "Slide order saved." : "Website content status updated.");
      if (confirmation.input.action === "delete" && wasLastItem && table.page > 1) table.setPage(table.page - 1);
      setConfirmation(null);
    } catch (error) {
      toast.error(getGraphQLErrorMessage(error));
    }
  };

  const columns: AdminTableColumn<WebsiteRecord>[] = [
    { id: "image", header: "Thumbnail", cell: (record) => (
      <div className="relative h-10 w-16 overflow-hidden rounded-md bg-brand-soft">
        {record.imageUrl && <Image key={record.imageUrl} src={record.imageUrl} alt="" fill unoptimized sizes="64px" className="object-cover"
          onError={(event) => { event.currentTarget.hidden = true; }} />}
      </div>
    ) },
    { id: "name", header: "Internal name", sortValue: (record) => record.internalName,
      cell: (record) => <span className="font-semibold text-brand-text">{record.internalName}</span> },
    { id: "title", header: "Title", cell: (record) => <p className="line-clamp-2 min-w-32">{record.title || "Untitled"}</p> },
    { id: "status", header: "Status", cell: (record) => (
      <span className="rounded-md bg-brand-soft px-2 py-1 text-xs font-medium text-brand-text">
        {displayStatus(record, Math.max(rows.dataUpdatedAt, stats.dataUpdatedAt), settings.data?.isEnabled !== false)}
      </span>
    ) },
    { id: "order", header: isHero ? "Position" : "Priority",
      sortValue: (record) => "position" in record ? record.position : record.priority,
      cell: (record) => "position" in record ? record.position : record.priority },
    ...(!isHero ? [
      { id: "audience", header: "Audience", cell: (record: WebsiteRecord) => "audience" in record ? humanize(record.audience) : null },
      { id: "frequency", header: "Frequency", cell: (record: WebsiteRecord) => "displayFrequency" in record ? humanize(record.displayFrequency) : null },
    ] : []),
    { id: "schedule", header: "Schedule", cell: (record) => record.startsAt || record.endsAt ? (
      <div className="whitespace-nowrap">
        <p>From {formatDate(record.startsAt)}</p>
        <p>{record.endsAt ? `Until ${formatDate(record.endsAt)}` : "No end date"}</p>
      </div>
    ) : "Always eligible when active" },
    { id: "updated", header: "Updated", sortValue: (record) => record.updatedAt, cell: (record) => formatDate(record.updatedAt) },
    { id: "created", header: "Created", sortValue: (record) => record.createdAt, cell: (record) => formatDate(record.createdAt) },
    { id: "actions", header: "Actions", hideable: false, cell: (record) => {
      const activate = record.status !== "ACTIVE";
      const statusLabel = activate ? "Activate" : "Deactivate";
      return (
        <DropdownMenu>
          <AdminTableActionTrigger label={`Actions for ${record.internalName}`} disabled={action.isPending} />
          <AdminTableActionContent>
            <DropdownMenuItem onClick={() => setEditor({ id: record.id, mode: "preview" })}>Preview</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditor({ id: record.id, mode: "edit" })}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setConfirmation({
              input: { action: "status", id: record.id, status: activate ? "ACTIVE" : "INACTIVE" },
              title: `${statusLabel} ${record.internalName}?`, label: statusLabel,
              description: activate ? "Publish this item when its schedule and display rules allow it." : "Remove this item from public display.",
            })}>{statusLabel}</DropdownMenuItem>
            {"position" in record && (["UP", "DOWN"] as const).map((direction) => (
              <DropdownMenuItem key={direction} disabled={direction === "UP" ? record.position <= 1 : Boolean(stats.data && record.position >= stats.data.total)}
                onClick={() => setConfirmation({
                  input: { action: "move", id: record.id, direction }, title: `Move slide ${direction.toLowerCase()}?`,
                  label: "Move slide", description: "Swap with the neighboring slide in homepage order.",
                })}>Move {direction.toLowerCase()}</DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => setConfirmation({
              input: { action: "delete", id: record.id }, title: `Delete ${record.internalName}?`,
              label: "Delete", description: "This permanently removes the content record.", destructive: true,
            })}>Delete</DropdownMenuItem>
          </AdminTableActionContent>
        </DropdownMenu>
      );
    } },
  ];

  return (
    <section className="mx-auto w-full max-w-450 space-y-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <AdminPageHeader title={isHero ? "Hero Management" : "Promotional Popups"}
        description={isHero ? "Manage homepage banners, promotional slides, and carousel settings." : "Create and schedule announcements and promotional campaigns for the public website."}
        actions={<>
          {isHero && <>
            <Button variant="outline" nativeButton={false} render={<Link href="/" target="_blank" rel="noopener noreferrer" />}>Preview homepage</Button>
            <Button type="button" variant="outline" onClick={() => setSettingsOpen(true)}><Settings2 aria-hidden="true" />Carousel Settings</Button>
          </>}
          <Button type="button" onClick={() => setEditor({ mode: "edit" })}><Plus aria-hidden="true" />{isHero ? "Add Slide" : "Create Popup"}</Button>
        </>} />
      {stats.data ? (
        <AdminStatsGrid stats={[
          { label: isHero ? "Total Slides" : "Total Campaigns", value: stats.data.total, description: "All website content in this section", icon: ImageIcon },
          { label: isHero ? "Live Slides" : "Live Campaigns", value: stats.data.live, description: "Within the active display window", icon: CirclePlay, tone: "green" },
          { label: "Scheduled", value: stats.data.scheduled, description: "Active with a future start time", icon: CalendarClock, tone: "amber" },
          { label: "Drafts", value: stats.data.drafts, description: "Content still in preparation", icon: FileText },
        ]} />
      ) : stats.isPending ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" role="status">
          <span className="sr-only">Loading statistics</span>
          {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-26 rounded-xl" aria-hidden="true" />)}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <p role="alert">Statistics could not be loaded.</p>
          <Button type="button" variant="outline" busy={stats.isFetching} onClick={() => void stats.refetch()}>Retry statistics</Button>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-border bg-card p-3">
        <Input className="h-10 max-w-sm" type="search" maxLength={100} aria-label="Search website content" placeholder="Search by name or title"
          value={search} onChange={(event) => { setSearch(event.target.value); table.setPage(1); }} />
        <AdminFilterSelect label="Filter by status" value={status}
          options={[{ value: "ALL", label: "All statuses" }, ...statuses.map((value) => ({ value, label: humanize(value) }))]}
          onChange={(value) => { table.setPage(1); setStatus(value as ContentStatus | "ALL"); }} />
        <AdminFilterSelect label="Filter by visibility" value={visibilityFilter}
          options={[{ value: "ALL", label: "Any visibility" }, ...visibility.map((value) => ({ value, label: humanize(value) }))]}
          onChange={(value) => { table.setPage(1); setVisibilityFilter(value as Visibility | "ALL"); }} />
      </div>
      {rows.isError && <Button type="button" variant="outline" busy={rows.isFetching} onClick={() => void rows.refetch()}>Retry content</Button>}
      <AdminDataTable
        columns={columns} rows={rows.data?.items ?? []} getRowId={(record) => record.id}
        pagination={rows.data?.meta ?? getPaginationMeta(0, table.page, table.pageSize)}
        onPageChange={table.setPage} onPageSizeChange={table.setPageSize} sorting={table.sorting} onSort={table.toggleSorting}
        selectedIds={table.selectedIds} isSelectionDisabled onToggleRows={table.toggleRows}
        visibleColumnIds={visibleColumns ?? columns.map((column) => column.id)} onVisibleColumnsChange={setVisibleColumns}
        isLoading={rows.isPending} error={rows.isError ? getGraphQLErrorMessage(rows.error) : null}
        emptyTitle={isHero ? "No slides found" : "No campaigns found"}
        emptyDescription="Add content or change the selected filters." />
      {editor && <WebsiteEditorDialog key={editor.mode + (editor.id ?? "new")} kind={kind} {...editor} onClose={() => setEditor(null)} />}
      {settingsOpen && <HeroSettingsDialog onClose={() => setSettingsOpen(false)} />}
      <AdminConfirmDialog open={confirmation !== null} onOpenChange={(open) => { if (!open) setConfirmation(null); }}
        title={confirmation?.title ?? ""} description={confirmation?.description ?? ""}
        confirmLabel={confirmation?.label ?? "Confirm"} isDestructive={confirmation?.destructive} onConfirm={confirmAction} />
    </section>
  );
}
