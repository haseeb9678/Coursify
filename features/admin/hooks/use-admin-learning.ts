"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminCategory,
  createAdminCourse,
  decideCourseReview,
  deleteAdminCategory,
  deleteLesson,
  deleteLessonResource,
  deleteSection,
  getAdminCategories,
  getAdminCategoryStats,
  getAdminCourse,
  getAdminCourseApprovals,
  getAdminCourseStats,
  getAdminCourses,
  getAdminCurriculum,
  getAdminCurriculumStats,
  getApprovalDetails,
  getApprovalStats,
  getCourseCategoryOptions,
  getCourseInstructorOptions,
  getCourseReviewHistory,
  moveLesson,
  reorderLessonResources,
  reorderLessons,
  reorderSections,
  runCourseAction,
  saveLesson,
  saveLessonResource,
  saveSection,
  updateAdminCategory,
  updateAdminCategoryStatus,
  updateAdminCourse,
  updateCourseFeatured,
} from "@/features/admin/api/learning.api";
import type {
  AdminCategoriesFilter,
  AdminCategoryInput,
  AdminCategoryUpdateInput,
  AdminCourseInput,
  AdminCoursesFilter,
  PaginationInput,
} from "@/features/admin/types/learning-api.types";
import { publicCourseKeys } from "@/features/courses/hooks/use-public-courses";
import type { CourseLifecycleAction } from "@/features/admin/utils/learning.utils";
import type { CourseStatus } from "@/features/admin/types/learning.types";

export const adminLearningKeys = {
  all: ["admin-learning"] as const,
  categories: (pagination: PaginationInput, filter?: AdminCategoriesFilter) =>
    [...adminLearningKeys.all, "categories", pagination, filter] as const,
  categoryStats: () => [...adminLearningKeys.all, "category-stats"] as const,
  courses: (pagination: PaginationInput, filter?: AdminCoursesFilter) =>
    [...adminLearningKeys.all, "courses", pagination, filter] as const,
  course: (id: string) => [...adminLearningKeys.all, "course", id] as const,
  courseStats: () => [...adminLearningKeys.all, "course-stats"] as const,
  curriculum: (id: string) => [...adminLearningKeys.all, "curriculum", id] as const,
  curriculumStats: (id: string) => [...adminLearningKeys.all, "curriculum-stats", id] as const,
  approvals: (pagination: PaginationInput, filter?: { search?: string; categoryId?: string; status?: CourseStatus }) =>
    [...adminLearningKeys.all, "approvals", pagination, filter] as const,
  approvalStats: () => [...adminLearningKeys.all, "approval-stats"] as const,
  approvalDetails: (id: string) => [...adminLearningKeys.all, "approval-details", id] as const,
  reviewHistory: (id: string, pagination: PaginationInput) =>
    [...adminLearningKeys.all, "review-history", id, pagination] as const,
  instructorOptions: (search?: string) =>
    [...adminLearningKeys.all, "instructors", search] as const,
  categoryOptions: (search?: string) =>
    [...adminLearningKeys.all, "category-options", search] as const,
};

function useInvalidateLearning() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: adminLearningKeys.all });
}

function useInvalidateCategories() {
  const invalidateLearning = useInvalidateLearning();
  const queryClient = useQueryClient();
  return () => Promise.all([
    invalidateLearning(),
    queryClient.invalidateQueries({ queryKey: publicCourseKeys.categoryLists() }),
  ]);
}

export function useAdminCategories(
  pagination: PaginationInput,
  filter?: AdminCategoriesFilter,
  sort?: { field: string; direction: "ASC" | "DESC" },
) {
  return useQuery({
    queryKey: [...adminLearningKeys.categories(pagination, filter), sort] as const,
    queryFn: () => getAdminCategories(pagination, filter, sort),
  });
}

export function useAdminCategoryStats() {
  return useQuery({
    queryKey: adminLearningKeys.categoryStats(),
    queryFn: getAdminCategoryStats,
  });
}

