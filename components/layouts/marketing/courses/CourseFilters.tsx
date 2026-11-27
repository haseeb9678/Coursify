
"use client";

import { SlidersHorizontal, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import FilterGroup from "./FilterGroup";

import { filterGroups } from "@/features/courses/data/catalog-filters.data";
import type {
  Filters,
  FilterOption,
  FilterKey,
} from "@/features/courses/types/catalog.types";

interface CourseFiltersProps {
  filters: Filters;
  categoryOptions: FilterOption[];
  onUpdateFilter: (
    key: FilterKey,
    value: string,
    checked: boolean
  ) => void;
  onReset: () => void;
}

export default function CourseFilters({
  filters,
  categoryOptions,
  onUpdateFilter,
  onReset,
}: CourseFiltersProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-border pb-4">
        <div className="flex items-center gap-2 text-sm font-bold text-brand-text">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Filter Courses
        </div>

        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-primary transition-colors hover:text-brand-primary-hover"
        >
          Reset All
        </button>
      </div>

      {/* Filter Groups */}
      <div>
        <FilterGroup
          title="Category"
          options={categoryOptions}
          selected={filters.categories}
          onChange={(value, checked) => onUpdateFilter("categories", value, checked)}
        />
        <Separator className="mt-5" />
      </div>
      {filterGroups.map((group) => (
        <div key={group.key}>
          <FilterGroup
            title={group.title}
            options={group.options}
            selected={filters[group.key]}
            onChange={(value, checked) =>
              onUpdateFilter(group.key, value, checked)
            }
          />

          <Separator className="mt-5" />
        </div>
      ))}

      {/* Reset */}
      <Button
        variant="outline"
        className="w-full rounded-lg"
        onClick={onReset}
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Clear All Filters
      </Button>
    </div>
  );
}
