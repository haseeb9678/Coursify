
"use client";

import { SlidersHorizontal, Star, RotateCcw } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import FilterGroup from "./FilterGroup";

import { filterGroups } from "@/features/courses/data/catalog-filters.data";
import type {
  Filters,
  FilterKey,
} from "@/features/courses/types/catalog.types";

interface CourseFiltersProps {
  filters: Filters;
  onUpdateFilter: (
    key: FilterKey,
    value: string,
    checked: boolean
  ) => void;
  onRatingChange: (rating: number) => void;
  onCertificateChange: (checked: boolean) => void;
  onReset: () => void;
}

export default function CourseFilters({
  filters,
  onUpdateFilter,
  onRatingChange,
  onCertificateChange,
  onReset,
}: CourseFiltersProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
          <SlidersHorizontal className="h-4 w-4 text-blue-600" />
          Filter Courses
        </div>

        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-800"
        >
          Reset All
        </button>
      </div>

      {/* Filter Groups */}
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

      {/* Rating */}
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-900">
          Minimum Rating
        </p>

        {[4.5, 4.0, 3.5].map((rating) => (
          <label
            key={rating}
            className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-600"
          >
            <input
              type="radio"
              name="course-rating"
              checked={filters.rating === rating}
              onChange={() => onRatingChange(rating)}
              className="h-4 w-4 accent-blue-600"
            />

            <span className="flex items-center gap-1 text-amber-400">
              <Star className="h-3.5 w-3.5 fill-current" />

              <span className="font-semibold text-gray-700">
                {rating.toFixed(1)} & up
              </span>
            </span>
          </label>
        ))}
      </div>

      <Separator />

      {/* Certificate */}
      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-600">
        <Checkbox
          checked={filters.certificate}
          onCheckedChange={(checked) =>
            onCertificateChange(checked === true)
          }
        />

        Certificate Included
      </label>

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
