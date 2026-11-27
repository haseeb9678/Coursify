"use client";

import FeaturedCoursesSection from "@/components/layouts/marketing/FeaturedCoursesSection";
import { Button } from "@/components/ui/button";
import CategoriesSection from "@/components/layouts/marketing/CategoriesSection";
import {
  useFeaturedPublicCourses,
  usePublicCategories,
} from "@/features/courses/hooks/use-public-courses";

function SectionError({
  error,
  retrying,
  onRetry,
}: {
  error: string;
  retrying: boolean;
  onRetry: () => void;
}) {
  return (
    <div role="alert" className="flex min-h-40 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-5 text-center text-sm text-destructive">
      <div className="space-y-3">
        <p>{error}</p>
        <Button variant="outline" busy={retrying} onClick={onRetry}>Try again</Button>
      </div>
    </div>
  );
}

export default function HomeLearningSections() {
  const featuredQuery = useFeaturedPublicCourses(6);
  const categoriesQuery = usePublicCategories({ page: 1, limit: 100 });

  return (
    <>
      {featuredQuery.isError && !featuredQuery.data ? (
        <SectionError
          error="Featured courses could not be loaded."
          retrying={featuredQuery.isFetching}
          onRetry={() => void featuredQuery.refetch()}
        />
      ) : (
        <FeaturedCoursesSection
          courses={featuredQuery.data ?? []}
          isLoading={featuredQuery.isPending}
        />
      )}
      {categoriesQuery.isError && !categoriesQuery.data ? (
        <SectionError
          error="Course categories could not be loaded."
          retrying={categoriesQuery.isFetching}
          onRetry={() => void categoriesQuery.refetch()}
        />
      ) : (
        <CategoriesSection
          categories={categoriesQuery.data?.items ?? []}
          isLoading={categoriesQuery.isPending}
        />
      )}
    </>
  );
}
