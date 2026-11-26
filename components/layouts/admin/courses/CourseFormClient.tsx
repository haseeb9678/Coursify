"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ArrowLeft, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminErrorState from "@/components/layouts/admin/shared/AdminErrorState";
import AdminPageHeader from "@/components/layouts/admin/shared/AdminPageHeader";
import LearningSampleNotice from "@/components/layouts/admin/learning/LearningSampleNotice";
import { useLearningDemoStore } from "@/features/admin/store/learning-demo.store";
import { sampleAdminUsers } from "@/features/admin/data/users.data";
import { sampleAdminInstructors } from "@/features/admin/data/instructors.data";
import type {
  AdminCourse,
  AdminCourseInput,
  CourseFormInput,
} from "@/features/admin/types/learning.types";
import { courseFormSchema } from "@/features/admin/schemas/learning.schemas";
import {
  formatCoursePrice,
  parsePriceToMinorUnits,
  slugifyLearningName,
} from "@/features/admin/utils/learning.utils";

type CourseFormValues = CourseFormInput;
type SaveMode = "draft" | "curriculum";

const textareaClassName =
  "min-h-24 w-full resize-y rounded-lg border border-brand-border bg-background px-3 py-2 text-sm text-brand-text outline-none placeholder:text-brand-text-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40";

