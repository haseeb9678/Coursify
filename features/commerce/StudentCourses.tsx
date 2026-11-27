"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import AdminFilterSelect from "@/components/layouts/admin/shared/AdminFilterSelect";
import AdminPageHeader from "@/components/layouts/admin/shared/AdminPageHeader";
import AdminTablePagination from "@/components/layouts/admin/shared/AdminTablePagination";
import AdminTableToolbar from "@/components/layouts/admin/shared/AdminTableToolbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useDebouncedValue } from "@/features/admin/hooks/use-debounced-value";
import { formatLearningDuration } from "@/features/admin/utils/learning.utils";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";
import { commerceApi } from "./commerce.api";
import { commerceKeys } from "./commerce-cache";
import { commerceDate, statusLabel } from "./commerce-format";
import { enrollmentStatuses, type Enrollment } from "./commerce.types";
import { CommerceLink, CommerceLoading, CommerceMessage, CommerceStatus } from "./CommerceUi";
import StudentCommerceStats from "./StudentCommerceStats";
import { useStudentCommerceStats, useStudentId } from "./student-queries";

export default function StudentCourses() {
  const userId = useStudentId();
  return userId ? <Courses key={userId} userId={userId} /> : <div className="p-6"><CommerceLoading /></div>;
}

function Courses({ userId }: { userId: string }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const debouncedSearch = useDebouncedValue(search.trim());
  const stats = useStudentCommerceStats(userId);
  const filter = {
    search: debouncedSearch || undefined,
    status: status === "all" ? undefined : status,
    categoryId: category === "all" ? undefined : category,
  };
  const pagination = { page, limit };
  const results = useQuery({
    queryKey: [...commerceKeys.scope("student", userId), "courses", pagination, filter],
    queryFn: () => commerceApi.enrollments(false, pagination, filter),
    placeholderData: keepPreviousData,
    retry: false,
  });
  const filtered = !!search.trim() || status !== "all" || category !== "all";

  return (
    <main className="mx-auto w-full max-w-450 space-y-5 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader title="My Courses" description="Manage your enrolled courses and continue your learning journey."
        actions={<CommerceLink href="/courses" primary>Explore Courses</CommerceLink>} />
      <StudentCommerceStats kind="courses" query={stats} />
      <AdminTableToolbar search={search} searchLabel="Search enrolled courses" searchPlaceholder="Search course titles"
        onSearchChange={(value) => { setSearch(value); setPage(1); }}
        onClear={() => { setSearch(""); setStatus("all"); setCategory("all"); setPage(1); }}
        filtersActive={filtered}
        filters={<>
          <AdminFilterSelect label="Enrollment status" value={status}
            options={[{ label: "All courses", value: "all" }, ...enrollmentStatuses.map((value) => ({ label: statusLabel(value), value }))]}
            onChange={(value) => { setStatus(value); setPage(1); }} />
          {!!stats.data?.categories.length && <AdminFilterSelect label="Course category" value={category}
            options={[{ label: "All categories", value: "all" }, ...stats.data.categories.map(({ id, name }) => ({ label: name, value: id }))]}
            onChange={(value) => { setCategory(value); setPage(1); }} />}
        </>} />

      {results.isPending ? <CourseCardsSkeleton /> : results.isError ? (
        <CommerceMessage title="Unable to load your courses" message={getGraphQLErrorMessage(results.error)}
          actions={<Button variant="outline" busy={results.isFetching} onClick={() => void results.refetch()}>Try again</Button>} />
      ) : !results.data?.items.length ? (
        <section className="flex flex-col items-center gap-3 rounded-xl border border-brand-border bg-card px-4 py-12 text-center">
          <BookOpen className="size-8 text-brand-primary" aria-hidden />
          <h2 className="font-semibold text-brand-text">{filtered ? "No matching courses" : "No courses enrolled yet"}</h2>
          <p className="text-sm text-brand-text-muted">
            {filtered ? "Try another search or clear the filters." : "Explore the catalog to find your first course."}
          </p>
          <CommerceLink href="/courses">Explore Courses</CommerceLink>
        </section>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy={results.isFetching}>
          {results.data.items.map((item) => <StudentCourseCard key={item.id} item={item} />)}
        </div>
      )}
      {results.data && !results.isError && (
        <section className="overflow-hidden rounded-xl border border-brand-border bg-card">
          <AdminTablePagination meta={results.data.meta}
            isDisabled={results.isFetching}
            onPageChange={setPage}
            onPageSizeChange={(value) => { setLimit(value); setPage(1); }} />
        </section>
      )}
    </main>
  );
}

function CourseCardsSkeleton() {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading enrolled courses">
    {[0, 1, 2].map((index) => <div key={index} className="overflow-hidden rounded-xl border border-brand-border bg-card">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-3 p-4"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-2/3" /><Skeleton className="h-9 w-28" /></div>
    </div>)}
  </div>;
}

function StudentCourseCard({ item }: { item: Enrollment }) {
  const course = item.course;
  const enrolled = item.status === "ACTIVE" || item.status === "COMPLETED";
  const available = course.status === "PUBLISHED" || course.status === "ARCHIVED";
  const metadata = [
    ...(course.sectionCount != null ? [`${course.sectionCount} sections`] : []),
    ...(course.lessonCount != null ? [`${course.lessonCount} lessons`] : []),
    ...(course.durationSeconds ? [formatLearningDuration(course.durationSeconds)] : []),
  ];
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-brand-border bg-card transition-colors hover:border-primary/30">
      <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-brand-soft">
        {course.thumbnailUrl ? <Image src={course.thumbnailUrl} alt="" fill unoptimized
          sizes="(min-width: 1280px) 28vw, (min-width: 640px) 45vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none" />
          : <BookOpen className="size-9 text-brand-primary" aria-hidden />}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">{course.category.name}</Badge>
          {course.level && <Badge variant="outline">{statusLabel(course.level)}</Badge>}
        </div>
        <div className="space-y-1">
          <h2 className="line-clamp-2 break-words font-semibold text-brand-text" title={course.title}>{course.title}</h2>
          <p className="text-sm text-brand-text-muted">{course.instructor.name}</p>
        </div>
        <div className="mt-auto space-y-1 text-xs text-brand-text-muted">
          {!!metadata.length && <p>{metadata.join(" ? ")}</p>}
          <p>{statusLabel(item.source)} enrollment ? {commerceDate(item.enrolledAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-brand-border pt-3">
          <CommerceStatus value={item.status} />
          {enrolled && (available
            ? <CommerceLink href={`/student/learning/${course.id}`} primary>{item.status === "COMPLETED" ? "Review course" : "Go to course"}</CommerceLink>
            : <span className="text-xs text-brand-text-muted">Course content temporarily unavailable</span>)}
        </div>
      </div>
    </article>
  );
}
