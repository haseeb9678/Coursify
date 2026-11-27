import { z } from "zod";
import { isCategoryHexColor, type CategoryColors } from "@/features/categories/category-colors";
import { resolveCategoryIconName } from "@/features/categories/category-icon-components";
import { parsePriceToMinorUnits } from "@/features/admin/utils/learning.utils";

const slugSchema = z
  .string()
  .trim()
  .min(2, "Use at least two characters.")
  .max(90, "Use no more than 90 characters.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens.");

const categoryIconSchema = z.string().refine(
  (name) => resolveCategoryIconName(name) !== undefined,
  "Choose an icon from the library.",
);
const categoryColorSchema = z.string().refine(isCategoryHexColor, "Enter a HEX color like #2563EB.");

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Enter a category name.").max(70),
  slug: slugSchema,
  description: z.string().trim().min(10, "Add a short description.").max(400),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  iconKey: categoryIconSchema,
  iconColor: categoryColorSchema,
  iconBackground: categoryColorSchema,
  imageDataUrl: z.string().nullable(),
});

export function getCategoryFormSchema(saved?: CategoryColors & { iconKey: string }) {
  if (!saved) return categorySchema;

  // A saved legacy value may pass through an edit without being resubmitted.
  return categorySchema.extend({
    iconKey: resolveCategoryIconName(saved.iconKey)
      ? categoryIconSchema
      : categoryIconSchema.or(z.literal(saved.iconKey)),
    iconColor: isCategoryHexColor(saved.iconColor)
      ? categoryColorSchema
      : categoryColorSchema.or(z.literal(saved.iconColor)),
    iconBackground: isCategoryHexColor(saved.iconBackground)
      ? categoryColorSchema
      : categoryColorSchema.or(z.literal(saved.iconBackground)),
  });
}

export const courseFormSchema = z
  .object({
    title: z.string().trim().min(4, "Enter a course title.").max(100),
    slug: slugSchema,
    shortDescription: z
      .string()
      .trim()
      .min(12, "Add a short course summary.")
      .max(180),
    description: z.string().trim().max(5000),
    categoryId: z.string().min(1, "Choose an active category."),
    instructorId: z.string().min(1, "Choose an instructor."),
    level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
    language: z.string().trim().min(2, "Enter the course language.").max(40),
    thumbnailDataUrl: z.string().nullable(),
    promotionalVideoUrl: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || z.url().safeParse(value).success,
        "Enter a valid promotional video URL.",
      ),
    isFree: z.boolean(),
    regularPrice: z.string(),
    discountedPrice: z.string(),
    learningOutcomes: z.array(z.string().trim().max(180)),
    requirements: z.array(z.string().trim().max(180)),
    targetAudience: z.array(z.string().trim().max(180)),
  })
  .superRefine((values, context) => {
    if (values.isFree) return;
    const regular = parsePriceToMinorUnits(values.regularPrice);
    if (regular === null || regular <= 0) {
      context.addIssue({
        code: "custom",
        path: ["regularPrice"],
        message: "Enter a positive price with up to two decimal places.",
      });
      return;
    }

    if (values.discountedPrice.trim() !== "") {
      const discounted = parsePriceToMinorUnits(values.discountedPrice);
      if (discounted === null || discounted <= 0) {
        context.addIssue({
          code: "custom",
          path: ["discountedPrice"],
          message: "Enter a valid discounted price.",
        });
      } else if (discounted >= regular) {
        context.addIssue({
          code: "custom",
          path: ["discountedPrice"],
          message: "Discounted price must be lower than the regular price.",
        });
      }
    }
  });

export const sectionSchema = z.object({
  title: z.string().trim().min(3, "Enter a section title.").max(100),
  description: z.string().trim().max(500),
});

export const lessonSchema = z
  .object({
    title: z.string().trim().refine((title) => {
      const length = Array.from(title).length;
      return length >= 2 && length <= 180;
    }, "Enter a lesson title between 2 and 180 characters."),
    description: z.string().trim().min(8, "Add a short lesson description.").max(500),
    type: z.enum(["VIDEO", "TEXT", "PDF"]),
    durationSeconds: z.number().int().positive().nullable(),
    isPreview: z.boolean(),
    content: z.string().trim().max(12000),
    mediaUrl: z.string().trim(),
    mediaAssetId: z.uuid().nullish(),
    resources: z.array(
      z.object({
        title: z.string().trim().min(2, "Enter a resource title.").max(100),
        type: z.enum(["LINK", "PDF", "DOCUMENT", "FILE"]),
        url: z.string().trim(),
        mediaAssetId: z.uuid().nullish(),
      }),
    ),
  })
  .superRefine((values, context) => {
    if (
      values.type === "VIDEO" && !values.mediaAssetId && !values.mediaUrl
    ) {
      context.addIssue({
        code: "custom",
        path: ["mediaUrl"],
        message: "Upload an MP4 video for this lesson.",
      });
    }
    if (values.type === "TEXT" && values.content.length < 20) {
      context.addIssue({
        code: "custom",
        path: ["content"],
        message: "Add at least 20 characters of lesson content.",
      });
    }
    if (
      values.type === "PDF" &&
      !values.mediaUrl && !values.mediaAssetId
    ) {
      context.addIssue({
        code: "custom",
        path: ["mediaUrl"],
        message: "Upload a PDF for this lesson.",
      });
    }
    values.resources.forEach((resource, index) => {
      if (resource.type !== "LINK" && !resource.mediaAssetId && !resource.url) {
        context.addIssue({ code: "custom", path: ["resources", index], message: "Upload a file for the resource." });
      }
      if (resource.type === "LINK" && !z.url().safeParse(resource.url).success) {
        context.addIssue({
          code: "custom",
          path: ["resources", index, "url"],
          message: "Enter a valid resource URL.",
        });
      }
    });
  });
