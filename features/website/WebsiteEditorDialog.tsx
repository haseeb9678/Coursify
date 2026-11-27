"use client";

import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import MediaUpload from "@/components/shared/media/MediaUpload";
import { useMediaPending } from "@/features/storage/use-media-pending";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import AdminDialog from "@/components/layouts/admin/shared/AdminDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";
import AdminWebsitePreview from "./AdminWebsitePreview";
import { useSaveWebsiteContent, useWebsiteItem } from "./website-hooks";
import { heroInput, popupInput, websiteFormSchema, websiteFormValues, humanize, type WebsiteForm } from "./website-forms";
import { audiences, frequencies, imagePositions, pageTargets, popupLayouts, popupTriggers, statuses, type ContentStatus, type WebsiteKind, type WebsiteRecord } from "./website-types";

type TextKey = {
  [K in keyof WebsiteForm]: WebsiteForm[K] extends string ? K : never
}[keyof WebsiteForm];
type NumberKey = {
  [K in keyof WebsiteForm]: WebsiteForm[K] extends number ? K : never
}[keyof WebsiteForm];

export function WebsiteField({ id, label, children, error }: { id: string; label: string; children: ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-brand-text">{label}</label>
      {children}
      {error && <p id={`${id}-error`} className="text-xs text-destructive" role="alert">{error}</p>}
    </div>
  );
}

export function WebsiteFormStatus({ loading, error, onRetry }: { loading: boolean; error?: string; onRetry: () => void }) {
  return loading ? (
    <div role="status" className="space-y-4">
      <span className="sr-only">Loading website content</span>
      <Skeleton className="h-9 w-full" /><Skeleton className="h-9 w-full" /><Skeleton className="h-32 w-full" />
    </div>
  ) : (
    <div className="space-y-3">
      <p role="alert" className="text-sm text-destructive">{error}</p>
      <Button type="button" variant="outline" onClick={onRetry}>Try again</Button>
    </div>
  );
}

export default function WebsiteEditorDialog({
  kind, id, mode, onClose,
}: {
  kind: WebsiteKind; id?: string; mode: "edit" | "preview"; onClose: () => void;
}) {
  const item = useWebsiteItem(kind, id);
  if (id && !item.data) {
    return (
      <AdminDialog open onOpenChange={(open) => { if (!open) onClose(); }} title={mode === "preview" ? "Preview" : "Edit website content"}>
        <WebsiteFormStatus loading={item.isPending} error={item.isError ? getGraphQLErrorMessage(item.error) : undefined}
          onRetry={() => void item.refetch()} />
      </AdminDialog>
    );
  }
  if (mode === "preview") {
    return (
      <AdminDialog open size="lg" onOpenChange={(open) => { if (!open) onClose(); }} title={item.data?.internalName ?? "Preview"}>
        <AdminWebsitePreview kind={kind} values={websiteFormValues(item.data)} />
      </AdminDialog>
    );
  }
  return <WebsiteEditor kind={kind} record={item.data} onClose={onClose} />;
}

