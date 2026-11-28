import { courseWorkspaceClient } from "@/features/instructor/course-workspace";
import { graphqlClient } from "@/lib/graphql/client";
import {
  ADMIN_APPROVE_COURSE_MUTATION,
  ADMIN_ARCHIVE_COURSE_MUTATION,
  ADMIN_CATEGORIES_QUERY,
  ADMIN_CATEGORY_STATS_QUERY,
  ADMIN_COURSE_APPROVAL_DETAILS_QUERY,
  ADMIN_COURSE_APPROVAL_STATS_QUERY,
  ADMIN_COURSE_APPROVALS_QUERY,
  ADMIN_COURSE_CATEGORY_OPTIONS_QUERY,
  ADMIN_COURSE_CURRICULUM_QUERY,
  ADMIN_COURSE_CURRICULUM_STATS_QUERY,
  ADMIN_COURSE_INSTRUCTOR_OPTIONS_QUERY,
  ADMIN_COURSE_QUERY,
  ADMIN_COURSE_REVIEW_HISTORY_QUERY,
  ADMIN_COURSE_STATS_QUERY,
  ADMIN_COURSES_QUERY,
  ADMIN_CREATE_CATEGORY_MUTATION,
  ADMIN_CREATE_COURSE_MUTATION,
  ADMIN_CREATE_LESSON_MUTATION,
  ADMIN_SAVE_LESSON_MUTATION,
  ADMIN_CREATE_RESOURCE_MUTATION,
  ADMIN_CREATE_SECTION_MUTATION,
  ADMIN_DELETE_CATEGORY_MUTATION,
  ADMIN_DELETE_COURSE_MUTATION,
  ADMIN_DELETE_LESSON_MUTATION,
  ADMIN_DELETE_RESOURCE_MUTATION,
  ADMIN_DELETE_SECTION_MUTATION,
  ADMIN_FEATURE_COURSE_MUTATION,
  ADMIN_MOVE_LESSON_MUTATION,
  ADMIN_PUBLISH_COURSE_MUTATION,
  ADMIN_REJECT_COURSE_MUTATION,
  ADMIN_REORDER_LESSONS_MUTATION,
  ADMIN_REORDER_RESOURCES_MUTATION,
  ADMIN_REORDER_SECTIONS_MUTATION,
  ADMIN_RESTORE_COURSE_MUTATION,
  ADMIN_SUBMIT_COURSE_MUTATION,
  ADMIN_UPDATE_CATEGORY_MUTATION,
  ADMIN_UPDATE_CATEGORY_STATUS_MUTATION,
  ADMIN_UPDATE_COURSE_MUTATION,
  ADMIN_UPDATE_LESSON_MUTATION,
  ADMIN_UPDATE_RESOURCE_MUTATION,
  ADMIN_UPDATE_SECTION_MUTATION,
  ADMIN_WITHDRAW_COURSE_MUTATION,
} from "@/features/admin/graphql/learning.graphql";
import type {
  AdminCategory,
  AdminCourse,
  CourseLesson,
  CourseSection,
  LessonResource,
  CourseStatus,
} from "@/features/admin/types/learning.types";
import type {
  AdminCategoriesFilter,
  AdminCategoryInput,
  AdminCategoryUpdateInput,
  AdminCourseInput,
  AdminCoursesFilter,
  ApprovalDetails,
  ApprovalStats,
  BackendAdminCategory,
  BackendCourse,
  CategoryOption,
  CategoryStats,
  CourseReviewRecord,
  CourseStats,
  CurriculumRecord,
  InstructorOption,
  LearningPage,
  LessonRecord,
  LessonResourceRecord,
  MutationResponse,
  PaginationInput,
  SectionRecord,
} from "@/features/admin/types/learning-api.types";

type BackendPage<T> = LearningPage<T>;
type SortVariables = {
  field: string;
  direction: "ASC" | "DESC";
};

function assertSuccess<T extends MutationResponse>(result: T): T {
  if (!result.success) throw new Error(result.message);
  return result;
}

function mapCategory(category: BackendAdminCategory): AdminCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    status: category.status,
    iconKey: category.iconName,
    imageDataUrl: category.imageUrl,
    iconColor: category.iconColor,
    iconBackground: category.iconBackground,
    courseCount: category.courseCount,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