export function useCreateAdminCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (input: AdminCategoryInput) => createAdminCategory(input),
    onSuccess: invalidate,
  });
}

export function useUpdateAdminCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (input: AdminCategoryUpdateInput) =>
      updateAdminCategory(input),
    onSuccess: invalidate,
  });
}

export function useUpdateAdminCategoryStatus() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (input: { id: string; status: "ACTIVE" | "INACTIVE" }) =>
      updateAdminCategoryStatus(input.id, input.status),
    onSuccess: invalidate,
  });
}

export function useDeleteAdminCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: deleteAdminCategory,
    onSuccess: invalidate,
  });
}

export function useAdminCourses(
  pagination: PaginationInput,
  filter?: AdminCoursesFilter,
  sort?: { field: string; direction: "ASC" | "DESC" },
) {
  return useQuery({
    queryKey: [...adminLearningKeys.courses(pagination, filter), sort] as const,
    queryFn: () => getAdminCourses(pagination, filter, sort),
  });
}

export function useAdminCourse(id: string, refetchOnMount?: "always") {
  return useQuery({
    queryKey: adminLearningKeys.course(id),
    queryFn: () => getAdminCourse(id),
    enabled: Boolean(id),
    refetchOnMount,
  });
}

export function useAdminCourseStats() {
  return useQuery({
    queryKey: adminLearningKeys.courseStats(),
    queryFn: getAdminCourseStats,
  });
}

export function useCourseInstructorOptions(search?: string) {
  return useQuery({
    queryKey: adminLearningKeys.instructorOptions(search),
    queryFn: () => getCourseInstructorOptions(search),
  });
}

export function useCourseCategoryOptions(search?: string) {
  return useQuery({
    queryKey: adminLearningKeys.categoryOptions(search),
    queryFn: () => getCourseCategoryOptions(search),
  });
}

export function useCreateAdminCourse() {
  const invalidate = useInvalidateLearning();
  return useMutation({
    mutationFn: (input: AdminCourseInput) => createAdminCourse(input),
    onSuccess: invalidate,
  });
}

export function useUpdateAdminCourse() {
  const invalidate = useInvalidateLearning();
  return useMutation({
    mutationFn: (input: Partial<AdminCourseInput> & { id: string }) => updateAdminCourse(input),
    onSuccess: invalidate,
  });
}

export function useAdminCourseAction() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateLearning();
  return useMutation({
    mutationFn: (input: { action: CourseLifecycleAction; id: string; expectedStatus?: CourseStatus }) =>
      runCourseAction(input.action, input.id, input.expectedStatus),
    onError: () => invalidate(),
    onSuccess: async (course, input) => {
      if (course) queryClient.setQueryData(adminLearningKeys.course(course.id), course);
      if (input.action === "delete") {
        queryClient.removeQueries({ queryKey: adminLearningKeys.course(input.id), exact: true });
      }
      await Promise.all([
        invalidate(),
        queryClient.invalidateQueries({ queryKey: publicCourseKeys.all }),
      ]);
    },
  });
}

export function useUpdateCourseFeatured() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateLearning();
  return useMutation({
    mutationFn: (input: { id: string; isFeatured: boolean }) =>
      updateCourseFeatured(input.id, input.isFeatured),
    onSuccess: async (course) => {
      queryClient.setQueryData(adminLearningKeys.course(course.id), course);
      await Promise.all([invalidate(), queryClient.invalidateQueries({ queryKey: publicCourseKeys.all })]);
    },
  });
}

export function useAdminCurriculum(courseId: string) {
  return useQuery({
    queryKey: adminLearningKeys.curriculum(courseId),
    queryFn: () => getAdminCurriculum(courseId),
    enabled: Boolean(courseId),
  });
}

export function useAdminCurriculumStats(courseId: string) {
  return useQuery({
    queryKey: adminLearningKeys.curriculumStats(courseId),
    queryFn: () => getAdminCurriculumStats(courseId),
    enabled: Boolean(courseId),
  });
}

