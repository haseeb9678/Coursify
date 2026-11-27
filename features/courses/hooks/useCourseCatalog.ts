"use client";

import { useMemo, useState } from "react";

import { PAGE_SIZE, initialFilters } from "@/features/courses/types/catalog.types";
import type {
  CatalogCourse,
  FilterKey,
  Filters,
} from "@/features/courses/types/catalog.types";
import type { CourseLevel } from "@/features/admin/types/learning.types";
import {
  usePublicCategories,
  usePublicCourses,
} from "@/features/courses/hooks/use-public-courses";

const levelLabels: Record<CourseLevel, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const priceLabels: Record<"FREE" | "PAID", string> = {
  FREE: "Free courses",
  PAID: "Paid courses",
};

function toCatalogCourse(course: {
  id: string;
  title: string;
  shortDescription: string;
  instructor: { name: string };
  category: { name: string };
  thumbnailUrl: string | null;
  level: CourseLevel;
  pricing: {
    type: "FREE" | "PAID";
    currency: string;
    priceMinorUnits: number;
    discountedPriceMinorUnits: number | null;
  };
}): CatalogCourse {
  const originalPrice = course.pricing.priceMinorUnits / 100;
  const price =
    (course.pricing.discountedPriceMinorUnits ??
      course.pricing.priceMinorUnits) / 100;

  return {
    id: course.id,
    title: course.title,
    shortDescription: course.shortDescription,
    instructor: course.instructor.name,
    category: course.category.name,
    image: course.thumbnailUrl,
    level: course.level,
    currency: course.pricing.currency,
    price,
    originalPrice,
  };
}

export default function useCourseCatalog() {
  const [search, setSearchState] = useState("");
  const [sort, setSort] = useState("recommended");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>(initialFilters);

  const categoriesQuery = usePublicCategories({ page: 1, limit: 100 });
  const categories = useMemo(
    () => categoriesQuery.data?.items ?? [],
    [categoriesQuery.data],
  );
  const selectedCategory = filters.categories[0];
  const selectedLevel = filters.levels[0];
  const selectedPrice = filters.prices[0];

  const coursesQuery = usePublicCourses(
    { page, limit: PAGE_SIZE },
    {
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(selectedCategory ? { categoryId: selectedCategory } : {}),
      ...(selectedLevel ? { level: selectedLevel } : {}),
      ...(selectedPrice ? { pricingType: selectedPrice } : {}),
    },
  );

  const courses = useMemo(
    () => (coursesQuery.data?.items ?? []).map(toCatalogCourse),
    [coursesQuery.data],
  );

  const activeFilters = useMemo(() => {
    const active: string[] = [];
    for (const categoryId of filters.categories) {
      const category = categories.find((item) => item.id === categoryId);
      if (category) active.push(category.name);
    }
    active.push(...filters.levels.map((level) => levelLabels[level]));
    active.push(...filters.prices.map((price) => priceLabels[price]));
    return active;
  }, [categories, filters]);

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        label: category.name,
        value: category.id,
        count: category.courseCount,
      })),
    [categories],
  );

  const updateFilter = (key: FilterKey, value: string, checked: boolean) => {
    setPage(1);
    setFilters((current) => {
      const values = current[key] as string[];
      const nextValues = checked
        ? [value]
        : values.filter((item) => item !== value);
      return { ...current, [key]: nextValues };
    });
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearchState("");
    setPage(1);
  };

  const removeFilter = (label: string) => {
    const category = categories.find((item) => item.name === label);
    if (category) {
      updateFilter("categories", category.id, false);
      return;
    }
    const level = (Object.keys(levelLabels) as CourseLevel[]).find(
      (key) => levelLabels[key] === label,
    );
    if (level) {
      updateFilter("levels", level, false);
      return;
    }
    const price = (Object.keys(priceLabels) as ("FREE" | "PAID")[]).find(
      (key) => priceLabels[key] === label,
    );
    if (price) updateFilter("prices", price, false);
  };

  return {
    search,
    setSearch: (value: string) => {
      setSearchState(value);
      setPage(1);
    },
    sort,
    setSort,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    filters,
    categoryOptions,
    updateFilter,
    resetFilters,
    removeFilter,
    activeFilters,
    activeFilterCount: activeFilters.length,
    paginatedCourses: courses,
    totalCourses: coursesQuery.data?.meta.total ?? 0,
    totalPages: coursesQuery.data?.meta.totalPages ?? 0,
    isLoading: coursesQuery.isLoading || categoriesQuery.isLoading,
    isError: coursesQuery.isError || categoriesQuery.isError,
    error: coursesQuery.error ?? categoriesQuery.error,
    retry: () => {
      void coursesQuery.refetch();
      void categoriesQuery.refetch();
    },
  };
}
