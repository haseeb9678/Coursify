"use client";

import { toast } from "sonner";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminDialog from "@/components/layouts/admin/shared/AdminDialog";
import type {
  AdminCategory,
  CategoryInput,
} from "@/features/admin/types/learning.types";
import { getCategoryFormSchema } from "@/features/admin/schemas/learning.schemas";
import { getInitialCategoryAppearance } from "@/features/categories/category-appearance";
import type { CategoryColors } from "@/features/categories/category-colors";
import { CategoryIcon, type CategoryIconName } from "@/features/categories/category-icon-components";
import { getCategoryIconLabel, getRecommendedCategoryColors } from "@/features/categories/category-icon-library";
import CategoryAppearancePreview from "./CategoryAppearancePreview";
import CategoryColorPicker from "./CategoryColorPicker";
import { slugifyLearningName } from "@/features/admin/utils/learning.utils";

const CategoryIconPicker = dynamic(() => import("./CategoryIconPicker"));

interface CategoryFormDialogProps {
  open: boolean;
  category: AdminCategory | null;
  categories: readonly AdminCategory[];
  onOpenChange: (open: boolean) => void;
  onSave: (input: CategoryInput) => boolean | Promise<boolean>;
}

const textareaClassName =
  "min-h-24 w-full resize-y rounded-lg border border-brand-border bg-background px-3 py-2 text-sm text-brand-text outline-none placeholder:text-brand-text-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40";

export default function CategoryFormDialog({ open, ...props }: CategoryFormDialogProps) {
  return open ? <CategoryFormSession key={props.category?.id ?? "create"} {...props} /> : null;
}