function mapCourse(course: BackendCourse): AdminCourse {
  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    shortDescription: course.shortDescription,
    description: course.description,
    categoryId: course.category.id,
    categoryName: course.category.name,
    instructorId: course.instructor.id,
    instructorName: course.instructor.name,
    level: course.level,
    language: course.language,
    thumbnailDataUrl: course.thumbnailUrl,
    promotionalVideoUrl: course.promotionalVideoUrl ?? "",
    pricing: course.pricing,
    learningOutcomes: course.learningOutcomes,
    requirements: course.requirements,
    targetAudience: course.targetAudience,
    status: course.status,
    isFeatured: course.isFeatured ?? false,
    canDelete: course.canDelete ?? undefined,
    sectionCount: course.sectionCount ?? 0,
    lessonCount: course.lessonCount ?? 0,
    enrollmentCount: course.enrollmentCount,
    durationSeconds: course.durationSeconds,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    submittedAt: course.submittedAt,
  };
}

function mapSection(section: SectionRecord): CourseSection {
  return {
    id: section.id,
    courseId: section.courseId,
    title: section.title,
    description: section.description,
    position: section.position,
    createdAt: section.createdAt,
    updatedAt: section.updatedAt,
  };
}

function mapResource(resource: LessonResourceRecord): LessonResource {
  return {
    id: resource.id,
    title: resource.title,
    type: resource.type,
    url: resource.url,
    mediaAssetId: resource.mediaAssetId,
    fileName: resource.fileName,
    fileSize: resource.fileSize,
  };
}

export function mapLesson(lesson: LessonRecord): CourseLesson {
  return {
    id: lesson.id,
    sectionId: lesson.sectionId,
    title: lesson.title,
    description: lesson.description,
    type: lesson.type,
    durationSeconds: lesson.durationSeconds,
    position: lesson.position,
    isPreview: lesson.isPreview,
    content: lesson.content,
    mediaUrl: lesson.videoUrl ?? lesson.documentUrl ?? "",
    mediaAssetId: lesson.videoAssetId ?? lesson.documentAssetId,
    videoQualities: lesson.videoQualities,
    resources: lesson.resources.map(mapResource),
    createdAt: lesson.createdAt,
    updatedAt: lesson.updatedAt,
  };
}

export async function getAdminCategories(
  pagination: PaginationInput,
  filter?: AdminCategoriesFilter,
  sort?: SortVariables,
): Promise<LearningPage<AdminCategory>> {
  const result = await graphqlClient.request<
    { adminCategories: BackendPage<BackendAdminCategory> },
    { pagination: PaginationInput; filter?: AdminCategoriesFilter; sort?: SortVariables }
  >(ADMIN_CATEGORIES_QUERY, { pagination, filter, sort });
  return {
    ...result.adminCategories,
    items: result.adminCategories.items.map(mapCategory),
  };
}

export async function getAdminCategoryStats(): Promise<CategoryStats> {
  const result = await graphqlClient.request<{ adminCategoryStats: CategoryStats }>(
    ADMIN_CATEGORY_STATS_QUERY,
  );
  return result.adminCategoryStats;
}

export async function createAdminCategory(
  input: AdminCategoryInput,
): Promise<AdminCategory> {
  const result = await graphqlClient.request<
    { adminCreateCategory: { success: boolean; message: string; category: BackendAdminCategory } },
    { input: AdminCategoryInput }
  >(ADMIN_CREATE_CATEGORY_MUTATION, { input });
  assertSuccess(result.adminCreateCategory);
  return mapCategory(result.adminCreateCategory.category);
}

export async function updateAdminCategory(
  input: AdminCategoryUpdateInput,
): Promise<AdminCategory> {
  const result = await graphqlClient.request<
    { adminUpdateCategory: { success: boolean; message: string; category: BackendAdminCategory } },
    { input: AdminCategoryUpdateInput }
  >(ADMIN_UPDATE_CATEGORY_MUTATION, { input });
  assertSuccess(result.adminUpdateCategory);
  return mapCategory(result.adminUpdateCategory.category);
}

export async function updateAdminCategoryStatus(
  id: string,
  status: "ACTIVE" | "INACTIVE",
): Promise<AdminCategory> {
  const input = { id, status };
  const result = await graphqlClient.request<
    { adminUpdateCategoryStatus: { success: boolean; message: string; category: BackendAdminCategory } },
    { input: typeof input }
  >(ADMIN_UPDATE_CATEGORY_STATUS_MUTATION, { input });
  assertSuccess(result.adminUpdateCategoryStatus);
  return mapCategory(result.adminUpdateCategoryStatus.category);
}

