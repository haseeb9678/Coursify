"use client";

import { useRef, useState, type FormEvent } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import AdminDialog from "@/components/layouts/admin/shared/AdminDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";
import { WebsiteField, WebsiteFormStatus } from "./WebsiteEditorDialog";
import { useHeroSettings, useSaveHeroSettings } from "./website-hooks";
import { heroSettingsSchema } from "./website-forms";
import type { HeroSettings } from "./website-types";

const toggles = [
  ["isEnabled", "Enable hero section"], ["autoplayEnabled", "Enable autoplay"],
  ["loopEnabled", "Loop carousel"], ["showNavigationArrows", "Show navigation arrows"],
  ["showPaginationDots", "Show pagination dots"], ["pauseOnHover", "Pause on hover"], ["pauseOnFocus", "Pause on focus"],
] as const;

export default function HeroSettingsDialog({ onClose }: { onClose: () => void }) {
  const query = useHeroSettings(true);
  if (!query.data) {
    return <AdminDialog open title="Carousel Settings" onOpenChange={(open) => { if (!open) onClose(); }}>
      <WebsiteFormStatus loading={query.isPending} error={query.isError ? getGraphQLErrorMessage(query.error) : undefined}
        onRetry={() => void query.refetch()} />
    </AdminDialog>;
  }
  return <SettingsEditor settings={query.data} onClose={onClose} />;
}

function SettingsEditor({ settings, onClose }: { settings: HeroSettings; onClose: () => void }) {
  const mutation = useSaveHeroSettings();
  const { control, register, handleSubmit, formState } = useForm<HeroSettings>({ resolver: zodResolver(heroSettingsSchema), defaultValues: settings });
  const autoplay = useWatch({ control, name: "autoplayEnabled" });
  const busy = mutation.isPending || formState.isSubmitting;
  const lock = useRef(false);
  const [error, setError] = useState("");
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setError("");
    try {
      await handleSubmit(async (input) => {
        await mutation.mutateAsync(input);
        toast.success("Carousel settings saved.");
        onClose();
      })();
    } catch (error) {
      const message = getGraphQLErrorMessage(error);
      setError(message);
      toast.error(message);
    } finally {
      lock.current = false;
    }
  };
  return (
    <AdminDialog open busy={busy} title="Carousel Settings"
      description="Autoplay respects reduced-motion preferences and pauses in hidden tabs."
      onOpenChange={(open) => { if (!open && !busy) onClose(); }} footer={
        <>
          <Button type="button" variant="outline" disabled={busy} onClick={onClose}>Cancel</Button>
          <Button type="submit" form="hero-settings-form" busy={busy}>Save settings</Button>
        </>
      }>
      <form id="hero-settings-form" className="space-y-4" onSubmit={save} noValidate>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {toggles.map(([name, label]) => (
          <label key={name} className="flex items-center gap-2 text-sm text-brand-text">
            <Controller control={control} name={name} render={({ field }) => (
              <Checkbox checked={field.value} onCheckedChange={(value) => field.onChange(value === true)} disabled={busy} />
            )} />
            {label}
          </label>
        ))}
        {formState.errors.showPaginationDots?.message && <p role="alert" className="text-xs text-destructive">{formState.errors.showPaginationDots.message}</p>}
        <WebsiteField id="hero-autoplay-delay" label="Autoplay interval in milliseconds" error={formState.errors.autoplayDelayMs?.message}>
          <Input id="hero-autoplay-delay" type="number" min={3000} max={15000} step={100}
            readOnly={!autoplay || busy} aria-describedby={formState.errors.autoplayDelayMs ? "hero-autoplay-delay-error" : undefined}
            {...register("autoplayDelayMs", { valueAsNumber: true })} />
        </WebsiteField>
      </form>
    </AdminDialog>
  );
}
