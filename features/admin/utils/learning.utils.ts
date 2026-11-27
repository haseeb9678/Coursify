import type {
  AdminCategory,
  AdminCourse,
  CategoryFilters,
  CategoryStats,
  CourseApprovalStats,
  CourseApprovalFilters,
  CourseFilters,
  CourseLesson,
  CourseReview,
  CourseSection,
  CourseStats,
  CourseStatus,
  CurriculumStats,
} from "@/features/admin/types/learning.types";
import {
  DEMO_REFERENCE_TIMESTAMP,
  getPaginationMeta,
} from "@/features/admin/utils/management.utils";

const courseTransitions: Record<CourseStatus, readonly CourseStatus[]> = {
  DRAFT: ["PENDING_REVIEW"],
  PENDING_REVIEW: ["APPROVED", "REJECTED", "DRAFT"],
  APPROVED: ["PUBLISHED", "DRAFT"],
  REJECTED: ["DRAFT", "PENDING_REVIEW"],
  PUBLISHED: ["ARCHIVED", "DRAFT"],
  ARCHIVED: ["DRAFT"],
};

export const courseReviewChecklist = [
  { id: "course-info", label: "Course information is complete" },
  { id: "thumbnail", label: "Course thumbnail is appropriate" },
  { id: "pricing", label: "Course pricing is valid" },
  { id: "curriculum", label: "Curriculum is sufficiently structured" },
  { id: "lessons", label: "Lesson information is complete" },
  { id: "outcomes", label: "Learning outcomes are clear" },
  { id: "category", label: "Course is assigned to an appropriate category" },
  { id: "quality", label: "Content quality has been reviewed manually" },
] as const;

export function canTransitionCourseStatus(
  current: CourseStatus,
  next: CourseStatus,
) {
  return courseTransitions[current].includes(next);
}

export type CourseLifecycleAction = "submit" | "publish" | "archive" | "withdraw" | "restore" | "delete";
export type CourseAdminAction = CourseLifecycleAction | "featured";

export function canEditCourse(status?: CourseStatus) {
  return status === "DRAFT" || status === "REJECTED";
}

export function getCourseAdminActions({ status, canDelete }: Pick<AdminCourse, "status" | "canDelete">): CourseAdminAction[] {
  const actions: CourseAdminAction[] = [];
  if (canTransitionCourseStatus(status, "PENDING_REVIEW")) actions.push("submit");
  if (canTransitionCourseStatus(status, "PUBLISHED")) actions.push("publish");
  if (canTransitionCourseStatus(status, "ARCHIVED")) actions.push("archive");
  if (canTransitionCourseStatus(status, "DRAFT")) {
    actions.push(status === "PENDING_REVIEW" ? "withdraw" : "restore");
  }
  if (status === "DRAFT" && canDelete) actions.push("delete");
  if (status === "PUBLISHED") actions.push("featured");
  return actions;
}

export const publishedCourseEditWarning =
  "This course is currently published. Returning it to draft will temporarily remove it from the public course catalog. You will need to submit it for review and publish it again after making changes.";

export function getCourseActionCopy(action: CourseAdminAction, course: AdminCourse) {
  switch (action) {
    case "submit":
      return { label: "Submit for review", description: "Course content and curriculum will be read-only during review.", success: "Course submitted for review." };
    case "withdraw":
      return { label: "Withdraw submission", description: "Withdraw this course from review and return it to draft.", success: "Submission withdrawn. The course is now a draft." };
    case "publish":
      return { label: "Publish course", description: "Publish this approved course in the public catalog.", success: "Course published successfully." };
    case "archive":
      return { label: "Archive course", description: "Archive this course and remove it from the public catalog.", success: "Course archived successfully." };
    case "restore":
      return {
        label: course.status === "PUBLISHED" ? "Unpublish & Edit" : course.status === "ARCHIVED" ? "Restore to draft" : "Return to draft",
        description: course.status === "PUBLISHED"
          ? publishedCourseEditWarning
          : "Return this course to draft. It will need a new approval before publication.",
        success: course.status === "ARCHIVED" ? "Course restored to draft successfully." : "Course returned to draft successfully.",
      };
    case "delete":
      return { label: "Delete draft", description: `Permanently delete ${course.title}?`, success: "Draft course deleted." };
    case "featured":
      return {
        label: course.isFeatured ? "Remove from featured" : "Feature course",
        description: course.isFeatured ? "Remove this course from featured listings." : "Include this course in featured listings.",
        success: "Featured status updated.",
      };
  }
}