export async function deleteAdminCategory(id: string): Promise<void> {
  const result = await graphqlClient.request<
    { adminDeleteCategory: MutationResponse },
    { id: string }
  >(ADMIN_DELETE_CATEGORY_MUTATION, { id });
  assertSuccess(result.adminDeleteCategory);
}

export async function getAdminCourses(
  pagination: PaginationInput,
  filter?: AdminCoursesFilter,
  sort?: SortVariables, instructor = false): Promise<LearningPage<AdminCourse>> {
  const result = await courseWorkspaceClient(instructor).request<
    { adminCourses: BackendPage<BackendCourse> },
    { pagination: PaginationInput; filter?: AdminCoursesFilter; sort?: SortVariables }
  >(ADMIN_COURSES_QUERY, { pagination, filter, sort });
  return {
    ...result.adminCourses,
    items: result.adminCourses.items.map(mapCourse),
  };
}

export async function getAdminCourse(id: string, instructor = false): Promise<AdminCourse> {
  const result = await courseWorkspaceClient(instructor).request<
    { adminCourse: BackendCourse },
    { id: string }
  >(ADMIN_COURSE_QUERY, { id });
  return mapCourse(result.adminCourse);
}

export async function getAdminCourseStats(): Promise<CourseStats> {
  const result = await graphqlClient.request<{ adminCourseStats: CourseStats }>(
    ADMIN_COURSE_STATS_QUERY,
  );
  return result.adminCourseStats;
}

export async function getCourseInstructorOptions(search?: string): Promise<InstructorOption[]> {
  const result = await graphqlClient.request<
    { adminCourseInstructorOptions: InstructorOption[] },
    { search?: string }
  >(ADMIN_COURSE_INSTRUCTOR_OPTIONS_QUERY, { search });
  return result.adminCourseInstructorOptions;
}

export async function getCourseCategoryOptions(search?: string, instructor = false): Promise<CategoryOption[]> {
  const result = await courseWorkspaceClient(instructor).request<
    { adminCourseCategoryOptions: CategoryOption[] },
    { search?: string }
  >(ADMIN_COURSE_CATEGORY_OPTIONS_QUERY, { search });
  return result.adminCourseCategoryOptions;
}

export async function createAdminCourse(input: AdminCourseInput, instructor = false): Promise<AdminCourse> {
  const { instructorId, curriculum, ...courseFields } = input;
  const payload = instructor ? { ...courseFields, ...(curriculum?.length ? { curriculum } : {}) } : { ...courseFields, instructorId };
  const result = await courseWorkspaceClient(instructor).request<
    { adminCreateCourse: { success: boolean; message: string; course: BackendCourse } },
    { input: Omit<AdminCourseInput, "instructorId"> & { instructorId?: string } }
  >(ADMIN_CREATE_COURSE_MUTATION, { input: payload });
  assertSuccess(result.adminCreateCourse);
  return mapCourse(result.adminCreateCourse.course);
}

export async function updateAdminCourse(
  input: Partial<AdminCourseInput> & { id: string }, instructor = false): Promise<AdminCourse> {
  const { instructorId, ...courseFields } = input;
  const payload = instructor ? courseFields as typeof input : { ...courseFields, instructorId };
  const result = await courseWorkspaceClient(instructor).request<
    { adminUpdateCourse: { success: boolean; message: string; course: BackendCourse } },
    { input: Partial<AdminCourseInput> & { id: string } }
  >(ADMIN_UPDATE_COURSE_MUTATION, { input: payload });
  assertSuccess(result.adminUpdateCourse);
  return mapCourse(result.adminUpdateCourse.course);
}

