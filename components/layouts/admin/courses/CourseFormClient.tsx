"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ArrowLeft, FileJson, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { getGraphQLErrorCode, getGraphQLErrorMessage } from "@/lib/graphql/error";
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
import CourseJsonImportDialog from "./CourseJsonImportDialog";
import type { CategoryOption, InstructorOption } from "@/features/admin/types/learning-api.types";
import { importFields, pricingImportFields, sameField, type CourseImportPlan, type ImportPatch } from "@/features/admin/utils/course-json-import";
import CourseLifecycleDialog, { type PendingCourseAction } from "./CourseLifecycleDialog";
import CourseStatusBadge from "./CourseStatusBadge";
import AdminErrorState from "@/components/layouts/admin/shared/AdminErrorState";
import AdminPageHeader from "@/components/layouts/admin/shared/AdminPageHeader";
import {
  useAdminCourse,
  useCourseCategoryOptions,
  useCourseInstructorOptions,
  useCreateAdminCourse,
  useUpdateAdminCourse,
} from "@/features/admin/hooks/use-admin-learning";
import type {
  AdminCourse,
  CourseFormInput,
} from "@/features/admin/types/learning.types";
import type { AdminCourseInput } from "@/features/admin/types/learning-api.types";
import { courseFormSchema } from "@/features/admin/schemas/learning.schemas";
import {
  canEditCourse,
  formatCoursePrice,
  getCourseActionCopy,
  publishedCourseEditWarning,
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
  const courseQuery = useAdminCourse(courseId ?? "", "always");
  const categoriesQuery = useCourseCategoryOptions();
  const instructorsQuery = useCourseInstructorOptions();
  const createCourse = useCreateAdminCourse();
  const updateCourse = useUpdateAdminCourse();
  const currentCourse = courseQuery.data;
  const isCheckingCourse = mode === "edit" && (
    courseQuery.isLoading || (courseQuery.isFetching && !courseQuery.isFetchedAfterMount)
  );
  const [importOpen, setImportOpen] = useState(false);
  const [importedCategories, setImportedCategories] = useState<CategoryOption[]>([]);
  const [importedInstructors, setImportedInstructors] = useState<InstructorOption[]>([]);
  const [lastImport, setLastImport] = useState<{ before: CourseFormInput; patch: ImportPatch; customSlug: boolean; explicitSlug: boolean }>();
  const categoryOptions = categoriesQuery.data ?? [];
  const baseInstructors = instructorsQuery.data ?? [];
  const categories = [...categoryOptions, ...importedCategories.filter((item) => !categoryOptions.some(({ id }) => id === item.id))];
  const instructorOptions = [...baseInstructors, ...importedInstructors.filter((item) => !baseInstructors.some(({ id }) => id === item.id))];
  const submitting = useRef(false);
  const baseline = useRef<AdminCourse | undefined>(undefined);
  const [pendingAction, setPendingAction] = useState<PendingCourseAction | null>(null);
  const [pendingSaveMode, setPendingSaveMode] = useState<SaveMode | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    mode === "edit",
  );
  const {
    register,
    control,
    handleSubmit,
    reset,
    getValues,
    setValue,
    trigger,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: getCourseFormValues(currentCourse),
  });

  useEffect(() => {
    if (mode === "edit" && !isCheckingCourse && currentCourse && baseline.current?.id !== currentCourse.id) {
      baseline.current = currentCourse;
      reset(getCourseFormValues(currentCourse));
    }
  }, [currentCourse, isCheckingCourse, mode, reset]);

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
  const updateTextList = (
    field: "learningOutcomes" | "requirements" | "targetAudience",
    nextValues: string[],
  ) => {
    setValue(field, nextValues, { shouldDirty: true, shouldValidate: true });
  };

  const applyImportPatch = (patch: ImportPatch) => {
    const changed = importFields.filter((field) => patch[field] !== undefined);
    for (const field of changed) {
      const value = patch[field];
      if (value !== undefined) setValue(field, value, { shouldDirty: true });
    }
    if (changed.length) void trigger(changed);
  };

  const importCourse = (plan: CourseImportPlan, explicitSlug: boolean) => {
    if (mode !== "create" || submitting.current || plan.errors.length) return;
    const category = plan.category;
    if (plan.patch.categoryId && category) {
      setImportedCategories((items) => [...items.filter(({ id }) => id !== category.id), category]);
    }
    if (plan.patch.instructorId && plan.instructor) {
      const { id, name, avatar } = plan.instructor;
      setImportedInstructors((items) => [...items.filter((item) => item.id !== id), { id, name, avatar }]);
    }
    setLastImport({
      before: structuredClone(getValues()),
      patch: plan.patch,
      customSlug: slugManuallyEdited,
      explicitSlug: Boolean(explicitSlug && plan.patch.slug !== undefined),
    });
    applyImportPatch(plan.patch);
    if (explicitSlug && plan.patch.slug !== undefined) setSlugManuallyEdited(true);
  };

  const undoImport = () => {
    if (!lastImport || mode !== "create" || submitting.current) return;
    const { before, patch, customSlug, explicitSlug } = lastImport;
    const current = getValues();
    const after = { ...before, ...patch };
    const pricingChanged = pricingImportFields.some((field) => !sameField(current[field], after[field]));
    const restore = importFields.filter((field) =>
      patch[field] !== undefined &&
      sameField(current[field], after[field]) &&
      !(pricingChanged && pricingImportFields.some((priceField) => priceField === field)),
    );
    for (const field of restore) setValue(field, before[field], { shouldDirty: true });
    if (restore.includes("slug") && explicitSlug && slugManuallyEdited) setSlugManuallyEdited(customSlug);
    if (restore.length) void trigger(restore);
    setLastImport(undefined);
    toast.info(restore.length ? "Import undone. Later edits were preserved." : "The imported values were already changed.");
  };

  const saveCourse = async (values: CourseFormValues, saveMode: SaveMode) => {
    if (mode === "edit" && (!currentCourse || !canEditCourse(currentCourse.status))) return;
    const input = getCourseInput(values, currentCourse?.pricing.currency ?? "USD");
    if (!input) {
      toast.error("Check the course price values and try again.");
      return;
    }

    try {
      let savedCourse: AdminCourse;
      if (mode === "create") {
        savedCourse = await createCourse.mutateAsync(input);
        toast.success("Course created.");
      } else if (currentCourse) {
        const initial = baseline.current ?? currentCourse;
        const previous = getCourseInput(getCourseFormValues(initial), initial.pricing.currency);
        const changes: Partial<AdminCourseInput> = { ...input };
        for (const key of Object.keys(input) as (keyof AdminCourseInput)[]) {
          if (JSON.stringify(input[key]) === JSON.stringify(previous?.[key])) delete changes[key];
        }
        savedCourse = Object.keys(changes).length
          ? await updateCourse.mutateAsync({ id: currentCourse.id, ...changes })
          : currentCourse;
        if (Object.keys(changes).length) toast.success("Course updated.");
      } else {
        return;
      }
      if (saveMode === "curriculum") {
        router.push(`/admin/courses/${savedCourse.id}/curriculum`);
      } else {
        router.push(`/admin/courses/${savedCourse.id}`);
      }
    } catch (error) {
      toast.error(getGraphQLErrorMessage(error));
      if (mode === "edit" && getGraphQLErrorCode(error) === "CONFLICT") void courseQuery.refetch();
    }
  };
  const submitCourse = (saveMode: SaveMode) => async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (submitting.current || (mode === "edit" && !canEditCourse(currentCourse?.status))) return;
    submitting.current = true;
    setPendingSaveMode(saveMode);
    try {
      await handleSubmit(
        (values) => saveCourse(values, saveMode),
        () => toast.error("Check the highlighted course fields."),
      )(event);
    } finally {
      submitting.current = false;
      setPendingSaveMode(null);
    }
  };
  const submitDraft = submitCourse("draft");
  const submitAndContinue = submitCourse("curriculum");

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

  if (isCheckingCourse) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8" aria-live="polite">
        <p className="text-sm text-brand-text-muted">Loading course details…</p>
      </main>
    );
  }

  if (mode === "edit" && (courseQuery.isError || !currentCourse)) {
    return (
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8">
        <AdminErrorState
          title="Course not found"
          description={courseQuery.error?.message ?? "The course could not be found."}
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

  if (mode === "edit" && currentCourse && !canEditCourse(currentCourse.status)) {
    const action = currentCourse.status === "PENDING_REVIEW" ? "withdraw" : "restore";
    const description = currentCourse.status === "PUBLISHED"
      ? publishedCourseEditWarning
      : currentCourse.status === "PENDING_REVIEW"
        ? "Withdraw this submission before making changes to the course."
        : "Return this course to draft before editing. It will need to be reviewed again before publication.";
    return (
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8">
        <div className="flex justify-center">
          <CourseStatusBadge status={currentCourse.status} />
        </div>
        <AdminErrorState title="Course editing is restricted" description={description} />
        <div className="flex flex-wrap justify-center gap-3">
          <Button type="button" variant="outline" onClick={() => router.push(`/admin/courses/${currentCourse.id}`)}>
            Back to course details
          </Button>
          <Button type="button" onClick={() => setPendingAction({ course: currentCourse, action })}>
            {getCourseActionCopy(action, currentCourse).label}
          </Button>
        </div>
        <CourseLifecycleDialog pending={pendingAction} onClose={() => setPendingAction(null)} />
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
        <div className="flex flex-wrap items-center gap-2">
          {mode === "create" && (
            <>
              <Button type="button" variant="outline" disabled={pendingSaveMode !== null} onClick={() => setImportOpen(true)}>
                <FileJson size={15} aria-hidden="true" /> Import JSON
              </Button>
              {lastImport && (
                <Button type="button" variant="ghost" disabled={pendingSaveMode !== null} onClick={undoImport}>Undo Last Import</Button>
              )}
            </>
          )}
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
      </div>

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
                      {categories.map((category) => (
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

        <FormSection title="Course media" description="Use a publicly accessible image URL and video link.">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="course-thumbnail" label="Course thumbnail URL">
              <Input
                id="course-thumbnail"
                type="url"
                placeholder="https://example.com/course-image.jpg"
                {...register("thumbnailDataUrl")}
              />
            </FormField>
            <div className="space-y-2">
              <span className="text-xs font-medium text-brand-text">Thumbnail preview</span>
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
                    }}
                  >
                    <X size={14} aria-hidden="true" />
                  </Button>
                </div>
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

        <FormSection title="Course pricing" description="Set the price learners will see in the catalog.">
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
                label={`Regular price (${currentCourse?.pricing.currency ?? "USD"})`}
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
            Currency values are saved with the course.
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
              disabled={pendingSaveMode !== null}
              busy={pendingSaveMode === "draft"}
            >
              {mode === "create" ? "Save as draft" : "Save changes"}
            </Button>
            <Button
              type="button"
              disabled={pendingSaveMode !== null}
              busy={pendingSaveMode === "curriculum"}
              onClick={() => void submitAndContinue()}
            >
              Save and continue to curriculum
            </Button>
          </div>
        </div>
      </form>
      {mode === "create" && importOpen && (
        <CourseJsonImportDialog
          categories={categoryOptions}
          instructors={baseInstructors}
          availability={{ categories: categoriesQuery.isSuccess, instructors: instructorsQuery.isSuccess }}
          optionsLoading={categoriesQuery.isPending || instructorsQuery.isPending}
          getSnapshot={() => ({ values: getValues(), isDirty: (field) => Boolean(dirtyFields[field]), customSlug: slugManuallyEdited })}
          onApply={importCourse}
          onClose={() => setImportOpen(false)}
        />
      )}
    </section>
  );
}

function getCourseInput(values: CourseFormValues, currency: string): AdminCourseInput | null {
  const price = values.isFree ? 0 : parsePriceToMinorUnits(values.regularPrice);
  const hasDiscount = !values.isFree && values.discountedPrice.trim() !== "";
  const discounted = hasDiscount ? parsePriceToMinorUnits(values.discountedPrice) : null;
  if (price === null || (hasDiscount && discounted === null)) return null;
  const lines = (items: string[]) => items.map((item) => item.trim()).filter(Boolean);

  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    shortDescription: values.shortDescription.trim(),
    description: values.description.trim(),
    categoryId: values.categoryId,
    instructorId: values.instructorId,
    level: values.level,
    language: values.language.trim(),
    thumbnailUrl: values.thumbnailDataUrl?.trim() || null,
    promotionalVideoUrl: values.promotionalVideoUrl.trim() || null,
    pricingType: values.isFree ? "FREE" : "PAID",
    currency,
    priceMinorUnits: price,
    discountedPriceMinorUnits: discounted,
    learningOutcomes: lines(values.learningOutcomes),
    requirements: lines(values.requirements),
    targetAudience: lines(values.targetAudience),
  };
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
