import type { PaginationMeta } from "@/features/admin/types/management.types";
import type {
  AdminCategory,
  AdminCourse,
  CourseStatus,
} from "@/features/admin/types/learning.types";

export interface MutationResponse {
  success: boolean;
  message: string;
}

export interface LearningPage<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface AdminCategoryRecord extends AdminCategory {
  iconColor: string;
  iconBackground: string;
  courseCount: number;
}

export interface BackendAdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  iconColor: string;
  iconBackground: string;
  imageUrl: string | null;
  status: "ACTIVE" | "INACTIVE";
  courseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BackendCourse {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnailUrl: string | null;
  promotionalVideoUrl: string | null;
  category: { id: string; name: string; slug: string };
  instructor: { id: string; name: string; avatar: string | null };
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  language: string;
  pricing: {
    type: "FREE" | "PAID";
    currency: string;
    priceMinorUnits: number;
    discountedPriceMinorUnits: number | null;
  };
  learningOutcomes: string[];
  requirements: string[];
  targetAudience: string[];
  status: CourseStatus;
  isFeatured?: boolean;
  canDelete?: boolean | null;
  sectionCount?: number;
  lessonCount?: number;
  submittedAt: string | null;
  approvedAt?: string | null;
  publishedAt?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CourseStats {
  totalCourses: number;
  draftCourses: number;
  pendingReviewCourses: number;
  approvedCourses: number;
  rejectedCourses: number;
  publishedCourses: number;
  archivedCourses: number;
  freeCourses: number;
  paidCourses: number;
}

export interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  categorizedCourses: number;
}

export interface InstructorOption {
  id: string;
  name: string;
  avatar: string | null;
}

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export interface PaginationInput {
  page: number;
  limit: number;
}

export interface AdminCoursesFilter {
  search?: string;
  categoryId?: string;
  instructorId?: string;
  status?: CourseStatus;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  language?: string;
  pricingType?: "FREE" | "PAID";
}

export interface AdminCategoriesFilter {
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export interface AdminCategoryInput {
  name: string;
  slug: string;
  description: string;
  iconName: string;
  iconColor: string;
  iconBackground: string;
  imageUrl: string | null;
  status: "ACTIVE" | "INACTIVE";
}

export type AdminCategoryUpdateInput = { id: string } & Partial<AdminCategoryInput>;

export interface AdminCourseInput {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  instructorId: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  language: string;
  pricingType: "FREE" | "PAID";
  priceMinorUnits: number;
  discountedPriceMinorUnits: number | null;
  currency: string;
  thumbnailUrl: string | null;
  promotionalVideoUrl: string | null;
  learningOutcomes: string[];
  requirements: string[];
  targetAudience: string[];
}

export interface LessonResourceRecord {
  id: string;
  title: string;
  type: "LINK" | "PDF" | "DOCUMENT" | "FILE";
  mediaAssetId?: string | null;
  url: string;
  fileName: string | null;
  fileSize: number | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface LessonRecord {
  id: string;
  sectionId: string;
  title: string;
  description: string;
  type: "VIDEO" | "TEXT" | "PDF";
  content: string;
  videoUrl: string | null;
  documentUrl: string | null;
  videoAssetId?: string | null;
  documentAssetId?: string | null;
  videoQualities?: import("./learning.types").LessonVideoQuality[] | null;
  durationSeconds: number | null;
  position: number;
  isPreview: boolean;
  resources: LessonResourceRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface SectionRecord {
  id: string;
  courseId: string;
  title: string;
  description: string;
  position: number;
  lessons: LessonRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface CurriculumRecord {
  courseId: string;
  sections: SectionRecord[];
}

export interface CourseReviewRecord {
  id: string;
  courseId: string;
  reviewer: { id: string; name: string };
  decision: "APPROVED" | "REJECTED";
  feedback: string;
  previousStatus: CourseStatus;
  newStatus: CourseStatus;
  createdAt: string;
}

export interface ApprovalStats {
  pendingReviews: number;
  approvedCourses: number;
  rejectedCourses: number;
  reviewedThisMonth: number;
}

export interface ApprovalDetails {
  course: BackendCourse;
  readinessErrors: string[];
  recentReviews: CourseReviewRecord[];
}

export type AdminCourseRecord = AdminCourse & {
  categoryName: string;
  instructorName: string;
  isFeatured: boolean;
  sectionCount: number;
  lessonCount: number;
};