export async function runCourseAction(
  action:
    | "delete"
    | "submit"
    | "withdraw"
    | "publish"
    | "archive"
    | "restore",
  id: string,
  expectedStatus?: CourseStatus, instructor = false): Promise<AdminCourse | void> {
  const configs = {
    delete: { document: ADMIN_DELETE_COURSE_MUTATION, field: "adminDeleteCourse" },
    submit: { document: ADMIN_SUBMIT_COURSE_MUTATION, field: "adminSubmitCourseForReview" },
    withdraw: { document: ADMIN_WITHDRAW_COURSE_MUTATION, field: "adminWithdrawCourseSubmission" },
    publish: { document: ADMIN_PUBLISH_COURSE_MUTATION, field: "adminPublishCourse" },
    archive: { document: ADMIN_ARCHIVE_COURSE_MUTATION, field: "adminArchiveCourse" },
    restore: { document: ADMIN_RESTORE_COURSE_MUTATION, field: "adminRestoreCourse" },
  } as const;
  const config = configs[action];
  const result = await courseWorkspaceClient(instructor).request<Record<string, { success: boolean; message: string; course?: BackendCourse }>, { id: string; expectedStatus?: typeof expectedStatus }>(
    config.document,
    action === "restore" ? { id, expectedStatus } : { id },
  );
  const response = result[config.field];
  assertSuccess(response);
  return response.course ? mapCourse(response.course) : undefined;
}

export async function updateCourseFeatured(
  id: string,
  isFeatured: boolean,
): Promise<AdminCourse> {
  const result = await graphqlClient.request<
    { adminUpdateCourseFeaturedStatus: { success: boolean; message: string; course: BackendCourse } },
    { input: { id: string; isFeatured: boolean } }
  >(ADMIN_FEATURE_COURSE_MUTATION, { input: { id, isFeatured } });
  assertSuccess(result.adminUpdateCourseFeaturedStatus);
  return mapCourse(result.adminUpdateCourseFeaturedStatus.course);
}

export async function getAdminCurriculum(courseId: string, instructor = false): Promise<CurriculumRecord> {
  const result = await courseWorkspaceClient(instructor).request<{ adminCourseCurriculum: CurriculumRecord }, { courseId: string }>(
    ADMIN_COURSE_CURRICULUM_QUERY,
    { courseId },
  );
  return result.adminCourseCurriculum;
}

export async function getAdminCurriculumStats(courseId: string) {
  const result = await graphqlClient.request<
    { adminCourseCurriculumStats: { totalSections: number; totalLessons: number; totalVideoLessons: number; totalTextLessons: number; totalPdfLessons: number; totalDurationSeconds: number; totalPreviewLessons: number } },
    { courseId: string }
  >(ADMIN_COURSE_CURRICULUM_STATS_QUERY, { courseId });
  return result.adminCourseCurriculumStats;
}

export async function saveSection(
  action: "create" | "update",
  input: { courseId?: string; id?: string; title: string; description: string }, instructor = false): Promise<CourseSection> {
  if (action === "create") {
    const createInput = { courseId: input.courseId ?? "", title: input.title, description: input.description };
    const result = await courseWorkspaceClient(instructor).request<
      { adminCreateCourseSection: { success: boolean; message: string; section: SectionRecord } },
      { input: typeof createInput }
    >(ADMIN_CREATE_SECTION_MUTATION, { input: createInput });
    assertSuccess(result.adminCreateCourseSection);
    return mapSection(result.adminCreateCourseSection.section);
  }
  const updateInput = { id: input.id ?? "", title: input.title, description: input.description };
  const result = await courseWorkspaceClient(instructor).request<
    { adminUpdateCourseSection: { success: boolean; message: string; section: SectionRecord } },
    { input: typeof updateInput }
  >(ADMIN_UPDATE_SECTION_MUTATION, { input: updateInput });
  assertSuccess(result.adminUpdateCourseSection);
  return mapSection(result.adminUpdateCourseSection.section);
}

export async function deleteSection(id: string, instructor = false) {
  const result = await courseWorkspaceClient(instructor).request<{ adminDeleteCourseSection: MutationResponse }, { id: string }>(
    ADMIN_DELETE_SECTION_MUTATION,
    { id },
  );
  assertSuccess(result.adminDeleteCourseSection);
}

export async function reorderSections(courseId: string, orderedSectionIds: string[], instructor = false) {
  const input = { courseId, orderedSectionIds };
  const result = await courseWorkspaceClient(instructor).request<{ adminReorderCourseSections: MutationResponse }, { input: typeof input }>(
    ADMIN_REORDER_SECTIONS_MUTATION,
    { input },
  );
  assertSuccess(result.adminReorderCourseSections);
}