export function useCurriculumMutation() {
  const invalidate = useInvalidateLearning();
  return useMutation({
    mutationFn: async (input:
      | { action: "create-section"; courseId: string; title: string; description: string }
      | { action: "update-section"; id: string; title: string; description: string }
      | { action: "delete-section"; id: string }
      | { action: "reorder-sections"; courseId: string; ids: string[] }
      | { action: "create-lesson" | "update-lesson"; id?: string; sectionId: string; title: string; description: string; type: "VIDEO" | "TEXT" | "PDF"; content: string; videoUrl: string | null; documentUrl: string | null; mediaAssetId?: string | null; durationSeconds: number | null; isPreview: boolean; videoQualities?: import("../types/learning.types").LessonVideoQuality[]; resources?: { id?: string; title: string; type: "LINK" | "PDF" | "FILE" | "DOCUMENT"; url: string; mediaAssetId?: string | null }[] }
      | { action: "delete-lesson"; id: string }
      | { action: "reorder-lessons"; sectionId: string; ids: string[] }
      | { action: "move-lesson"; lessonId: string; destinationSectionId: string }
      | { action: "create-resource" | "update-resource"; id?: string; lessonId?: string; title: string; type: "LINK" | "PDF" | "DOCUMENT" | "FILE"; url: string; mediaAssetId?: string | null; fileName?: string; fileSize?: number }
      | { action: "delete-resource"; id: string }
      | { action: "reorder-resources"; lessonId: string; ids: string[] }) => {
      switch (input.action) {
        case "create-section":
          return saveSection("create", input);
        case "update-section":
          return saveSection("update", input);
        case "delete-section":
          return deleteSection(input.id);
        case "reorder-sections":
          return reorderSections(input.courseId, input.ids);
        case "create-lesson":
        case "update-lesson":
          return saveLesson(input.action === "create-lesson" ? "create" : "update", input);
        case "delete-lesson":
          return deleteLesson(input.id);
        case "reorder-lessons":
          return reorderLessons(input.sectionId, input.ids);
        case "move-lesson":
          return moveLesson(input.lessonId, input.destinationSectionId);
        case "create-resource":
        case "update-resource":
          return saveLessonResource(input.action === "create-resource" ? "create" : "update", input);
        case "delete-resource":
          return deleteLessonResource(input.id);
        case "reorder-resources":
          return reorderLessonResources(input.lessonId, input.ids);
      }
    },
    onSuccess: invalidate,
  });
}

export function useAdminCourseApprovals(
  pagination: PaginationInput,
  filter?: { search?: string; categoryId?: string; status?: CourseStatus },
) {
  return useQuery({
    queryKey: adminLearningKeys.approvals(pagination, filter),
    queryFn: () => getAdminCourseApprovals(pagination, filter),
  });
}

export function useAdminApprovalStats() {
  return useQuery({
    queryKey: adminLearningKeys.approvalStats(),
    queryFn: getApprovalStats,
  });
}

export function useAdminApprovalDetails(courseId: string, refetchOnMount?: "always") {
  return useQuery({
    queryKey: adminLearningKeys.approvalDetails(courseId),
    queryFn: () => getApprovalDetails(courseId),
    enabled: Boolean(courseId),
    refetchOnMount,
  });
}

export function useCourseReviewHistory(courseId: string, pagination: PaginationInput) {
  return useQuery({
    queryKey: adminLearningKeys.reviewHistory(courseId, pagination),
    queryFn: () => getCourseReviewHistory(courseId, pagination),
    enabled: Boolean(courseId),
  });
}

export function useDecideCourseReview() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateLearning();
  return useMutation({
    mutationFn: (input: { decision: "approve" | "reject"; courseId: string; feedback?: string }) =>
      decideCourseReview(input.decision, { courseId: input.courseId, feedback: input.feedback }),
    onError: () => invalidate(),
    onSuccess: (course) => {
      queryClient.setQueryData(adminLearningKeys.course(course.id), course);
      return invalidate();
    },
  });
}
