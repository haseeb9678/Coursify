import type { CourseLevel, CoursePricing, LessonType } from "@/features/admin/types/learning.types";
import type { PaginationMeta } from "@/features/admin/types/management.types";

export interface PublicCourse {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnailUrl: string | null;
  promotionalVideoUrl: string | null;
  category: { id: string; name: string; slug: string };
  instructor: { id: string; name: string; avatar: string | null };
  level: CourseLevel;
  language: string;
  pricing: CoursePricing;
  learningOutcomes: string[];
  requirements: string[];
  targetAudience: string[];
}

export interface PublicCourseDetail extends PublicCourse {
  updatedAt: string;
  curriculum: {
    title: string;
    lessons: {
      title: string;
      type: LessonType;
      durationSeconds: number | null;
      isPreview: boolean;
      previewLessonId?: string | null;
      resourceCount: number;
    }[];
  }[] | null;
}

export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  iconBackground: string;
  iconColor: string;
  imageUrl: string | null;
  courseCount: number;
}

export interface PublicPage<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface PublicCourseFilter {
  search?: string;
  categoryId?: string;
  level?: CourseLevel;
  pricingType?: "FREE" | "PAID";
  language?: string;
}

export interface PublicPagination {
  page: number;
  limit: number;
}