export function getCourseReadinessIssues(
  course: AdminCourse,
  categories: readonly AdminCategory[],
  sections: readonly CourseSection[],
  lessons: readonly CourseLesson[],
) {
  const issues: string[] = [];
  const category = categories.find((item) => item.id === course.categoryId);
  const courseSections = sections.filter(
    (section) => section.courseId === course.id,
  );
  const sectionIds = new Set(courseSections.map((section) => section.id));
  const courseLessons = lessons.filter((lesson) =>
    sectionIds.has(lesson.sectionId),
  );

  if (!course.title.trim() || !course.slug.trim()) {
    issues.push("Add a course title and slug.");
  }
  if (!course.shortDescription.trim() || !course.description.trim()) {
    issues.push("Complete the short and detailed descriptions.");
  }
  if (!category || category.status !== "ACTIVE") {
    issues.push("Choose an active category.");
  }
  if (!course.instructorId) {
    issues.push("Assign an instructor.");
  }
  if (!course.thumbnailDataUrl) {
    issues.push("Add a course thumbnail.");
  }
  if (course.learningOutcomes.length < 2) {
    issues.push("Add at least two learning outcomes.");
  }
  if (courseSections.length === 0 || courseLessons.length < 3) {
    issues.push("Add at least one section and three lessons.");
  }
  if (
    courseLessons.some(
      (lesson) =>
        !lesson.title.trim() ||
        !lesson.description.trim() ||
        (lesson.type === "VIDEO" && !lesson.mediaUrl.trim() && !lesson.mediaAssetId) ||
        (lesson.type === "TEXT" && !lesson.content.trim()) ||
        (lesson.type === "PDF" &&
          !lesson.mediaUrl.trim() && !lesson.mediaAssetId &&
          !lesson.resources.some((resource) => resource.type === "PDF")),
    )
  ) {
    issues.push("Complete the required content for every lesson.");
  }
  if (
    course.pricing.type === "PAID" &&
    (course.pricing.priceMinorUnits <= 0 ||
      (course.pricing.discountedPriceMinorUnits !== null &&
        course.pricing.discountedPriceMinorUnits >=
          course.pricing.priceMinorUnits))
  ) {
    issues.push("Review the regular and discounted prices.");
  }

  return issues;
}

export function getCategoryStats(
  categories: readonly AdminCategory[],
  courses: readonly AdminCourse[],
): CategoryStats {
  return {
    total: categories.length,
    active: categories.filter((category) => category.status === "ACTIVE")
      .length,
    inactive: categories.filter((category) => category.status === "INACTIVE")
      .length,
    categorizedCourses: courses.filter((course) =>
      categories.some((category) => category.id === course.categoryId),
    ).length,
  };
}

export function getCourseStats(courses: readonly AdminCourse[]): CourseStats {
  return {
    total: courses.length,
    published: courses.filter((course) => course.status === "PUBLISHED")
      .length,
    drafts: courses.filter((course) => course.status === "DRAFT").length,
    pendingReview: courses.filter(
      (course) => course.status === "PENDING_REVIEW",
    ).length,
    archived: courses.filter((course) => course.status === "ARCHIVED").length,
  };
}

export function getCurriculumStats(
  sections: readonly CourseSection[],
  lessons: readonly CourseLesson[],
): CurriculumStats {
  return {
    sectionCount: sections.length,
    lessonCount: lessons.length,
    videoLessonCount: lessons.filter((lesson) => lesson.type === "VIDEO")
      .length,
    totalDurationSeconds: lessons.reduce(
      (total, lesson) => total + (lesson.durationSeconds ?? 0),
      0,
    ),
    previewLessonCount: lessons.filter((lesson) => lesson.isPreview).length,
  };
}

export function getCourseApprovalStats(
  courses: readonly AdminCourse[],
  reviews: readonly CourseReview[],
): CourseApprovalStats {
  const referenceDate = new Date(DEMO_REFERENCE_TIMESTAMP);
  const startOfMonth = Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    1,
  );
  const startOfNextMonth = Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth() + 1,
    1,
  );

  return {
    pendingReviews: courses.filter(
      (course) => course.status === "PENDING_REVIEW",
    ).length,
    approvedCourses: courses.filter(
      (course) => course.status === "APPROVED",
    ).length,
    rejectedCourses: courses.filter(
      (course) => course.status === "REJECTED",
    ).length,
    reviewedThisMonth: reviews.filter(
      (review) => {
        const createdAt = new Date(review.createdAt).getTime();
        return createdAt >= startOfMonth && createdAt < startOfNextMonth;
      },
    ).length,
  };
}

