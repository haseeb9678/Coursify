import { graphqlClient } from "@/lib/graphql/client";
import {
  PUBLIC_CATEGORIES_QUERY,
  PUBLIC_COURSE_QUERY,
  PUBLIC_COURSES_QUERY,
  PUBLIC_FEATURED_COURSES_QUERY,
  PUBLIC_RELATED_COURSES_QUERY,
} from "@/features/admin/graphql/learning.graphql";
import type {
  PublicCategory,
  PublicCourse,
  PublicCourseDetail,
  PublicCourseFilter,
  PublicPage,
  PublicPagination,
} from "@/features/courses/types/public-api.types";

export async function getPublicCategories(
  pagination: PublicPagination = { page: 1, limit: 100 },
  search?: string,
): Promise<PublicPage<PublicCategory>> {
  const result = await graphqlClient.request<
    { categories: PublicPage<PublicCategory> },
    { pagination: PublicPagination; search?: string }
  >(PUBLIC_CATEGORIES_QUERY, { pagination, search });
  return result.categories;
}

export async function getPublicCourses(
  pagination: PublicPagination,
  filter?: PublicCourseFilter,
): Promise<PublicPage<PublicCourse>> {
  const result = await graphqlClient.request<
    { courses: PublicPage<PublicCourse> },
    { pagination: PublicPagination; filter?: PublicCourseFilter }
  >(PUBLIC_COURSES_QUERY, { pagination, filter });
  return result.courses;
}

export async function getPublicCourse(identifier: string): Promise<PublicCourseDetail> {
  const result = await graphqlClient.request<
    { course: PublicCourseDetail },
    { identifier: string }
  >(PUBLIC_COURSE_QUERY, { identifier });
  return result.course;
}

export async function getFeaturedPublicCourses(limit = 6): Promise<PublicCourse[]> {
  const result = await graphqlClient.request<
    { featuredCourses: PublicCourse[] },
    { limit: number }
  >(PUBLIC_FEATURED_COURSES_QUERY, { limit });
  return result.featuredCourses;
}

export async function getRelatedPublicCourses(
  courseId: string,
  limit = 6,
): Promise<PublicCourse[]> {
  const result = await graphqlClient.request<
    { relatedCourses: PublicCourse[] },
    { courseId: string; limit: number }
  >(PUBLIC_RELATED_COURSES_QUERY, { courseId, limit });
  return result.relatedCourses;
}