export async function saveLesson(
  action: "create" | "update",
  input: {
    id?: string;
    sectionId: string;
    title: string;
    description: string;
    type: "VIDEO" | "TEXT" | "PDF";
    content: string;
    videoUrl: string | null;
    documentUrl: string | null;
    mediaAssetId?: string | null;
    durationSeconds: number | null;
    isPreview: boolean;
    videoQualities?: CourseLesson["videoQualities"];
    resources?: { id?: string; title: string; type: "LINK" | "PDF" | "FILE" | "DOCUMENT"; url: string; mediaAssetId?: string | null }[];
  }, instructor = false): Promise<CourseLesson> {
  if (input.resources) {
    const { id, sectionId, title, description, type, content, videoUrl, documentUrl, durationSeconds, isPreview, mediaAssetId, resources, videoQualities } = input;
    const saved = await courseWorkspaceClient(instructor).request<{ adminSaveCourseLesson: { success: boolean; message: string; lesson: LessonRecord } }>(
      ADMIN_SAVE_LESSON_MUTATION, { input: { id, sectionId, title, description, type, content, videoUrl, documentUrl, durationSeconds, isPreview, mediaAssetId, resources, videoQualities } },
    );
    assertSuccess(saved.adminSaveCourseLesson);
    return mapLesson(saved.adminSaveCourseLesson.lesson);
  }
  if (action === "create") {
    const createInput = {
      sectionId: input.sectionId,
      title: input.title,
      description: input.description,
      type: input.type,
      content: input.content,
      videoUrl: input.videoUrl,
      documentUrl: input.documentUrl, mediaAssetId: input.mediaAssetId || undefined,
      durationSeconds: input.durationSeconds,
      isPreview: input.isPreview,
    };
    const result = await courseWorkspaceClient(instructor).request<
      { adminCreateCourseLesson: { success: boolean; message: string; lesson: LessonRecord } },
      { input: typeof createInput }
    >(ADMIN_CREATE_LESSON_MUTATION, { input: createInput });
    assertSuccess(result.adminCreateCourseLesson);
    return mapLesson(result.adminCreateCourseLesson.lesson);
  }
  const updateInput = {
    id: input.id ?? "",
    title: input.title,
    description: input.description,
    type: input.type,
    content: input.content,
    videoUrl: input.videoUrl,
    documentUrl: input.documentUrl, mediaAssetId: input.mediaAssetId || undefined,
    durationSeconds: input.durationSeconds,
    isPreview: input.isPreview,
  };
  const result = await courseWorkspaceClient(instructor).request<
    { adminUpdateCourseLesson: { success: boolean; message: string; lesson: LessonRecord } },
    { input: typeof updateInput }
  >(ADMIN_UPDATE_LESSON_MUTATION, { input: updateInput });
  assertSuccess(result.adminUpdateCourseLesson);
  return mapLesson({ ...result.adminUpdateCourseLesson.lesson, resources: [] });
}

export async function deleteLesson(id: string, instructor = false) {
  const result = await courseWorkspaceClient(instructor).request<{ adminDeleteCourseLesson: MutationResponse }, { id: string }>(
    ADMIN_DELETE_LESSON_MUTATION,
    { id },
  );
  assertSuccess(result.adminDeleteCourseLesson);
}

export async function reorderLessons(sectionId: string, orderedLessonIds: string[], instructor = false) {
  const input = { sectionId, orderedLessonIds };
  const result = await courseWorkspaceClient(instructor).request<{ adminReorderCourseLessons: MutationResponse }, { input: typeof input }>(
    ADMIN_REORDER_LESSONS_MUTATION,
    { input },
  );
  assertSuccess(result.adminReorderCourseLessons);
}

export async function moveLesson(lessonId: string, destinationSectionId: string, instructor = false) {
  const input = { lessonId, destinationSectionId };
  const result = await courseWorkspaceClient(instructor).request<{ adminMoveCourseLesson: MutationResponse }, { input: typeof input }>(
    ADMIN_MOVE_LESSON_MUTATION,
    { input },
  );
  assertSuccess(result.adminMoveCourseLesson);
}

