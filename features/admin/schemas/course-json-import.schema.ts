import { z } from "zod";

import { courseFormSchema, lessonSchema, sectionSchema } from "./learning.schemas";
import { parsePriceToMinorUnits } from "@/features/admin/utils/learning.utils";

const current = courseFormSchema.shape;
const url = z.string().trim().max(2048).refine((input) => {
  if (!input) return true;
  try {
    const value = new URL(input);
    return /^https?:\/\/[^/?#]/i.test(input) && !value.username && !value.password &&
      ![...input].some((character) => character === "\\" || character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127) &&
      !/\s/.test(input);
  } catch {
    return false;
  }
}, "Enter a public HTTP or HTTPS URL.");

const amount = z.union([z.string().trim().max(32), z.number()]).transform(String)
  .refine((value) => {
    const minor = parsePriceToMinorUnits(value);
    return minor !== null && minor <= 100_000_000;
  }, "Use a nonnegative amount up to 1000000 with at most two decimal places.");
const name = z.string().trim().min(1).max(100);
const id = z.uuid().transform((value) => value.toLowerCase());

export const courseJsonSchema = z.object({
  title: current.title,
  slug: current.slug,
  shortDescription: current.shortDescription,
  description: current.description,
  categoryId: id,
  categorySlug: z.string().trim().min(1).max(200),
  categoryName: name,
  instructorId: id,
  instructorName: name,
  instructorEmail: z.email().max(255).transform((value) => value.toLowerCase()),
  level: z.string().trim().toUpperCase().pipe(current.level),
  language: current.language,
  thumbnailUrl: url.nullable(),
  promotionalVideoUrl: url.nullable(),
  pricingType: z.string().trim().toUpperCase().pipe(z.enum(["FREE", "PAID"])),
  currency: z.string().trim().toUpperCase().pipe(z.literal("USD", { error: "The Create Course form saves in USD." })),
  price: amount,
  discountedPrice: amount.nullable(),
  learningOutcomes: current.learningOutcomes.max(50),
  requirements: current.requirements.max(50),
  targetAudience: current.targetAudience.max(50),
}).partial();

export type CourseJsonInput = z.input<typeof courseJsonSchema>;
export type CourseJson = z.infer<typeof courseJsonSchema>;

const publicHttps = url.refine((value) => !value || (/^https:\/\//i.test(value) && URL.canParse(value) &&
  ![...new URL(value).searchParams.keys()].some((key) => /^x-amz-/i.test(key))), "Use a public HTTPS URL without a storage signature.");

const importResource = z.strictObject({
  title: z.string().trim().min(2).max(180),
  type: z.literal("LINK").default("LINK"),
  url: publicHttps.pipe(z.string().min(1)),
});

const importLesson = z.strictObject({
  title: lessonSchema.shape.title,
  description: z.string().trim().max(500).optional(),
  type: lessonSchema.shape.type,
  content: z.string().trim().max(10_000).optional(),
  durationSeconds: z.number().int().min(0).max(1_000_000).nullish(),
  isPreview: z.boolean().default(false),
  resources: z.array(importResource).max(20).default([]),
});

export const importCurriculumSchema = z.array(z.strictObject({
  title: sectionSchema.shape.title,
  description: sectionSchema.shape.description.optional(),
  lessons: z.array(importLesson).max(100).default([]),
})).max(25).superRefine((modules, context) => {
  const lessons = modules.flatMap((module) => module.lessons);
  if (lessons.length > 100) context.addIssue({ code: "custom", message: "Import up to 100 lessons per course." });
  if (lessons.reduce((total, lesson) => total + lesson.resources.length, 0) > 250) {
    context.addIssue({ code: "custom", message: "Import up to 250 linked resources per course." });
  }
});

export const instructorCourseJsonSchema = courseJsonSchema.omit({ instructorId: true, instructorName: true, instructorEmail: true }).extend({
  thumbnailUrl: publicHttps.nullish(),
  promotionalVideoUrl: publicHttps.nullish(),
  curriculum: importCurriculumSchema.optional(),
  modules: importCurriculumSchema.optional(),
}).refine((data) => !(data.curriculum && data.modules), "Provide either curriculum or modules.");

export type ImportedCurriculum = z.infer<typeof importCurriculumSchema>;
