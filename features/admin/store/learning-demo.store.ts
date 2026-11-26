"use client";

import { create } from "zustand";
import {
  initialLearningCategories,
  initialLearningCourses,
  initialLearningLessons,
  initialLearningReviews,
  initialLearningSections,
} from "@/features/admin/data/learning.data";
import {
  canTransitionCourseStatus,
  courseReviewChecklist,
  getCourseReadinessIssues,
} from "@/features/admin/utils/learning.utils";
import type {
  AdminCategory,
  AdminCourse,
  AdminCourseInput,
  CategoryInput,
  CategoryStatus,
  CourseLesson,
  CourseReview,
  CourseReviewDecision,
  CourseSection,
  LessonInput,
  SectionInput,
} from "@/features/admin/types/learning.types";

interface LearningDemoState {
  categories: AdminCategory[];
  courses: AdminCourse[];
  sections: CourseSection[];
  lessons: CourseLesson[];
  reviews: CourseReview[];
  reviewChecklists: Record<string, string[]>;
  addCategory: (input: CategoryInput) => AdminCategory | null;
  updateCategory: (id: string, input: CategoryInput) => AdminCategory | null;
  setCategoryStatus: (id: string, status: CategoryStatus) => boolean;
  deleteCategory: (id: string) => boolean;
  addCourse: (input: AdminCourseInput) => AdminCourse;
  updateCourse: (id: string, input: AdminCourseInput) => AdminCourse | null;
  transitionCourse: (
    id: string,
    status: AdminCourse["status"],
  ) => boolean;
  deleteCourse: (id: string) => boolean;
  toggleReviewChecklist: (courseId: string, checklistId: string) => void;
  reviewCourse: (
    courseId: string,
    reviewerId: string,
    decision: CourseReviewDecision,
    feedback: string,
  ) => boolean;
  addSection: (courseId: string, input: SectionInput) => CourseSection;
  updateSection: (id: string, input: SectionInput) => CourseSection | null;
  deleteSection: (id: string) => boolean;
  moveSection: (id: string, offset: -1 | 1) => boolean;
  addLesson: (sectionId: string, input: LessonInput) => CourseLesson;
  updateLesson: (id: string, input: LessonInput) => CourseLesson | null;
  deleteLesson: (id: string) => boolean;
  moveLesson: (id: string, offset: -1 | 1) => boolean;
}

let idSequence = 0;

function createLearningId(prefix: string) {
  idSequence += 1;
  return `${prefix}-${Date.now()}-${idSequence}`;
}

function markCourseCurriculumChanged(
  courses: AdminCourse[],
  courseId: string,
  updatedAt: string,
): AdminCourse[] {
  return courses.map((course) =>
    course.id === courseId
      ? {
          ...course,
          status: "DRAFT",
          submittedAt: null,
          updatedAt,
        }
      : course,
  );
}