export async function saveLessonResource(
  action: "create" | "update",
  input: { id?: string; lessonId?: string; title: string; type: "LINK" | "PDF" | "DOCUMENT" | "FILE"; url: string; mediaAssetId?: string | null; fileName?: string; fileSize?: number }, instructor = false) {
  if (action === "create") {
    const createInput = {
      lessonId: input.lessonId ?? "",
      title: input.title,
      type: input.type,
      url: input.url,
      fileName: input.fileName,
      fileSize: input.fileSize,
      mediaAssetId: input.mediaAssetId || undefined,
    };
    const result = await courseWorkspaceClient(instructor).request<
      { adminCreateLessonResource: { success: boolean; message: string; resource: LessonResourceRecord } },
      { input: typeof createInput }
    >(ADMIN_CREATE_RESOURCE_MUTATION, { input: createInput });
    assertSuccess(result.adminCreateLessonResource);
    return result.adminCreateLessonResource.resource;
  }
  const updateInput = { id: input.id ?? "", title: input.title, type: input.type, url: input.url, mediaAssetId: input.mediaAssetId || undefined };
  const result = await courseWorkspaceClient(instructor).request<
    { adminUpdateLessonResource: { success: boolean; message: string; resource: LessonResourceRecord } },
    { input: typeof updateInput }
  >(ADMIN_UPDATE_RESOURCE_MUTATION, { input: updateInput });
  assertSuccess(result.adminUpdateLessonResource);
  return result.adminUpdateLessonResource.resource;
}

export async function deleteLessonResource(id: string, instructor = false) {
  const result = await courseWorkspaceClient(instructor).request<{ adminDeleteLessonResource: MutationResponse }, { id: string }>(
    ADMIN_DELETE_RESOURCE_MUTATION,
    { id },
  );
  assertSuccess(result.adminDeleteLessonResource);
}

export async function reorderLessonResources(lessonId: string, orderedResourceIds: string[], instructor = false) {
  const input = { lessonId, orderedResourceIds };
  const result = await courseWorkspaceClient(instructor).request<{ adminReorderLessonResources: MutationResponse }, { input: typeof input }>(
    ADMIN_REORDER_RESOURCES_MUTATION,
    { input },
  );
  assertSuccess(result.adminReorderLessonResources);
}

export async function getAdminCourseApprovals(
  pagination: PaginationInput,
  filter?: { search?: string; categoryId?: string; status?: CourseStatus },
): Promise<LearningPage<AdminCourse>> {
  const result = await graphqlClient.request<
    { adminCourseApprovals: BackendPage<BackendCourse> },
    { pagination: PaginationInput; filter?: { search?: string; categoryId?: string; status?: CourseStatus } }
  >(ADMIN_COURSE_APPROVALS_QUERY, { pagination, filter });
  return { ...result.adminCourseApprovals, items: result.adminCourseApprovals.items.map(mapCourse) };
}

export async function getApprovalStats(): Promise<ApprovalStats> {
  const result = await graphqlClient.request<{ adminCourseApprovalStats: ApprovalStats }>(
    ADMIN_COURSE_APPROVAL_STATS_QUERY,
  );
  return result.adminCourseApprovalStats;
}

export async function getApprovalDetails(courseId: string) {
  const result = await graphqlClient.request<
    { adminCourseApprovalDetails: ApprovalDetails },
    { courseId: string }
  >(ADMIN_COURSE_APPROVAL_DETAILS_QUERY, { courseId });
  const details = result.adminCourseApprovalDetails;
  return { ...details, course: mapCourse(details.course) };
}

export async function getCourseReviewHistory(
  courseId: string,
  pagination: PaginationInput,
): Promise<LearningPage<CourseReviewRecord>> {
  const result = await graphqlClient.request<
    { adminCourseReviewHistory: LearningPage<CourseReviewRecord> },
    { courseId: string; pagination: PaginationInput }
  >(ADMIN_COURSE_REVIEW_HISTORY_QUERY, { courseId, pagination });
  return result.adminCourseReviewHistory;
}

export async function decideCourseReview(
  decision: "approve" | "reject",
  input: { courseId: string; feedback?: string },
) {
  if (decision === "approve") {
    const result = await graphqlClient.request<
      { adminApproveCourse: { success: boolean; message: string; course: BackendCourse } },
      { input: { courseId: string; feedback?: string } }
    >(ADMIN_APPROVE_COURSE_MUTATION, { input });
    assertSuccess(result.adminApproveCourse);
    return mapCourse(result.adminApproveCourse.course);
  }
  const rejectInput = { courseId: input.courseId, feedback: input.feedback ?? "" };
  const result = await graphqlClient.request<
    { adminRejectCourse: { success: boolean; message: string; course: BackendCourse } },
    { input: typeof rejectInput }
  >(ADMIN_REJECT_COURSE_MUTATION, { input: rejectInput });
  assertSuccess(result.adminRejectCourse);
  return mapCourse(result.adminRejectCourse.course);
}
