import { courseFormSchema } from "@/features/admin/schemas/learning.schemas";
import { courseJsonSchema, type CourseJson, type CourseJsonInput } from "@/features/admin/schemas/course-json-import.schema";
import type { CategoryOption, InstructorOption } from "@/features/admin/types/learning-api.types";
import type { CourseFormInput } from "@/features/admin/types/learning.types";
import { parsePriceToMinorUnits, slugifyLearningName } from "@/features/admin/utils/learning.utils";

export const MAX_COURSE_JSON_LENGTH = 65_536;
export const COURSE_JSON_SAMPLE = {
  title: "Complete Digital Marketing Masterclass",
  slug: "complete-digital-marketing-masterclass",
  shortDescription: "Master SEO, social media marketing, and digital advertising.",
  description: "Learn digital marketing through practical exercises and real-world projects.",
  categorySlug: "digital-marketing",
  instructorName: "Example Instructor",
  level: "BEGINNER",
  language: "English",
  thumbnailUrl: "https://example.com/course-thumbnail.jpg",
  promotionalVideoUrl: null,
  pricingType: "PAID",
  currency: "USD",
  price: 59.99,
  discountedPrice: 24.99,
  learningOutcomes: ["Understand digital marketing fundamentals", "Build a social media campaign"],
  requirements: ["Basic computer knowledge", "Internet access"],
  targetAudience: ["Students", "Freelancers", "Business owners"],
} satisfies CourseJsonInput;

export type ImportMode = "fill" | "overwrite";
export type FormField = keyof CourseFormInput;
export type ImportPatch = Partial<CourseFormInput>;
export type InstructorReference = InstructorOption & { email?: string };
export type CourseReferences = {
  categories: readonly CategoryOption[];
  instructors: readonly InstructorReference[];
  warnings?: string[];
};
export interface CourseImportPlan {
  patch: ImportPatch;
  fields: { name: FormField; kind: "fill" | "preserve" | "overwrite" }[];
  errors: string[];
  warnings: string[];
  category?: CategoryOption;
  instructor?: InstructorReference;
}

export const fieldLabels: Record<FormField, string> = {
  title: "Title", slug: "Slug", shortDescription: "Short description", description: "Description",
  categoryId: "Category", instructorId: "Instructor", level: "Level", language: "Language",
  thumbnailDataUrl: "Thumbnail URL", promotionalVideoUrl: "Promotional video URL",
  isFree: "Pricing type", regularPrice: "Regular price", discountedPrice: "Discounted price",
  learningOutcomes: "Learning outcomes", requirements: "Requirements", targetAudience: "Target audience",
};

export function readJson(source: string): { value: unknown } | { error: string } {
  if (source.length > MAX_COURSE_JSON_LENGTH) return { error: "Use at most 65,536 characters of JSON." };
  if (!source.trim()) return { error: "Paste or load course JSON first." };
  try {
    const value: unknown = JSON.parse(source);
    return { value };
  } catch {
    return { error: "Invalid JSON. Check quotation marks, commas, and braces." };
  }
}

