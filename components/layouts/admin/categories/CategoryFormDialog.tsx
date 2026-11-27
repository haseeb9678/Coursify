"use client";

import { toast } from "sonner";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { X } from "lucide-react";
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
import { categorySchema } from "@/features/admin/schemas/learning.schemas";
import { slugifyLearningName } from "@/features/admin/utils/learning.utils";

type CategoryFormValues = {
  name: string;
  slug: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
  iconKey: string;
  imageDataUrl: string | null;
};

interface CategoryFormDialogProps {
  open: boolean;
  category: AdminCategory | null;
  categories: readonly AdminCategory[];
  onOpenChange: (open: boolean) => void;
  onSave: (input: CategoryInput) => boolean | Promise<boolean>;
}

const iconOptions = [
  { value: "PenTool", label: "Design" },
  { value: "Code2", label: "Code" },
  { value: "Megaphone", label: "Marketing" },
  { value: "BriefcaseBusiness", label: "Business" },
  { value: "Camera", label: "Photography" },
  { value: "ChartNoAxesColumn", label: "Data" },
];

const textareaClassName =
  "min-h-24 w-full resize-y rounded-lg border border-brand-border bg-background px-3 py-2 text-sm text-brand-text outline-none placeholder:text-brand-text-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40";

export default function CategoryFormDialog({
  open,
  category,
  categories,
  onOpenChange,
  onSave,
}: CategoryFormDialogProps) {
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    Boolean(category),
  );
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: getCategoryValues(category),
  });

  useEffect(() => {
    reset(getCategoryValues(category));
  }, [category, open, reset]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setSlugManuallyEdited(Boolean(category));
    onOpenChange(nextOpen);
  };

  const submitting = useRef(false);
  const save = handleSubmit(async (values) => {
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

    if (await onSave(values)) handleOpenChange(false);
  }, () => toast.error("Check the highlighted category fields."));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    try {
      await save(event);
    } finally {
      submitting.current = false;
    }
  };

  return (
    <AdminDialog
      open={open}
      busy={isSubmitting}
      onOpenChange={handleOpenChange}
      title={category ? "Edit category" : "Create category"}
      description="Category details organize courses in the learning catalog."
      size="md"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" form="category-form" busy={isSubmitting}>
            {category ? "Save changes" : "Create category"}
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={submit} className="space-y-4">
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
          <FormField id="category-icon" label="Category icon">
            <Controller
              name="iconKey"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    if (value !== null) field.onChange(value);
                  }}
                >
                  <SelectTrigger
                    id="category-icon"
                    className="h-10 w-full border-brand-border bg-background text-sm"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="start">
                    {iconOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
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
}

function getCategoryValues(category: AdminCategory | null): CategoryFormValues {
  return category
    ? {
        name: category.name,
        slug: category.slug,
        description: category.description,
        status: category.status,
        iconKey: category.iconKey,
        imageDataUrl: category.imageDataUrl,
      }
    : {
        name: "",
        slug: "",
        description: "",
        status: "ACTIVE",
        iconKey: "code",
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