export function getCourseSectionLessons(
  section: CourseSection,
  lessons: readonly CourseLesson[],
) {
  return lessons
    .filter((lesson) => lesson.sectionId === section.id)
    .sort((a, b) => a.position - b.position);
}

export function formatLearningDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (remainingMinutes === 0) return `${hours} hr`;
  return `${hours} hr ${remainingMinutes} min`;
}

export function formatCoursePrice(
  priceMinorUnits: number,
  currency: string = "USD",
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(priceMinorUnits / 100);
}

export function slugifyLearningName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parsePriceToMinorUnits(value: string) {
  const normalized = value.trim();
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(normalized)) return null;
  const [whole = "0", fraction = ""] = normalized.split(".");
  const minorUnits =
    Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(minorUnits) ? minorUnits : null;
}

export function categoryCourseCount(
  categoryId: string,
  courses: readonly AdminCourse[],
) {
  return courses.filter((course) => course.categoryId === categoryId).length;
}

export function filterLearningCategories(
  categories: readonly AdminCategory[],
  filters: CategoryFilters,
) {
  const search = filters.search.trim().toLowerCase();
  return categories.filter((category) => {
    const matchesSearch =
      !search ||
      `${category.name} ${category.slug}`.toLowerCase().includes(search);
    return (
      matchesSearch &&
      (filters.status === "ALL" || category.status === filters.status)
    );
  });
}

export function filterLearningCourses(
  courses: readonly AdminCourse[],
  filters: CourseFilters,
  categories: readonly AdminCategory[],
  instructorNames: ReadonlyMap<string, string>,
) {
  const search = filters.search.trim().toLowerCase();
  return courses.filter((course) => {
    const instructorName = instructorNames.get(course.instructorId) ?? "";
    const category = categories.find((item) => item.id === course.categoryId);
    const matchesSearch =
      !search ||
      `${course.title} ${course.slug} ${instructorName}`
        .toLowerCase()
        .includes(search);

    return (
      matchesSearch &&
      (filters.categoryId === "ALL" ||
        course.categoryId === filters.categoryId) &&
      (filters.instructorId === "ALL" ||
        course.instructorId === filters.instructorId) &&
      (filters.status === "ALL" || course.status === filters.status) &&
      (filters.level === "ALL" || course.level === filters.level) &&
      (!filters.language ||
        filters.language === "ALL" ||
        course.language === filters.language) &&
      (filters.pricing === "ALL" ||
        course.pricing.type === filters.pricing) &&
      Boolean(category)
    );
  });
}

export function filterCourseApprovals(
  courses: readonly AdminCourse[],
  filters: CourseApprovalFilters,
  categories: readonly AdminCategory[],
  instructorNames: ReadonlyMap<string, string>,
) {
  const search = filters.search.trim().toLowerCase();
  const cutoff =
    filters.submittedWithin === "ALL"
      ? null
      : DEMO_REFERENCE_TIMESTAMP -
        (filters.submittedWithin === "30_DAYS"
          ? 30
          : 365) *
          24 *
          60 *
          60 *
          1000;

  return courses.filter((course) => {
    const instructorName = instructorNames.get(course.instructorId) ?? "";
    const matchesSearch =
      !search ||
      `${course.title} ${instructorName}`.toLowerCase().includes(search);
    const submittedAt = course.submittedAt
      ? new Date(course.submittedAt).getTime()
      : 0;
    return (
      course.status !== "DRAFT" &&
      course.status !== "ARCHIVED" &&
      matchesSearch &&
      (filters.categoryId === "ALL" ||
        course.categoryId === filters.categoryId) &&
      (filters.status === "ALL" || course.status === filters.status) &&
      (cutoff === null || submittedAt >= cutoff) &&
      categories.some((category) => category.id === course.categoryId)
    );
  });
}

export function getLearningPaginationMeta(
  total: number,
  page: number,
  limit: number,
) {
  return getPaginationMeta(total, page, limit);
}

export function courseLessonCount(
  courseId: string,
  sections: readonly CourseSection[],
  lessons: readonly CourseLesson[],
) {
  const sectionIds = new Set(
    sections
      .filter((section) => section.courseId === courseId)
      .map((section) => section.id),
  );
  return lessons.filter((lesson) => sectionIds.has(lesson.sectionId)).length;
}
