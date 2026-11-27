import { getAdminCategories } from "@/features/admin/api/learning.api";
import { getAdminUser, getAdminUsers } from "@/features/admin/api/users.api";
import type { CourseJson } from "@/features/admin/schemas/course-json-import.schema";
import type { CategoryOption, InstructorOption } from "@/features/admin/types/learning-api.types";
import type { AdminUser } from "@/features/admin/types/users.types";
import { normalizedName, type CourseReferences, type InstructorReference } from "@/features/admin/utils/course-json-import";
import { getGraphQLErrorCode } from "@/lib/graphql/error";

const optionLimit = 100;

async function eligibleCategories(course: CourseJson, options: readonly CategoryOption[], available: boolean) {
  if (!course.categoryId && !course.categorySlug && !course.categoryName) return [];
  if (available && (options.length < optionLimit || options.some((item) =>
    (course.categoryId && item.id === course.categoryId) || (course.categorySlug && item.slug === course.categorySlug),
  ))) return options;

  const matches = new Map<string, CategoryOption>();
  const search = course.categoryId || (course.categoryName && course.categorySlug) ? undefined
    : course.categorySlug ?? (course.categoryName ? normalizedName(course.categoryName).split(" ")[0] : undefined);
  for (let page = 1; ; page += 1) {
    const response = await getAdminCategories({ page, limit: optionLimit }, { status: "ACTIVE", search });
    for (const item of response.items) {
      if (item.status !== "ACTIVE") continue;
      if (item.id === course.categoryId || item.slug === course.categorySlug ||
          (course.categoryName && normalizedName(item.name) === normalizedName(course.categoryName))) {
        matches.set(item.id, { id: item.id, name: item.name, slug: item.slug });
      }
    }
    if (!response.meta.hasNext) return [...matches.values()];
  }
}

function instructorOption(user: AdminUser, includeEmail: boolean): InstructorReference {
  return { id: user.id, name: user.name, avatar: user.avatar, ...(includeEmail ? { email: user.email } : {}) };
}

async function eligibleInstructors(course: CourseJson, options: readonly InstructorOption[], available: boolean) {
  if (!course.instructorId && !course.instructorName && !course.instructorEmail) return [];
  if (course.instructorId) {
    const existing = options.find((option) => option.id === course.instructorId);
    if (existing && !course.instructorEmail) return [existing];
    try {
      const user = await getAdminUser({ userId: course.instructorId });
      if (user.role === "INSTRUCTOR" && user.status === "ACTIVE") return [instructorOption(user, Boolean(course.instructorEmail))];
    } catch (error) {
      if (getGraphQLErrorCode(error) !== "NOT_FOUND") throw error;
    }
  }
  if (!course.instructorEmail && available && options.length < optionLimit) return options;

  const matches = new Map<string, InstructorReference>();
  const searches = new Set([course.instructorEmail, course.instructorName && normalizedName(course.instructorName).split(" ")[0]]);
  for (const search of searches) {
    if (!search) continue;
    for (let page = 1; ; page += 1) {
      const response = await getAdminUsers({
        pagination: { page, limit: optionLimit },
        filter: { search, status: "ACTIVE", role: "INSTRUCTOR" },
      });
      for (const item of response.items) {
        if (item.role !== "INSTRUCTOR" || item.status !== "ACTIVE") continue;
        const emailMatches = course.instructorEmail && item.email.toLowerCase() === course.instructorEmail;
        const nameMatches = course.instructorName && normalizedName(item.name) === normalizedName(course.instructorName);
        if (emailMatches || nameMatches) matches.set(item.id, instructorOption(item, Boolean(course.instructorEmail)));
      }
      if (!response.meta.hasNext) break;
    }
    if (course.instructorEmail && [...matches.values()].some(({ email }) => email?.toLowerCase() === course.instructorEmail)) break;
  }
  return [...matches.values()];
}

export async function resolveCourseImportReferences(
  course: CourseJson,
  categories: readonly CategoryOption[],
  instructors: readonly InstructorOption[],
  availability: { categories: boolean; instructors: boolean },
): Promise<CourseReferences> {
  const [categoryResult, instructorResult] = await Promise.allSettled([
    eligibleCategories(course, categories, availability.categories),
    eligibleInstructors(course, instructors, availability.instructors),
  ]);
  return {
    categories: categoryResult.status === "fulfilled" ? categoryResult.value : [],
    instructors: instructorResult.status === "fulfilled" ? instructorResult.value : [],
    warnings: [
      ...(categoryResult.status === "rejected" ? ["The category lookup failed. Retry validation or select a category manually."] : []),
      ...(instructorResult.status === "rejected" ? ["The instructor lookup failed. Retry validation or select an instructor manually."] : []),
    ],
  };
}
