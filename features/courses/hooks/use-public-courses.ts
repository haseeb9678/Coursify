"use client";

import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getFeaturedPublicCourses,
  getPublicCategories,
  getPublicCourse,
  getPublicCourses,
  getRelatedPublicCourses,
} from "@/features/courses/api/public-courses.api";
import type {
  PublicCourseFilter,
  PublicPagination,
} from "@/features/courses/types/public-api.types";

export const publicCourseKeys = {
  all: ["public-courses"] as const,
  allCategories: () => [...publicCourseKeys.all, "categories", "all"] as const,
  categories: (page: PublicPagination, search?: string) =>
    [...publicCourseKeys.all, "categories", page, search] as const,
  list: (page: PublicPagination, filter?: PublicCourseFilter) =>
    [...publicCourseKeys.all, "list", page, filter] as const,
  detail: (identifier: string) => [...publicCourseKeys.all, "detail", identifier] as const,
  featured: (limit: number) => [...publicCourseKeys.all, "featured", limit] as const,
  related: (courseId: string, limit: number) =>
    [...publicCourseKeys.all, "related", courseId, limit] as const,
};

function publicCategoriesQuery(pagination: PublicPagination, search?: string) {
  return queryOptions({
    queryKey: publicCourseKeys.categories(pagination, search),
    queryFn: () => getPublicCategories(pagination, search),
  });
}

export function usePublicCategories(
  pagination: PublicPagination = { page: 1, limit: 100 },
  search?: string,
) {
  return useQuery(publicCategoriesQuery(pagination, search));
}

export function useAllPublicCategories() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: publicCourseKeys.allCategories(),
    queryFn: async () => {
      let result = await queryClient.fetchQuery(publicCategoriesQuery({ page: 1, limit: 100 }));
      const categories = new Map(result.items.map((category) => [category.id, category]));

      while (result.meta.hasNext) {
        result = await queryClient.fetchQuery(publicCategoriesQuery({
          page: result.meta.page + 1,
          limit: result.meta.limit,
        }));
        for (const category of result.items) categories.set(category.id, category);
      }

      return [...categories.values()];
    },
  });
}

export function usePublicCourses(
  pagination: PublicPagination,
  filter?: PublicCourseFilter,
) {
  return useQuery({
    queryKey: publicCourseKeys.list(pagination, filter),
    queryFn: () => getPublicCourses(pagination, filter),
  });
}

export function usePublicCourse(identifier: string) {
  return useQuery({
    queryKey: publicCourseKeys.detail(identifier),
    queryFn: () => getPublicCourse(identifier),
    enabled: Boolean(identifier),
  });
}

export function useFeaturedPublicCourses(limit = 6) {
  return useQuery({
    queryKey: publicCourseKeys.featured(limit),
    queryFn: () => getFeaturedPublicCourses(limit),
  });
}

export function useRelatedPublicCourses(courseId: string, limit = 6) {
  return useQuery({
    queryKey: publicCourseKeys.related(courseId, limit),
    queryFn: () => getRelatedPublicCourses(courseId, limit),
    enabled: Boolean(courseId),
  });
}
