import type { PaginationMeta } from "@/features/admin/types/management.types";

export type CategoryStatus = "ACTIVE" | "INACTIVE";

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: CategoryStatus;
  iconKey: string;
  imageDataUrl: string | null;
  iconColor?: string;
  iconBackground?: string;
  courseCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type CourseStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED"
  | "ARCHIVED";

export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type CoursePricingType = "FREE" | "PAID";

export interface CoursePricing {
  type: CoursePricingType;
  currency: string;
  priceMinorUnits: number;
  discountedPriceMinorUnits: number | null;
}

export interface AdminCourse {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  instructorId: string;
  instructorName?: string;
  level: CourseLevel;
  language: string;
  thumbnailDataUrl: string | null;
  promotionalVideoUrl: string;
  pricing: CoursePricing;
  learningOutcomes: string[];
  requirements: string[];
  targetAudience: string[];
  status: CourseStatus;
  enrollmentCount?: number;
  averageRating?: number | null;
  isFeatured?: boolean;
  canDelete?: boolean;
  sectionCount?: number;
  lessonCount?: number;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
}

export type AdminCourseInput = Omit<
  AdminCourse,
  | "id"
  | "status"
  | "enrollmentCount"
  | "averageRating"
  | "createdAt"
  | "updatedAt"
  | "submittedAt"
>;

export type LessonType = "VIDEO" | "TEXT" | "PDF";
export type LessonResourceType = "LINK" | "PDF";

export interface LessonResource {
  id: string;
  title: string;
  type: LessonResourceType;
  url: string;
}

export interface CourseSection {
  id: string;
  courseId: string;
  title: string;
  description: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseLesson {
  id: string;
  sectionId: string;
  title: string;
  description: string;
  type: LessonType;
  durationSeconds: number | null;
  position: number;
  isPreview: boolean;
  content: string;
  mediaUrl: string;
  resources: LessonResource[];
  createdAt: string;
  updatedAt: string;
}

export type CourseReviewDecision =
  | "APPROVED"
  | "REJECTED"
  | "CHANGES_REQUESTED";

export interface CourseReview {
  id: string;
  courseId: string;
  reviewerId: string;
  decision: CourseReviewDecision;
  feedback: string;
  checklist: string[];
  createdAt: string;
}

export interface CategoryFilters {
  search: string;
  status: CategoryStatus | "ALL";
}

export interface CourseFilters {
  search: string;
  categoryId: string;
  instructorId: string;
  status: CourseStatus | "ALL";
  level: CourseLevel | "ALL";
  language: string;
  pricing: CoursePricingType | "ALL";
}

export interface CourseApprovalFilters {
  search: string;
  categoryId: string;
  status: CourseStatus | "ALL";
  submittedWithin: "ALL" | "30_DAYS" | "12_MONTHS";
}

export interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
  categorizedCourses: number;
}

export interface CourseStats {
  total: number;
  published: number;
  drafts: number;
  pendingReview: number;
  archived: number;
}

export interface CurriculumStats {
  sectionCount: number;
  lessonCount: number;
  videoLessonCount: number;
  totalDurationSeconds: number;
  previewLessonCount: number;
}

export interface CourseApprovalStats {
  pendingReviews: number;
  approvedCourses: number;
  rejectedCourses: number;
  reviewedThisMonth: number;
}

export interface PaginatedLearningResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface CategoryInput {
  name: string;
  slug: string;
  description: string;
  status: CategoryStatus;
  iconKey: string;
  imageDataUrl: string | null;
}

export interface CourseFormInput {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  instructorId: string;
  level: CourseLevel;
  language: string;
  thumbnailDataUrl: string | null;
  promotionalVideoUrl: string;
  isFree: boolean;
  regularPrice: string;
  discountedPrice: string;
  learningOutcomes: string[];
  requirements: string[];
  targetAudience: string[];
}

export interface SectionInput {
  title: string;
  description: string;
}

export interface LessonInput {
  title: string;
  description: string;
  type: LessonType;
  durationSeconds: number | null;
  isPreview: boolean;
  content: string;
  mediaUrl: string;
  resources: Omit<LessonResource, "id">[];
}

export interface LearningQueryState {
  page: number;
  limit: number;
  search: string;
  sort: {
    field: string;
    direction: "asc" | "desc";
  } | null;
}