function WebsiteEditor({ kind, record, onClose }: { kind: WebsiteKind; record?: WebsiteRecord; onClose: () => void }) {
  const mutation = useSaveWebsiteContent(kind);
  const prefix = useId();
  const locked = useRef(false);
  const [error, setError] = useState("");
  const [defaults] = useState(() => websiteFormValues(record));
  const { control, handleSubmit, register, setValue, formState } = useForm<WebsiteForm>({
    defaultValues: defaults, resolver: zodResolver(websiteFormSchema(kind)),
  });
  const values = { ...defaults, ...useWatch({ control }) };
  const media = useMediaPending();
  const busy = mutation.isPending || formState.isSubmitting;
  const saveBlocked = busy || media.pending;
  const formId = `${prefix}-content`;
  const entity = kind === "hero" ? "slide" : "popup";

  const submit = async (event?: FormEvent, status?: ContentStatus) => {
    event?.preventDefault();
    if (locked.current || media.pending) return;
    locked.current = true;
    if (status) setValue("status", status, { shouldDirty: true });
    setError("");
    try {
      await handleSubmit(async (input) => {
        await mutation.mutateAsync(kind === "hero"
          ? { kind, id: record?.id, input: heroInput(input) }
          : { kind, id: record?.id, input: popupInput(input) });
        toast.success(input.status === "ACTIVE" ? "Website content saved and activated." : "Website content saved.");
        onClose();
      }, () => toast.error("Check the highlighted fields."))();
    } catch (failure) {
      const message = getGraphQLErrorMessage(failure);
      setError(message);
      toast.error(message);
    } finally {
      locked.current = false;
    }
  };

  const text = (name: TextKey, label: string, options: { max?: number; multiline?: boolean; date?: boolean; placeholder?: string } = {}) => {
    const id = `${prefix}-${name}`;
    const error = formState.errors[name]?.message;
    const props = {
      id, maxLength: options.max, placeholder: options.placeholder, disabled: busy,
      "aria-invalid": Boolean(error), "aria-describedby": error ? `${id}-error` : undefined,
      ...register(name),
    };
    return (
      <WebsiteField id={id} label={label} error={error}>
        {options.multiline
          ? <textarea {...props} rows={3} className="w-full rounded-lg border border-brand-border bg-background p-2 text-sm" />
          : <Input {...props} type={options.date ? "datetime-local" : "text"} step={options.date ? 1 : undefined} />}
      </WebsiteField>
    );
  };

  const number = (name: NumberKey, label: string, min: number, max: number) => {
    const id = `${prefix}-${name}`;
    const error = formState.errors[name]?.message;
    return (
      <WebsiteField id={id} label={label} error={error}>
        <Input id={id} type="number" min={min} max={max} disabled={busy} aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined} {...register(name, { valueAsNumber: true })} />
      </WebsiteField>
    );
  };

  const select = <K extends TextKey>(name: K, label: string, options: readonly WebsiteForm[K][]) => {
    const id = `${prefix}-${name}`;
    const error = formState.errors[name]?.message;
    return (
      <WebsiteField id={id} label={label} error={error}>
        <Controller control={control} name={name} render={({ field }) => (
          <Select value={field.value} items={options.map((value) => ({ value, label: humanize(value) }))} disabled={busy}
            onValueChange={(value) => {
              if (value === null) return;
              field.onChange(value);
              if (name === "triggerType" && value === "ON_PAGE_LOAD") setValue("delaySeconds", 0);
              if (name === "displayFrequency" && value !== "CUSTOM_INTERVAL") setValue("repeatAfterHours", 24);
            }}>
            <SelectTrigger id={id} ref={field.ref} className="w-full" aria-invalid={Boolean(error)}
              aria-describedby={error ? `${id}-error` : undefined}><SelectValue /></SelectTrigger>
            <SelectContent>
              {options.map((value) => <SelectItem value={value} key={value}>{humanize(value)}</SelectItem>)}
            </SelectContent>
          </Select>
        )} />
      </WebsiteField>
    );
  };

  return (
    <AdminDialog open size="lg" busy={busy} title={`${record ? "Edit" : "Create"} ${entity}`}
      onOpenChange={(open) => { if (!open && !busy) onClose(); }}
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" disabled={busy} onClick={onClose}>Cancel</Button>
          <Button type="button" variant="outline" disabled={saveBlocked} onClick={() => void submit(undefined, "DRAFT")}>Save as draft</Button>
          <Button type="button" variant="outline" disabled={saveBlocked} onClick={() => void submit(undefined, "ACTIVE")}>Activate {entity}</Button>
          <Button type="submit" form={formId} disabled={media.pending} busy={busy}>Save changes</Button>
        </div>
      }>
      <form id={formId} onSubmit={submit} className="space-y-6" noValidate>
        {error && <p role="alert" className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive">{error}</p>}
        <fieldset className="space-y-3">
          <legend className="mb-2 text-sm font-semibold text-brand-text">{kind === "hero" ? "Slide information" : "Campaign information"}</legend>
          {text("internalName", "Internal name", { max: 100 })}
          {kind === "hero" && text("eyebrow", "Eyebrow", { max: 60 })}
          {text("title", "Title", { max: 110 })}
          {text("description", "Description", { multiline: true, max: kind === "hero" ? 260 : 500 })}
        </fieldset>
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="mb-2 text-sm font-semibold text-brand-text">Appearance</legend>
          {kind === "popup" && select("layout", "Layout", popupLayouts)}
          {(["imageUrl", ...(kind === "hero" ? ["mobileImageUrl"] as const : [])] as const).map((field) => {
            const label = field === "mobileImageUrl" ? "Mobile image" : kind === "hero" ? "Desktop image" : "Popup image";
            const purpose = field === "mobileImageUrl" ? "HERO_MOBILE_IMAGE" : kind === "hero" ? "HERO_IMAGE" : "PROMOTIONAL_POPUP_IMAGE";
            const update = (value: string) => setValue(field, value, { shouldDirty: true, shouldValidate: true });
            return <WebsiteField key={field} id={`${prefix}-${field}`} label={label} error={formState.errors[field]?.message}>
              <MediaUpload purpose={purpose} label={label} value={values[field]} allowLocalPath disabled={busy}
                onUrlChange={update} onAsset={(asset) => update(asset.publicUrl ?? "")} onRemove={() => update("")}
                onBusyChange={media.track(field)} />
            </WebsiteField>;
          })}
          {text("imageAlt", "Image alternative text", { max: 160 })}
          {kind === "hero" && select("imagePosition", "Image position", imagePositions)}
        </fieldset>
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="mb-2 text-sm font-semibold text-brand-text">Call to action</legend>
          {text("primaryCtaLabel", "Primary button label", { max: 40 })}
          {text("primaryCtaHref", "Primary button destination", { placeholder: "/courses" })}
          {text("secondaryCtaLabel", "Secondary button label", { max: 40 })}
          {text("secondaryCtaHref", "Secondary button destination")}
        </fieldset>
        {kind === "popup" && (
          <>
            <fieldset className="grid gap-3 sm:grid-cols-2">
              <legend className="mb-2 text-sm font-semibold text-brand-text">Display behavior</legend>
              {select("triggerType", "Trigger", popupTriggers)}
              {values.triggerType === "AFTER_DELAY" && number("delaySeconds", "Delay in seconds", 0, 120)}
              {select("displayFrequency", "Frequency", frequencies)}
              {values.displayFrequency === "CUSTOM_INTERVAL" && number("repeatAfterHours", "Repeat after hours", 1, 8760)}
              {number("priority", "Priority (higher displays first)", 0, 1000)}
            </fieldset>
            <fieldset className="grid gap-3 sm:grid-cols-2">
              <legend className="mb-2 text-sm font-semibold text-brand-text">Targeting</legend>
              {select("audience", "Audience", audiences)}
              {select("pageTarget", "Page targeting", pageTargets)}
              {values.pageTarget === "SPECIFIC_PATHS" && text("targetPaths", "Public paths, one per line", { multiline: true, placeholder: "/courses" })}
            </fieldset>
          </>
        )}
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="mb-2 text-sm font-semibold text-brand-text">Visibility and schedule</legend>
          {select("status", "Status", statuses)}
          <p className="self-end pb-2 text-xs text-brand-text-muted">Schedule times use your device timezone.</p>
          {text("startsAt", "Start (optional)", { date: true })}
          {text("endsAt", "End (optional)", { date: true })}
        </fieldset>
        <AdminWebsitePreview kind={kind} values={values} />
      </form>
    </AdminDialog>
  );
}