export function parseCourseJson(source: string) {
  const parsed = readJson(source);
  if ("error" in parsed) return { errors: [parsed.error], unknown: [] };
  const { value } = parsed;
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { errors: ["The JSON must contain one course object."], unknown: [] };
  }
  const keys = Object.keys(value);
  const unknown = keys.filter((key) => !Object.hasOwn(courseJsonSchema.shape, key));
  const allowed = Object.fromEntries(Object.entries(value).filter(([key]) => Object.hasOwn(courseJsonSchema.shape, key)));
  const result = courseJsonSchema.safeParse(allowed);
  if (!result.success) return { errors: result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`), unknown };
  if (!Object.keys(result.data).some((key) => key !== "currency")) {
    return { errors: ["Add at least one importable course field."], unknown };
  }
  return { course: result.data, errors: [], unknown };
}

export const normalizedName = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();

function resolveReference<T>(
  options: readonly T[],
  identifiers: ((option: T) => boolean)[],
  label: string,
) {
  if (!identifiers.length) return {};
  for (const identifier of identifiers) {
    const matches = options.filter(identifier);
    if (matches.length === 0) continue;
    const consistent = matches.filter((option) => identifiers.every((candidate) => candidate(option)));
    if (consistent.length === 1) return { option: consistent[0] };
    if (!consistent.length) return { error: `The supplied ${label.toLowerCase()} identifiers conflict.` };
    return { warning: `Multiple ${label.toLowerCase()}s match. Select one manually.` };
  }
  return { warning: `No eligible ${label.toLowerCase()} matched. Select one manually.` };
}

export function sameField(a: CourseFormInput[FormField] | undefined, b: CourseFormInput[FormField] | undefined) {
  return Array.isArray(a) && Array.isArray(b)
    ? a.length === b.length && a.every((item, index) => item === b[index])
    : a === b;
}

export const pricingImportFields = ["isFree", "regularPrice", "discountedPrice"] as const;
const directFields = [
  "title", "slug", "shortDescription", "description", "level", "language", "learningOutcomes", "requirements", "targetAudience",
] as const;

export function createCourseImportPlan(
  course: CourseJson,
  current: CourseFormInput,
  isDirty: (field: FormField) => boolean,
  customSlug: boolean,
  references: CourseReferences,
  mode: ImportMode,
): CourseImportPlan {
  const plan: CourseImportPlan = { patch: {}, fields: [], errors: [], warnings: [...(references.warnings ?? [])] };
  const protectedField = (field: FormField) => {
    if (field === "slug" && customSlug) return true;
    const value = current[field];
    if (field === "isFree" || field === "level" || field === "language") return isDirty(field);
    return isDirty(field) || (Array.isArray(value) ? value.some((item) => item.trim()) : typeof value === "string" && Boolean(value.trim()));
  };
  const apply = <K extends FormField>(name: K, value: CourseFormInput[K], preserve = protectedField(name)) => {
    if (sameField(current[name], value)) return;
    if (preserve && mode === "fill") {
      plan.fields.push({ name, kind: "preserve" });
      return;
    }
    plan.patch[name] = value;
    plan.fields.push({ name, kind: preserve ? "overwrite" : "fill" });
  };
  for (const name of directFields) {
    const value = course[name];
    if (value !== undefined) apply(name, value);
  }
  if (course.thumbnailUrl !== undefined) apply("thumbnailDataUrl", course.thumbnailUrl || null);
  if (course.promotionalVideoUrl !== undefined) apply("promotionalVideoUrl", course.promotionalVideoUrl ?? "");
  if (plan.patch.title && course.slug === undefined && !customSlug) {
    const slug = slugifyLearningName(plan.patch.title).slice(0, 90).replace(/-+$/, "");
    if (courseFormSchema.shape.slug.safeParse(slug).success) apply("slug", slug);
    else plan.warnings.push("A slug could not be generated from the title. Enter one manually.");
  }

  const categoryIdentifiers = [];
  if (course.categoryId) categoryIdentifiers.push((item: CategoryOption) => item.id === course.categoryId);
  if (course.categorySlug) categoryIdentifiers.push((item: CategoryOption) => item.slug === course.categorySlug);
  if (course.categoryName) categoryIdentifiers.push((item: CategoryOption) => normalizedName(item.name) === normalizedName(course.categoryName ?? ""));
  const category = resolveReference(references.categories, categoryIdentifiers, "Category");
  if (category.error) plan.errors.push(category.error);
  if (category.warning) plan.warnings.push(category.warning);
  if (category.option) {
    plan.category = category.option;
    apply("categoryId", category.option.id);
  }

  const instructorIdentifiers = [];
  if (course.instructorId) instructorIdentifiers.push((item: InstructorReference) => item.id === course.instructorId);
  if (course.instructorEmail) instructorIdentifiers.push((item: InstructorReference) => item.email?.toLowerCase() === course.instructorEmail);
  if (course.instructorName) instructorIdentifiers.push((item: InstructorReference) => normalizedName(item.name) === normalizedName(course.instructorName ?? ""));
  const instructor = resolveReference(references.instructors, instructorIdentifiers, "Instructor");
  if (instructor.error) plan.errors.push(instructor.error);
  if (instructor.warning) plan.warnings.push(instructor.warning);
  if (instructor.option) {
    plan.instructor = instructor.option;
    apply("instructorId", instructor.option.id);
  }

  if (course.pricingType !== undefined || course.price !== undefined || course.discountedPrice !== undefined) {
    const free = course.pricingType === undefined ? current.isFree : course.pricingType === "FREE";
    const regular = course.price ?? current.regularPrice;
    const discount = course.discountedPrice === undefined ? current.discountedPrice : course.discountedPrice ?? "";
    const regularMinor = parsePriceToMinorUnits(regular);
    const discountMinor = parsePriceToMinorUnits(discount);
    if (free && ((course.price !== undefined && regularMinor !== 0) || (course.discountedPrice !== undefined && course.discountedPrice !== null))) {
      plan.errors.push("Free courses use a zero price and a null or omitted discount. Include pricingType PAID to import a paid price.");
    } else if (!free && (regularMinor === null || regularMinor <= 0 || regularMinor > 100_000_000)) {
      plan.errors.push("A paid course needs a valid positive regular price.");
    } else if (!free && discount.trim() && (discountMinor === null || discountMinor <= 0 || regularMinor === null || discountMinor >= regularMinor)) {
      plan.errors.push("Discounted price must be positive and lower than the regular price.");
    } else {
      const preserve = pricingImportFields.some(protectedField);
      if (course.pricingType !== undefined) apply("isFree", free, preserve);
      if (course.price !== undefined) apply("regularPrice", free ? "" : regular, preserve);
      if (course.discountedPrice !== undefined) apply("discountedPrice", discount, preserve);
    }
  }

  return plan;
}

export const importFields = Object.keys(fieldLabels).filter((key): key is FormField => Object.hasOwn(fieldLabels, key));
