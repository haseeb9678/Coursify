import type { CourseLevel } from "@/features/admin/types/learning.types";

export interface CatalogCourse {
  id: string;
  title: string;
  shortDescription: string;
  instructor: string;
  category: string;
  image: string | null;
  level: CourseLevel;
  currency: string;
  price: number;
  originalPrice: number;
}

export type Filters = {
  categories: string[];
  levels: CourseLevel[];
  prices: ("FREE" | "PAID")[];
};

export type FilterKey = keyof Filters;

export type FilterOption = {
  label: string;
  value?: string;
  count?: number;
};

export type FilterGroupConfig = {
  title: string;
  key: FilterKey;
  options: FilterOption[];
};

export const initialFilters: Filters = {
  categories: [],
  levels: [],
  prices: [],
};

export const PAGE_SIZE = 6;
