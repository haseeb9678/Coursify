"use client";

import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, File, FileVideo } from "lucide-react";
import AdminDialog from "@/components/layouts/admin/shared/AdminDialog";
import AdminEmptyState from "@/components/layouts/admin/shared/AdminEmptyState";
import AdminErrorState from "@/components/layouts/admin/shared/AdminErrorState";
import AdminFilterSelect from "@/components/layouts/admin/shared/AdminFilterSelect";
import AdminSearchInput from "@/components/layouts/admin/shared/AdminSearchInput";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/features/admin/hooks/use-debounced-value";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { fileSize } from "@/features/storage/direct-upload";
import { storageApi, type MediaAsset, type MediaSelectionField } from "@/features/storage/storage.api";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";
import { cn } from "@/lib/utils";

function Thumbnail({ asset }: { asset: MediaAsset }) {
  const [broken, setBroken] = useState(false);
  const Icon = asset.mimeType.startsWith("video/") ? FileVideo : File;
  return <div className="relative grid aspect-video place-items-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
    {asset.publicUrl && asset.mimeType.startsWith("image/") && !broken
      ? <Image src={asset.publicUrl} alt="" fill unoptimized sizes="160px" className="object-cover" onError={() => setBroken(true)} />
      : <Icon size={24} aria-hidden="true" />}
  </div>;
}

function SelectionPreview({ asset, field, userId }: { asset: MediaAsset; field: MediaSelectionField; userId?: string }) {
  const query = useQuery({
    queryKey: ["media-selection-preview", userId, field, asset.id],
    queryFn: ({ signal }) => storageApi.selectionPreview(field, asset.id, signal),
    staleTime: 30_000, retry: false,
  });
  if (query.isPending) return <Skeleton className="h-10 w-32" aria-label="Loading file preview" role="status" />;
  if (query.isError) return <Button variant="outline" type="button" size="sm" onClick={() => void query.refetch()}>Retry preview</Button>;
  const { url } = query.data;
  return asset.mimeType.startsWith("video/")
    ? <video src={url} controls preload="metadata" aria-label={asset.originalFileName} className="max-h-56 w-full rounded-lg bg-black" />
    : <Button variant="outline" size="sm" nativeButton={false} render={<a href={url} target="_blank" rel="noreferrer" />}>Open file <ArrowUpRight aria-hidden="true" /></Button>;
}

export default function MediaLibraryDialog({ field, label, extensions, requiredExtension, onSelect, onClose }: {
  field: MediaSelectionField;
  label: string;
  extensions: readonly string[];
  requiredExtension?: string;
  onSelect: (asset: MediaAsset, url: string) => void | Promise<void>;
  onClose: () => void;
}) {
  const userId = useAuthStore((state) => state.user?.id);
  const [search, setSearch] = useState("");
  const [extension, setExtension] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string>();
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const confirming = useRef(false);
  const [error, setError] = useState("");
  const settled = useDebouncedValue(search.trim());
  const query = useQuery({
    queryKey: ["media-selection", userId, field, settled, requiredExtension ?? extension, page],
    queryFn: ({ signal }) => storageApi.select({ page, limit: 12 }, { ...field, search: settled || undefined, extension: requiredExtension ?? (extension || undefined) }, signal),
    enabled: Boolean(userId), retry: false,
  });
  const selected = query.data?.items.find(({ id }) => id === selectedId);

  function changePage(nextPage: number) {
    setPage(nextPage);
    setSelectedId(undefined);
    setShowPreview(false);
    setError("");
  }

  async function confirm() {
    if (!selected || confirming.current || query.isFetching) return;
    confirming.current = true;
    setSaving(true);
    setError("");
    try {
      const { url } = await storageApi.selectionPreview(field, selected.id);
      await onSelect(selected, url);
      onClose();
    } catch (failure) {
      setError(getGraphQLErrorMessage(failure));
    } finally {
      confirming.current = false;
      setSaving(false);
    }
  }

  return <AdminDialog open size="lg" busy={saving} title="Select from Media Library"
    description={`Choose a compatible file for ${label.toLowerCase()}.`}
    onOpenChange={(open) => { if (!open && !saving) onClose(); }}
    footer={<>
      <Button type="button" variant="outline" disabled={saving} onClick={onClose}>Cancel</Button>
      <Button type="button" busy={saving} disabled={!selected || query.isFetching} onClick={() => void confirm()}>Select Media</Button>
    </>}>
    <div className="space-y-4" aria-busy={query.isFetching || saving}>
      <fieldset disabled={saving} className="flex flex-wrap items-center gap-2">
        <AdminSearchInput value={search} label="Search media" placeholder="Search filenames" onChange={(value) => { setSearch(value.slice(0, 120)); changePage(1); }} />
        <AdminFilterSelect label="File type" value={requiredExtension ?? extension} disabled={saving || Boolean(requiredExtension)} onChange={(value) => { setExtension(value); changePage(1); }}
          options={[{ value: "", label: "All file types" }, ...extensions.map((type) => ({ value: type, label: type.toUpperCase() }))]} />
      </fieldset>
      {query.isPending ? <div role="status" aria-label="Loading media" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-28 rounded-xl" />)}
      </div> : query.isError ? <div className="space-y-2">
        <AdminErrorState title="Media could not be loaded" description={getGraphQLErrorMessage(query.error)} />
        <Button type="button" variant="outline" busy={query.isFetching} onClick={() => void query.refetch()}>Try again</Button>
      </div> : query.data.items.length ? <div role="group" aria-label="Compatible media" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {query.data.items.map((asset) => <button key={asset.id} type="button" disabled={saving} aria-pressed={selectedId === asset.id}
          className={cn("relative min-w-0 space-y-1.5 rounded-xl border bg-card p-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring", selectedId === asset.id ? "border-primary bg-primary/5" : "border-brand-border hover:border-primary/40")}
          onClick={() => { setSelectedId(asset.id); setShowPreview(false); setError(""); }}>
          <Thumbnail asset={asset} />
          {selectedId === asset.id && <Check size={20} aria-hidden="true" className="absolute top-2.5 right-2.5 rounded-full bg-primary p-0.5 text-primary-foreground" />}
          <p className="truncate text-xs font-semibold text-brand-text" title={asset.originalFileName}>{asset.originalFileName}</p>
          <p className="text-[11px] text-brand-text-muted">{asset.originalFileName.split(".").at(-1)?.toUpperCase()} · {fileSize(asset.sizeBytes)}</p>
        </button>)}
      </div> : <AdminEmptyState title="No compatible files found" description="Search another filename or upload a file for this field." />}
      {selected && <div className="space-y-2">
        <Button type="button" variant="outline" size="sm" aria-expanded={showPreview} disabled={saving} onClick={() => setShowPreview((open) => !open)}>
          {showPreview ? "Hide preview" : "Preview selected file"}
        </Button>
        {showPreview && <SelectionPreview key={selected.id} asset={selected} field={field} userId={userId} />}
      </div>}
      {query.data && query.data.meta.totalPages > 1 && <div className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-border pt-3">
        <span className="text-xs text-brand-text-muted">Page {query.data.meta.page} of {query.data.meta.totalPages}</span>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" disabled={saving || !query.data.meta.hasPrevious} onClick={() => changePage(page - 1)}><ArrowLeft aria-hidden="true" /> Previous</Button>
          <Button type="button" size="sm" variant="outline" disabled={saving || !query.data.meta.hasNext} onClick={() => changePage(page + 1)}>Next <ArrowRight aria-hidden="true" /></Button>
        </div>
      </div>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  </AdminDialog>;
}