export const useLearningDemoStore = create<LearningDemoState>((set, get) => ({
  categories: initialLearningCategories,
  courses: initialLearningCourses,
  sections: initialLearningSections,
  lessons: initialLearningLessons,
  reviews: initialLearningReviews,
  reviewChecklists: {},

  addCategory: (input) => {
    const slugExists = get().categories.some(
      (category) => category.slug === input.slug,
    );
    if (slugExists) return null;

    const now = new Date().toISOString();
    const category: AdminCategory = {
      ...input,
      id: createLearningId("category"),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ categories: [...state.categories, category] }));
    return category;
  },

  updateCategory: (id, input) => {
    const current = get().categories.find((category) => category.id === id);
    if (!current) return null;
    if (
      get().categories.some(
        (category) => category.id !== id && category.slug === input.slug,
      )
    ) {
      return null;
    }

    const updated = { ...current, ...input, updatedAt: new Date().toISOString() };
    set((state) => ({
      categories: state.categories.map((category) =>
        category.id === id ? updated : category,
      ),
    }));
    return updated;
  },

  setCategoryStatus: (id, status) => {
    if (!get().categories.some((category) => category.id === id)) return false;
    set((state) => ({
      categories: state.categories.map((category) =>
        category.id === id
          ? { ...category, status, updatedAt: new Date().toISOString() }
          : category,
      ),
    }));
    return true;
  },

  deleteCategory: (id) => {
    const categoryExists = get().categories.some(
      (category) => category.id === id,
    );
    const hasCourses = get().courses.some((course) => course.categoryId === id);
    if (!categoryExists || hasCourses) return false;
    set((state) => ({
      categories: state.categories.filter((category) => category.id !== id),
    }));
    return true;
  },

  addCourse: (input) => {
    const now = new Date().toISOString();
    const course: AdminCourse = {
      ...input,
      id: createLearningId("course"),
      status: "DRAFT",
      enrollmentCount: 0,
      averageRating: null,
      createdAt: now,
      updatedAt: now,
      submittedAt: null,
    };
    set((state) => ({ courses: [...state.courses, course] }));
    return course;
  },

  updateCourse: (id, input) => {
    const current = get().courses.find((course) => course.id === id);
    if (!current || current.status === "ARCHIVED") return null;
    const editableCurrent = {
      title: current.title,
      slug: current.slug,
      shortDescription: current.shortDescription,
      description: current.description,
      categoryId: current.categoryId,
      instructorId: current.instructorId,
      level: current.level,
      language: current.language,
      thumbnailDataUrl: current.thumbnailDataUrl,
      promotionalVideoUrl: current.promotionalVideoUrl,
      pricing: current.pricing,
      learningOutcomes: current.learningOutcomes,
      requirements: current.requirements,
      targetAudience: current.targetAudience,
    };
    const contentChanged =
      JSON.stringify(editableCurrent) !== JSON.stringify(input);
    const status =
      contentChanged && current.status !== "DRAFT" ? "DRAFT" : current.status;
    const updated: AdminCourse = {
      ...current,
      ...input,
      status,
      submittedAt: status === "DRAFT" ? null : current.submittedAt,
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      courses: state.courses.map((course) =>
        course.id === id ? updated : course,
      ),
    }));
    return updated;
  },

  transitionCourse: (id, status) => {
    const course = get().courses.find((item) => item.id === id);
    if (!course || !canTransitionCourseStatus(course.status, status)) {
      return false;
    }
    if (
      status === "PENDING_REVIEW" &&
      getCourseReadinessIssues(
        course,
        get().categories,
        get().sections,
        get().lessons,
      ).length > 0
    ) {
      return false;
    }
    const now = new Date().toISOString();
    set((state) => ({
      courses: state.courses.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              submittedAt:
                status === "PENDING_REVIEW"
                  ? now
                  : item.submittedAt,
              updatedAt: now,
            }
          : item,
      ),
      ...(status === "PENDING_REVIEW"
        ? {
            reviewChecklists: {
              ...state.reviewChecklists,
              [id]: [],
            },
          }
        : {}),
    }));
    return true;
  },

  deleteCourse: (id) => {
    const course = get().courses.find((item) => item.id === id);
    const hasReviews = get().reviews.some((review) => review.courseId === id);
    if (
      !course ||
      course.status !== "DRAFT" ||
      course.enrollmentCount > 0 ||
      hasReviews
    ) {
      return false;
    }

    const sectionIds = get()
      .sections.filter((section) => section.courseId === id)
      .map((section) => section.id);
    set((state) => ({
      courses: state.courses.filter((item) => item.id !== id),
      sections: state.sections.filter((section) => section.courseId !== id),
      lessons: state.lessons.filter(
        (lesson) => !sectionIds.includes(lesson.sectionId),
      ),
    }));
    return true;
  },

  toggleReviewChecklist: (courseId, checklistId) => {
    set((state) => {
      const course = state.courses.find((item) => item.id === courseId);
      if (
        !course ||
        course.status !== "PENDING_REVIEW" ||
        !courseReviewChecklist.some((item) => item.id === checklistId)
      ) {
        return state;
      }
      const current = state.reviewChecklists[courseId] ?? [];
      const next = current.includes(checklistId)
        ? current.filter((id) => id !== checklistId)
        : [...current, checklistId];
      return {
        reviewChecklists: {
          ...state.reviewChecklists,
          [courseId]: next,
        },
      };
    });
  },

  reviewCourse: (courseId, reviewerId, decision, feedback) => {
    const course = get().courses.find((item) => item.id === courseId);
    if (
      !course ||
      course.status !== "PENDING_REVIEW" ||
      !reviewerId.trim()
    ) {
      return false;
    }
    const checklist = get().reviewChecklists[courseId] ?? [];
    if (
      decision === "APPROVED" &&
      courseReviewChecklist.some((item) => !checklist.includes(item.id))
    ) {
      return false;
    }
    if (decision !== "APPROVED" && feedback.trim().length < 10) {
      return false;
    }
    const status = decision === "APPROVED" ? "APPROVED" : "REJECTED";
    const review: CourseReview = {
      id: createLearningId("review"),
      courseId,
      reviewerId,
      decision,
      feedback,
      checklist,
      createdAt: new Date().toISOString(),
    };
    const now = new Date().toISOString();
    set((state) => ({
      courses: state.courses.map((item) =>
        item.id === courseId
          ? { ...item, status, updatedAt: now }
          : item,
      ),
      reviews: [review, ...state.reviews],
    }));
    return true;
  },

  addSection: (courseId, input) => {
    const course = get().courses.find((item) => item.id === courseId);
    if (!course || course.status === "ARCHIVED") {
      throw new Error("Cannot add a section to an unavailable course.");
    }
    const sections = get()
      .sections.filter((section) => section.courseId === courseId)
      .sort((a, b) => a.position - b.position);
    const now = new Date().toISOString();
    const section: CourseSection = {
      ...input,
      id: createLearningId("section"),
      courseId,
      position: sections.length + 1,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      sections: [...state.sections, section],
      courses: markCourseCurriculumChanged(state.courses, courseId, now),
    }));
    return section;
  },

  updateSection: (id, input) => {
    const current = get().sections.find((section) => section.id === id);
    const course = current
      ? get().courses.find((item) => item.id === current.courseId)
      : undefined;
    if (!current || !course || course.status === "ARCHIVED") return null;
    if (
      current.title === input.title &&
      current.description === input.description
    ) {
      return current;
    }
    const now = new Date().toISOString();
    const updated = { ...current, ...input, updatedAt: now };
    set((state) => ({
      courses: markCourseCurriculumChanged(
        state.courses,
        current.courseId,
        now,
      ),
      sections: state.sections.map((section) =>
        section.id === id ? updated : section,
      ),
    }));
    return updated;
  },

  deleteSection: (id) => {
    if (
      !get().sections.some((section) => section.id === id) ||
      get().lessons.some((lesson) => lesson.sectionId === id)
    ) {
      return false;
    }
    const section = get().sections.find((item) => item.id === id);
    if (!section) return false;
    const course = get().courses.find((item) => item.id === section.courseId);
    if (!course || course.status === "ARCHIVED") return false;
    const now = new Date().toISOString();
    const remaining = get()
      .sections.filter(
        (item) => item.courseId === section.courseId && item.id !== id,
      )
      .sort((a, b) => a.position - b.position);
    const positions = new Map(remaining.map((item, index) => [item.id, index + 1]));
    set((state) => ({
      courses: markCourseCurriculumChanged(state.courses, section.courseId, now),
      sections: state.sections
        .filter((item) => item.id !== id)
        .map((item) =>
          positions.has(item.id)
            ? { ...item, position: positions.get(item.id) ?? item.position }
            : item,
        ),
    }));
    return true;
  },

  moveSection: (id, offset) => {
    const current = get().sections.find((section) => section.id === id);
    if (!current) return false;
    const course = get().courses.find((item) => item.id === current.courseId);
    if (!course || course.status === "ARCHIVED") return false;
    const ordered = get()
      .sections.filter((section) => section.courseId === current.courseId)
      .sort((a, b) => a.position - b.position);
    const from = ordered.findIndex((section) => section.id === id);
    const to = from + offset;
    if (to < 0 || to >= ordered.length) return false;
    [ordered[from], ordered[to]] = [ordered[to], ordered[from]];
    const positionById = new Map(
      ordered.map((section, index) => [section.id, index + 1]),
    );
    const now = new Date().toISOString();
    set((state) => ({
      courses: markCourseCurriculumChanged(state.courses, current.courseId, now),
      sections: state.sections.map((section) =>
        positionById.has(section.id)
          ? {
              ...section,
              position: positionById.get(section.id) ?? section.position,
              updatedAt: now,
            }
          : section,
      ),
    }));
    return true;
  },

  addLesson: (sectionId, input) => {
    const section = get().sections.find((item) => item.id === sectionId);
    const course = section
      ? get().courses.find((item) => item.id === section.courseId)
      : undefined;
    if (!section || !course || course.status === "ARCHIVED") {
      throw new Error("Cannot add a lesson to an unavailable course section.");
    }
    const lessons = get()
      .lessons.filter((lesson) => lesson.sectionId === sectionId)
      .sort((a, b) => a.position - b.position);
    const now = new Date().toISOString();
    const lesson: CourseLesson = {
      ...input,
      id: createLearningId("lesson"),
      sectionId,
      position: lessons.length + 1,
      resources: input.resources.map((resource) => ({
        ...resource,
        id: createLearningId("resource"),
      })),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      courses: markCourseCurriculumChanged(state.courses, course.id, now),
      lessons: [...state.lessons, lesson],
    }));
    return lesson;
  },

  updateLesson: (id, input) => {
    const current = get().lessons.find((lesson) => lesson.id === id);
    const section = current
      ? get().sections.find((item) => item.id === current.sectionId)
      : undefined;
    const course = section
      ? get().courses.find((item) => item.id === section.courseId)
      : undefined;
    if (!current || !section || !course || course.status === "ARCHIVED") {
      return null;
    }
    const currentInput: LessonInput = {
      title: current.title,
      description: current.description,
      type: current.type,
      durationSeconds: current.durationSeconds,
      isPreview: current.isPreview,
      content: current.content,
      mediaUrl: current.mediaUrl,
      resources: current.resources.map(({ title, type, url }) => ({
        title,
        type,
        url,
      })),
    };
    if (JSON.stringify(currentInput) === JSON.stringify(input)) return current;
    const resources = input.resources.map((resource, index) => ({
      ...resource,
      id: current.resources[index]?.id ?? createLearningId("resource"),
    }));
    const updated = {
      ...current,
      ...input,
      resources,
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      courses: markCourseCurriculumChanged(
        state.courses,
        course.id,
        updated.updatedAt,
      ),
      lessons: state.lessons.map((lesson) =>
        lesson.id === id ? updated : lesson,
      ),
    }));
    return updated;
  },

  deleteLesson: (id) => {
    const current = get().lessons.find((lesson) => lesson.id === id);
    if (!current) return false;
    const section = get().sections.find(
      (item) => item.id === current.sectionId,
    );
    const course = section
      ? get().courses.find((item) => item.id === section.courseId)
      : undefined;
    if (!section || !course || course.status === "ARCHIVED") return false;
    const remaining = get()
      .lessons.filter(
        (lesson) =>
          lesson.sectionId === current.sectionId && lesson.id !== id,
      )
      .sort((a, b) => a.position - b.position);
    const positions = new Map(remaining.map((item, index) => [item.id, index + 1]));
    const now = new Date().toISOString();
    set((state) => ({
      courses: markCourseCurriculumChanged(state.courses, course.id, now),
      lessons: state.lessons
        .filter((lesson) => lesson.id !== id)
        .map((lesson) =>
          positions.has(lesson.id)
            ? { ...lesson, position: positions.get(lesson.id) ?? lesson.position }
            : lesson,
        ),
    }));
    return true;
  },

  moveLesson: (id, offset) => {
    const current = get().lessons.find((lesson) => lesson.id === id);
    if (!current) return false;
    const section = get().sections.find(
      (item) => item.id === current.sectionId,
    );
    const course = section
      ? get().courses.find((item) => item.id === section.courseId)
      : undefined;
    if (!section || !course || course.status === "ARCHIVED") return false;
    const ordered = get()
      .lessons.filter((lesson) => lesson.sectionId === current.sectionId)
      .sort((a, b) => a.position - b.position);
    const from = ordered.findIndex((lesson) => lesson.id === id);
    const to = from + offset;
    if (to < 0 || to >= ordered.length) return false;
    [ordered[from], ordered[to]] = [ordered[to], ordered[from]];
    const positionById = new Map(
      ordered.map((lesson, index) => [lesson.id, index + 1]),
    );
    const now = new Date().toISOString();
    set((state) => ({
      courses: markCourseCurriculumChanged(state.courses, course.id, now),
      lessons: state.lessons.map((lesson) =>
        positionById.has(lesson.id)
          ? {
              ...lesson,
              position: positionById.get(lesson.id) ?? lesson.position,
              updatedAt: now,
            }
          : lesson,
      ),
    }));
    return true;
  },
}));