function CategoryFormSession({
  category,
  categories,
  onOpenChange,
  onSave,
}: Omit<CategoryFormDialogProps, "open">) {
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    Boolean(category),
  );
  const [mode, setMode] = useState<"automatic" | "manual">(category ? "manual" : "automatic");
  const [pickerOpen, setPickerOpen] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const iconTrigger = useRef<HTMLButtonElement>(null);
  const manualColors = useRef<CategoryColors | undefined>(undefined);
  const [initialForm] = useState(() => {
    const appearance = getInitialCategoryAppearance(category ?? undefined);
    return {
      resolver: zodResolver(getCategoryFormSchema(category ? appearance : undefined)),
      defaultValues: { ...getCategoryValues(category), ...appearance },
    };
  });
  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>(initialForm);
  const [name, description, iconKey, iconColor, iconBackground] = useWatch({
    control,
    name: ["name", "description", "iconKey", "iconColor", "iconBackground"],
  });
  const colors = { iconColor, iconBackground };
  const recommended = getRecommendedCategoryColors(iconKey);
  const fieldOptions = { shouldDirty: true, shouldValidate: true };

  const applyColors = (nextColors: CategoryColors) => {
    setValue("iconColor", nextColors.iconColor, fieldOptions);
    setValue("iconBackground", nextColors.iconBackground, fieldOptions);
  };

  const changeMode = (nextMode: "automatic" | "manual") => {
    if (nextMode === mode) return;
    if (nextMode === "automatic") {
      const [iconColor, iconBackground] = getValues(["iconColor", "iconBackground"]);
      manualColors.current = { iconColor, iconBackground };
      applyColors(getRecommendedCategoryColors(getValues("iconKey")));
    } else if (manualColors.current) {
      applyColors(manualColors.current);
    }
    setMode(nextMode);
  };

  const selectIcon = (nextIcon: CategoryIconName) => {
    setValue("iconKey", nextIcon, fieldOptions);
    if (mode === "automatic") applyColors(getRecommendedCategoryColors(nextIcon));
  };

  const closePicker = () => {
    setPickerOpen(false);
    requestAnimationFrame(() => iconTrigger.current?.focus());
  };

  const closeForm = () => {
    form.current?.closest("dialog")?.close();
    onOpenChange(false);
  };

  const submitting = useRef(false);
  const save = async (values: CategoryInput) => {
    const duplicateSlug = categories.some(
      (item) =>
        item.id !== category?.id && item.slug.toLowerCase() === values.slug,
    );
    if (duplicateSlug) {
      toast.error("That slug is already in use.");
      setError("slug", {
        type: "manual",
        message: "That slug is already in use.",
      });
      return;
    }

    if (await onSave(values)) closeForm();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    try {
      await handleSubmit(save, () => toast.error("Check the highlighted category fields."))(event);
    } finally {
      submitting.current = false;
    }
  };

  const formDialog = (
    <AdminDialog
      open
      busy={isSubmitting}
      onOpenChange={(open) => { if (!open) closeForm(); }}
      title={category ? "Edit category" : "Create category"}
      description="Category details organize courses in the learning catalog."
      size="md"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={closeForm}
          >
            Cancel
          </Button>
          <Button type="submit" form="category-form" busy={isSubmitting}>
            {category ? "Save changes" : "Create category"}
          </Button>
        </>
      }
    >
      <form ref={form} id="category-form" onSubmit={submit} className="space-y-4">
        <FormField id="category-name" label="Category name" error={errors.name?.message}>
          <Input
            id="category-name"
            {...register("name", {
              onChange: (event) => {
                if (!slugManuallyEdited) {
                  setValue("slug", slugifyLearningName(event.target.value), {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }
              },
            })}
            autoComplete="off"
            required
          />
        </FormField>

        <FormField id="category-slug" label="Slug" error={errors.slug?.message}>
          <Input
            id="category-slug"
            {...register("slug", {
              onChange: () => {
                setSlugManuallyEdited(true);
              },
            })}
            autoComplete="off"
            required
          />
        </FormField>

        <FormField
          id="category-description"
          label="Description"
          error={errors.description?.message}
        >
          <textarea
            id="category-description"
            {...register("description")}
            className={textareaClassName}
            rows={4}
            required
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="category-icon" label="Category icon" error={errors.iconKey?.message}>
            <Button
              ref={iconTrigger}
              id="category-icon"
              type="button"
              variant="outline"
              aria-haspopup="dialog"
              aria-expanded={pickerOpen}
              aria-invalid={Boolean(errors.iconKey)}
              aria-label={`Choose category icon. Current icon: ${getCategoryIconLabel(iconKey)}`}
              disabled={isSubmitting}
              className="h-10 w-full min-w-0 justify-start border-brand-border"
              onClick={() => setPickerOpen(true)}
            >
              <CategoryIcon name={iconKey} aria-hidden="true" />
              <span className="truncate">{getCategoryIconLabel(iconKey)}</span>
            </Button>
          </FormField>
          <FormField id="category-status" label="Status">
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    if (value === "ACTIVE" || value === "INACTIVE") {
                      field.onChange(value);
                    }
                  }}
                >
                  <SelectTrigger
                    id="category-status"
                    className="h-10 w-full border-brand-border bg-background text-sm"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        </div>

        <fieldset disabled={isSubmitting} className="min-w-0 space-y-3 rounded-xl border border-brand-border p-3">
          <legend className="px-1 text-sm font-semibold text-brand-text">Icon appearance</legend>
          <div
            role="group"
            aria-label="Icon color mode"
            aria-describedby={mode === "manual" ? "category-color-mode-help" : undefined}
            className="flex flex-wrap gap-2"
          >
            <Button
              type="button"
              variant={mode === "automatic" ? "default" : "outline"}
              aria-pressed={mode === "automatic"}
              aria-describedby={mode === "manual" ? "category-color-mode-help" : undefined}
              onClick={() => changeMode("automatic")}
            >
              Automatic colors
            </Button>
            <Button
              type="button"
              variant={mode === "manual" ? "default" : "outline"}
              aria-pressed={mode === "manual"}
              onClick={() => changeMode("manual")}
            >
              Manual colors
            </Button>
          </div>
          {mode === "manual" && (
            <>
              <p id="category-color-mode-help" className="text-xs text-brand-text-muted">
                Switching to automatic colors applies the recommended palette. Switch back to restore your manual colors for this session.
              </p>
              <CategoryColorPicker
                colors={colors}
                recommended={recommended}
                errors={{ iconColor: errors.iconColor?.message, iconBackground: errors.iconBackground?.message }}
                onChange={(field, value) => setValue(field, value, fieldOptions)}
                onPaletteChange={applyColors}
              />
            </>
          )}
        </fieldset>

        <CategoryAppearancePreview
          name={name}
          description={description}
          iconKey={iconKey}
          colors={colors}
          courseCount={category ? category.courseCount : 0}
        />

        <div className="space-y-2">
          <span className="text-xs font-medium text-brand-text">Category image URL</span>
          <div className="flex flex-wrap items-center gap-3">
            <Controller
              name="imageDataUrl"
              control={control}
              render={({ field }) => (
                <Input
                  type="url"
                  aria-label="Category image URL"
                  placeholder="https://example.com/category.jpg"
                  value={field.value ?? ""}
                  onChange={(event) => {
                    field.onChange(event.target.value || null);
                    clearErrors("imageDataUrl");
                  }}
                />
              )}
            />
          </div>
          <Controller
            name="imageDataUrl"
            control={control}
            render={({ field }) => (
              <>
                {field.value && (
                <div className="relative w-fit">
                  <Image
                    src={field.value}
                    alt="Selected category preview"
                    width={96}
                    height={96}
                    unoptimized
                    className="size-24 rounded-lg border border-brand-border object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    aria-label="Remove category image"
                    className="absolute -top-2 -right-2"
                    onClick={() => {
                      field.onChange(null);
                      clearErrors("imageDataUrl");
                    }}
                  >
                    <X size={14} aria-hidden="true" />
                  </Button>
                </div>
                )}
              </>
            )}
          />
          {errors.imageDataUrl?.message && (
            <p role="alert" className="text-xs text-destructive">
              {errors.imageDataUrl.message}
            </p>
          )}
        </div>
      </form>
    </AdminDialog>
  );

  return (
    <>
      {formDialog}
      {pickerOpen && (
        <CategoryIconPicker value={iconKey} onSelect={selectIcon} onClose={closePicker} />
      )}
    </>
  );
}

function getCategoryValues(category: AdminCategory | null): Omit<CategoryInput, "iconKey" | keyof CategoryColors> {
  return category
    ? {
        name: category.name,
        slug: category.slug,
        description: category.description,
        status: category.status,
        imageDataUrl: category.imageDataUrl,
      }
    : {
        name: "",
        slug: "",
        description: "",
        status: "ACTIVE",
        imageDataUrl: null,
      };
}

function FormField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-brand-text">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