export default function CourseFormClient({
  mode,
  courseId,
}: {
  mode: "create" | "edit";
  courseId?: string;
}) {
  const router = useRouter();
  const categories = useLearningDemoStore((state) => state.categories);
  const courses = useLearningDemoStore((state) => state.courses);
  const addCourse = useLearningDemoStore((state) => state.addCourse);
  const updateCourse = useLearningDemoStore((state) => state.updateCourse);
  const currentCourse = useLearningDemoStore((state) =>
    courseId
      ? state.courses.find((item) => item.id === courseId)
      : undefined,
  );
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    mode === "edit",
  );
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: getCourseFormValues(currentCourse),
  });

  useEffect(() => {
    if (mode === "edit" && currentCourse) {
      reset(getCourseFormValues(currentCourse));
    }
  }, [currentCourse, mode, reset]);

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const isFree = useWatch({ control, name: "isFree" });
  const thumbnailDataUrl = useWatch({ control, name: "thumbnailDataUrl" });
  const learningOutcomes =
    useWatch({ control, name: "learningOutcomes" }) ?? [];
  const requirements = useWatch({ control, name: "requirements" }) ?? [];
  const targetAudience = useWatch({ control, name: "targetAudience" }) ?? [];
  const availableCategories = categories.filter(
    (category) =>
      category.status === "ACTIVE" ||
      category.id === currentCourse?.categoryId,
  );
  const instructorOptions = sampleAdminInstructors
    .map((profile) => ({
      id: profile.userId,
      name:
        sampleAdminUsers.find((user) => user.id === profile.userId)?.name ??
        "Sample instructor",
    }))
    .filter((item) => item.id);

  const selectThumbnail = (file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("thumbnailDataUrl", {
        type: "manual",
        message: "Choose a JPG, PNG, or WebP thumbnail.",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("thumbnailDataUrl", {
        type: "manual",
        message: "Choose a thumbnail smaller than 5 MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setValue("thumbnailDataUrl", reader.result, {
          shouldDirty: true,
          shouldValidate: true,
        });
        clearErrors("thumbnailDataUrl");
      }
    };
    reader.onerror = () => {
      setError("thumbnailDataUrl", {
        type: "manual",
        message: "The thumbnail preview could not be read.",
      });
    };
    reader.readAsDataURL(file);
  };

  const updateTextList = (
    field: "learningOutcomes" | "requirements" | "targetAudience",
    nextValues: string[],
  ) => {
    setValue(field, nextValues, { shouldDirty: true, shouldValidate: true });
  };

  const saveCourse = (values: CourseFormValues, saveMode: SaveMode) => {
    const duplicateSlug = courses.some(
      (course) =>
        course.id !== currentCourse?.id &&
        course.slug.toLowerCase() === values.slug.toLowerCase(),
    );
    if (duplicateSlug) {
      setError("slug", {
        type: "manual",
        message: "That course slug is already in use.",
      });
      return;
    }

    const priceMinorUnits = values.isFree
      ? 0
      : parsePriceToMinorUnits(values.regularPrice);
    const discountedPriceMinorUnits =
      values.isFree || values.discountedPrice.trim() === ""
        ? null
        : parsePriceToMinorUnits(values.discountedPrice);
    if (
      priceMinorUnits === null ||
      (discountedPriceMinorUnits === null &&
        !values.isFree &&
        values.discountedPrice.trim() !== "")
    ) {
      toast.error("Check the course price values and try again.");
      return;
    }

    const input: AdminCourseInput = {
      title: values.title.trim(),
      slug: values.slug.trim(),
      shortDescription: values.shortDescription.trim(),
      description: values.description.trim(),
      categoryId: values.categoryId,
      instructorId: values.instructorId,
      level: values.level,
      language: values.language.trim(),
      thumbnailDataUrl: values.thumbnailDataUrl,
      promotionalVideoUrl: values.promotionalVideoUrl.trim(),
      pricing: {
        type: values.isFree ? "FREE" : "PAID",
        currency: "USD",
        priceMinorUnits: priceMinorUnits ?? 0,
        discountedPriceMinorUnits: discountedPriceMinorUnits ?? null,
      },
      learningOutcomes: values.learningOutcomes
        .map((item) => item.trim())
        .filter(Boolean),
      requirements: values.requirements
        .map((item) => item.trim())
        .filter(Boolean),
      targetAudience: values.targetAudience
        .map((item) => item.trim())
        .filter(Boolean),
    };

    let savedCourse: AdminCourse;
    if (mode === "create") {
      savedCourse = addCourse(input);
      toast.success("Course added to the temporary sample workspace.");
    } else {
      if (!currentCourse) {
        toast.error("This course is unavailable.");
        return;
      }
      const previousStatus = currentCourse.status;
      const updated = updateCourse(currentCourse.id, input);
      if (!updated) {
        toast.error("This course is unavailable or archived.");
        return;
      }
      savedCourse = updated;
      if (previousStatus !== "DRAFT" && updated.status === "DRAFT") {
        toast.success(
          "Course changes are in sample data. The course returned to draft and must be reviewed again.",
        );
      } else {
        toast.success("Course changes are in the temporary sample workspace.");
      }
    }

    if (saveMode === "curriculum") {
      router.push(`/admin/courses/${savedCourse.id}/curriculum`);
    } else {
      router.push(`/admin/courses/${savedCourse.id}`);
    }
  };
  const submitDraft = handleSubmit((values) =>
    saveCourse(values, "draft"),
  );
  const submitAndContinue = handleSubmit((values) =>
    saveCourse(values, "curriculum"),
  );

  const addTextItem = (
    field: "learningOutcomes" | "requirements" | "targetAudience",
  ) => {
    updateTextList(field, [...getValues(field), ""]);
  };
  const removeTextItem = (
    field: "learningOutcomes" | "requirements" | "targetAudience",
    index: number,
  ) => {
    updateTextList(
      field,
      getValues(field).filter((_, itemIndex) => itemIndex !== index),
    );
  };

  if (mode === "edit" && !currentCourse) {
    return (
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8">
        <AdminErrorState
          title="Course not found"
          description="This sample course may have been removed or its ID is invalid."
        />
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/courses")}
          >
            Back to courses
          </Button>
        </div>
      </main>
    );
  }

  if (currentCourse?.status === "ARCHIVED") {
    return (
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8">
        <AdminErrorState
          title="Archived courses are read-only"
          description="Unarchiving is not supported in this sample workflow."
        />
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/admin/courses/${currentCourse.id}`)}
          >
            Back to course
          </Button>
        </div>
      </main>
    );
  }

  return (
    <section className="mx-auto w-full max-w-450 space-y-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminPageHeader
          title={mode === "create" ? "Create course" : "Edit course"}
          description={
            mode === "create"
              ? "Build a structured course draft for the Coursify catalog."
              : "Update course content. Changes to reviewed content require a new review."
          }
        />
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => router.push("/admin/courses")}
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Back to courses
        </Button>
      </div>
      <LearningSampleNotice />

      <form id="course-form" onSubmit={submitDraft} className="space-y-5">
        <FormSection
          title="Basic information"
          description="The details learners use to understand the course."
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <FormField id="course-title" label="Course title" error={errors.title?.message}>
              <Input
                id="course-title"
                {...register("title", {
                  onChange: (event) => {
                    if (!slugManuallyEdited) {
                      setValue("slug", slugifyLearningName(event.target.value), {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  },
                })}
                required
              />
            </FormField>
            <FormField id="course-slug" label="Slug" error={errors.slug?.message}>
              <Input
                id="course-slug"
                {...register("slug", {
                  onChange: () => {
                    setSlugManuallyEdited(true);
                  },
                })}
                required
              />
            </FormField>
            <FormField
              id="course-category"
              label="Category"
              error={errors.categoryId?.message}
            >
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (value !== null) field.onChange(value);
                    }}
                  >
                    <SelectTrigger
                      id="course-category"
                      aria-invalid={Boolean(errors.categoryId)}
                      className="h-10 w-full border-brand-border bg-background text-sm"
                    >
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent align="start">
                      {availableCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField
              id="course-instructor"
              label="Assigned instructor"
              error={errors.instructorId?.message}
            >
              <Controller
                name="instructorId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (value !== null) field.onChange(value);
                    }}
                  >
                    <SelectTrigger
                      id="course-instructor"
                      aria-invalid={Boolean(errors.instructorId)}
                      className="h-10 w-full border-brand-border bg-background text-sm"
                    >
                      <SelectValue placeholder="Choose an instructor" />
                    </SelectTrigger>
                    <SelectContent align="start">
                      {instructorOptions.map((instructor) => (
                        <SelectItem
                          key={instructor.id}
                          value={instructor.id}
                        >
                          {instructor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField id="course-level" label="Difficulty level">
              <Controller
                name="level"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (
                        value === "BEGINNER" ||
                        value === "INTERMEDIATE" ||
                        value === "ADVANCED"
                      ) {
                        field.onChange(value);
                      }
                    }}
                  >
                    <SelectTrigger
                      id="course-level"
                      className="h-10 w-full border-brand-border bg-background text-sm"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField id="course-language" label="Course language" error={errors.language?.message}>
              <Input id="course-language" {...register("language")} required />
            </FormField>
          </div>
          <FormField
            id="course-short-description"
            label="Short description"
            error={errors.shortDescription?.message}
          >
            <textarea
              id="course-short-description"
              {...register("shortDescription")}
              rows={2}
              className={textareaClassName}
              required
            />
          </FormField>
          <FormField
            id="course-description"
            label="Detailed description"
            error={errors.description?.message}
          >
            <textarea
              id="course-description"
              {...register("description")}
              rows={5}
              className={textareaClassName}
              placeholder="Explain what learners will study and how the course is structured."
            />
          </FormField>
        </FormSection>

        <FormSection title="Course media" description="Media stays in this local sample workspace.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <span className="text-xs font-medium text-brand-text">Course thumbnail</span>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                aria-label="Choose course thumbnail"
                className="sr-only"
                onChange={(event) => selectThumbnail(event.target.files?.[0])}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => thumbnailInputRef.current?.click()}
                >
                  <ImagePlus size={15} aria-hidden="true" />
                  {thumbnailDataUrl ? "Replace thumbnail" : "Choose thumbnail"}
                </Button>
                <p className="text-[11px] text-brand-text-muted">
                  JPG, PNG, or WebP up to 5 MB. No upload is performed.
                </p>
              </div>
              {thumbnailDataUrl && (
                <div className="relative w-fit">
                  <Image
                    src={thumbnailDataUrl}
                    alt="Course thumbnail preview"
                    width={240}
                    height={135}
                    unoptimized
                    className="h-32 w-56 rounded-lg border border-brand-border object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    aria-label="Remove course thumbnail"
                    className="absolute -top-2 -right-2"
                    onClick={() => {
                      setValue("thumbnailDataUrl", null, { shouldDirty: true });
                      clearErrors("thumbnailDataUrl");
                      if (thumbnailInputRef.current) {
                        thumbnailInputRef.current.value = "";
                      }
                    }}
                  >
                    <X size={14} aria-hidden="true" />
                  </Button>
                </div>
              )}
              {errors.thumbnailDataUrl?.message && (
                <p role="alert" className="text-xs text-destructive">
                  {errors.thumbnailDataUrl.message}
                </p>
              )}
            </div>
            <FormField
              id="course-promo-video"
              label="Promotional video URL (optional)"
              error={errors.promotionalVideoUrl?.message}
            >
              <Input
                id="course-promo-video"
                type="url"
                placeholder="https://"
                {...register("promotionalVideoUrl")}
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Course pricing" description="Prices use USD and integer cents in sample records.">
          <Controller
            name="isFree"
            control={control}
            render={({ field }) => (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-text">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                  aria-label="Make this a free course"
                />
                This is a free course
              </label>
            )}
          />
          {!isFree && (
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="course-price"
                label="Regular price (USD)"
                error={errors.regularPrice?.message}
              >
                <Input
                  id="course-price"
                  inputMode="decimal"
                  placeholder="49.00"
                  {...register("regularPrice")}
                  required
                />
              </FormField>
              <FormField
                id="course-discount"
                label="Discounted price (optional)"
                error={errors.discountedPrice?.message}
              >
                <Input
                  id="course-discount"
                  inputMode="decimal"
                  placeholder="39.00"
                  {...register("discountedPrice")}
                />
              </FormField>
            </div>
          )}
          <p className="text-[11px] text-brand-text-muted">
            Payments are not connected in this sample module.
            {currentCourse && (
              <span className="ml-1">
                Current price:{" "}
                {currentCourse.pricing.type === "FREE"
                  ? "Free"
                  : formatCoursePrice(currentCourse.pricing.priceMinorUnits)}
              </span>
            )}
          </p>
        </FormSection>

        <RepeatableTextFields
          title="Learning outcomes"
          description="What will learners be able to do after this course?"
          values={learningOutcomes}
          onChange={(values) => updateTextList("learningOutcomes", values)}
          onAdd={() => addTextItem("learningOutcomes")}
          onRemove={(index) => removeTextItem("learningOutcomes", index)}
          placeholder="e.g. Build modern React applications"
        />
        <RepeatableTextFields
          title="Course requirements"
          description="What should learners know or have before starting?"
          values={requirements}
          onChange={(values) => updateTextList("requirements", values)}
          onAdd={() => addTextItem("requirements")}
          onRemove={(index) => removeTextItem("requirements", index)}
          placeholder="e.g. Basic JavaScript knowledge"
        />
        <RepeatableTextFields
          title="Target audience"
          description="Who will benefit most from the course?"
          values={targetAudience}
          onChange={(values) => updateTextList("targetAudience", values)}
          onAdd={() => addTextItem("targetAudience")}
          onRemove={(index) => removeTextItem("targetAudience", index)}
          placeholder="e.g. Developers starting with Next.js"
        />

        <div className="flex flex-col-reverse gap-2 border-t border-brand-border pt-4 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (
                isDirty &&
                !window.confirm("Discard your unsaved course changes?")
              ) {
                return;
              }
              router.push(
                mode === "edit" && currentCourse
                  ? `/admin/courses/${currentCourse.id}`
                  : "/admin/courses",
              );
            }}
          >
            Cancel
          </Button>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="submit"
              variant="outline"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save as draft"}
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => void submitAndContinue()}
            >
              {isSubmitting ? "Saving..." : "Save and continue to curriculum"}
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}

function getCourseFormValues(course?: AdminCourse): CourseFormValues {
  return course
    ? {
        title: course.title,
        slug: course.slug,
        shortDescription: course.shortDescription,
        description: course.description,
        categoryId: course.categoryId,
        instructorId: course.instructorId,
        level: course.level,
        language: course.language,
        thumbnailDataUrl: course.thumbnailDataUrl,
        promotionalVideoUrl: course.promotionalVideoUrl,
        isFree: course.pricing.type === "FREE",
        regularPrice:
          course.pricing.type === "FREE"
            ? ""
            : (course.pricing.priceMinorUnits / 100).toFixed(2),
        discountedPrice:
          course.pricing.discountedPriceMinorUnits === null
            ? ""
            : (course.pricing.discountedPriceMinorUnits / 100).toFixed(2),
        learningOutcomes: [...course.learningOutcomes],
        requirements: [...course.requirements],
        targetAudience: [...course.targetAudience],
      }
    : {
        title: "",
        slug: "",
        shortDescription: "",
        description: "",
        categoryId: "",
        instructorId: "",
        level: "BEGINNER",
        language: "English",
        thumbnailDataUrl: null,
        promotionalVideoUrl: "",
        isFree: true,
        regularPrice: "",
        discountedPrice: "",
        learningOutcomes: [""],
        requirements: [""],
        targetAudience: [""],
      };
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-brand-border bg-card p-4 sm:p-5">
      <div>
        <h2 className="text-sm font-semibold text-brand-text">{title}</h2>
        <p className="mt-1 text-xs text-brand-text-muted">{description}</p>
      </div>
      {children}
    </section>
  );
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

function RepeatableTextFields({
  title,
  description,
  values,
  onChange,
  onAdd,
  onRemove,
  placeholder,
}: {
  title: string;
  description: string;
  values: string[];
  onChange: (values: string[]) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  placeholder: string;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-brand-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-brand-text">{title}</h2>
          <p className="mt-1 text-xs text-brand-text-muted">{description}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus size={14} aria-hidden="true" />
          Add item
        </Button>
      </div>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={`${title}-${index}`} className="flex gap-2">
            <Input
              aria-label={`${title} item ${index + 1}`}
              value={value}
              maxLength={180}
              placeholder={placeholder}
              onChange={(event) => {
                const next = [...values];
                next[index] = event.target.value;
                onChange(next);
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove ${title.toLowerCase()} item ${index + 1}`}
              disabled={values.length <= 1}
              onClick={() => onRemove(index)}
            >
              <Trash2 size={15} aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
