
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowDownWideNarrow,
  SlidersHorizontal,
  X,
  Check,
  ArrowUpDown,
  Filter,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import CustomSelect from "@/components/shared/CustomSelect";

import CourseFilters from "./CourseFilters";

import type { CustomSelectOption } from "@/components/shared/CustomSelect";

import type {
  Filters,
  FilterKey,
} from "@/features/courses/types/catalog.types";

interface CourseToolbarProps {
  filters: Filters;
  activeFilters: string[];
  activeFilterCount: number;
  sort: string;
  totalCourses: number;
  onSortChange: (value: string | null) => void;
  onUpdateFilter: (key: FilterKey, value: string, checked: boolean) => void;
  onRatingChange: (rating: number) => void;
  onCertificateChange: (checked: boolean) => void;
  onReset: () => void;
  onRemoveFilter: (value: string) => void;
}

const sortOptions: CustomSelectOption[] = [
  {
    label: "Most Popular",
    value: "popular",
    icon: ArrowDownWideNarrow,
  },
  {
    label: "Highest Rated",
    value: "rating",
    icon: Check,
  },
  {
    label: "Newest First",
    value: "newest",
    icon: ArrowUpDown,
  },
];

export default function CourseToolbar({
  filters,
  activeFilters,
  activeFilterCount,
  sort,
  totalCourses,
  onSortChange,
  onUpdateFilter,
  onRatingChange,
  onCertificateChange,
  onReset,
  onRemoveFilter,
}: CourseToolbarProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filterProps = {
    filters,
    onUpdateFilter,
    onRatingChange,
    onCertificateChange,
    onReset,
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">

        {/* Filter Controls */}
        <div className="flex min-w-0 flex-wrap items-center gap-2.5">

          {/* Mobile Filters */}
          <Sheet
            open={mobileFiltersOpen}
            onOpenChange={setMobileFiltersOpen}
          >
           <SheetTrigger
  render={
    <Button
      variant="outline"
      className="h-10 gap-2 rounded-xl border-border bg-background px-3 text-xs font-semibold shadow-none transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary lg:hidden"
    >
      <SlidersHorizontal className="h-4 w-4" />
      Filters

      {activeFilterCount > 0 && (
        <Badge className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
          {activeFilterCount}
        </Badge>
      )}
    </Button>
  }
/>

            <SheetContent
              side="left"
              className="flex w-[320px] flex-col overflow-hidden border-r border-border bg-background p-0 sm:max-w-[380px]"
            >
              <SheetHeader className="border-b border-border px-5 py-5 text-left">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Filter className="h-5 w-5" />
                </div>

                <SheetTitle className="text-lg font-bold">
                  Course Filters
                </SheetTitle>

                <SheetDescription className="text-xs leading-relaxed">
                  Refine your search and discover courses that match your goals.
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-5">
                <CourseFilters {...filterProps} />
              </div>

              <div className="border-t border-border bg-card p-4">
                <Button
                  
                  className="h-11 w-full rounded-xl font-semibold shadow-sm"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  Show {totalCourses} Courses
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Active Filters Label */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
            </div>

            <span className="text-xs font-bold text-foreground">
              Filters
            </span>

            {activeFilterCount > 0 && (
              <span className="text-[11px] font-medium text-muted-foreground">
                ({activeFilterCount} active)
              </span>
            )}
          </div>

          <div className="hidden h-6 w-px bg-border sm:block" />

          {/* Active Filter Badges */}
          {activeFilters.length === 0 ? (
            <span className="text-xs text-muted-foreground">
              No filters applied
            </span>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <AnimatePresence mode="popLayout">
                {activeFilters.map((filter) => (
                  <motion.div
                    key={filter}
                    layout
                    initial={{ opacity: 0, scale: 0.85, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: 4 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Badge
                      variant="secondary"
                      className="group gap-1.5 rounded-lg border border-primary/15 bg-primary/5 py-1.5 pl-2.5 pr-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/10"
                    >
                      {filter}

                      <button
                        type="button"
                        onClick={() => onRemoveFilter(filter)}
                        aria-label={`Remove ${filter} filter`}
                        className="rounded-md p-0.5 transition-colors hover:bg-primary/15"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Clear All */}
          {activeFilters.length > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="ml-1 text-[11px] font-bold text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Sorting */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border/70 pt-3 sm:justify-start sm:border-0 sm:pt-0">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ArrowUpDown className="h-4 w-4" />

            <span className="text-xs font-semibold">
              Sort by
            </span>
          </div>

          <CustomSelect
            value={sort}
            onValueChange={onSortChange}
            options={sortOptions}
            placeholder="Sort courses"
            ariaLabel="Sort courses"
            width="w-[180px]"
          />
        </div>
      </div>
    </div>
  );
}
