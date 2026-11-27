"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Archive,
  BookOpen,
  CircleDollarSign,
  Clock3,
  GraduationCap,
  Pencil,
  PlayCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import CourseLifecycleDialog, { type PendingCourseAction } from "./CourseLifecycleDialog";
import AdminErrorState from "@/components/layouts/admin/shared/AdminErrorState";
import AdminPageHeader from "@/components/layouts/admin/shared/AdminPageHeader";
import AdminStatsGrid from "@/components/layouts/admin/shared/AdminStatsGrid";
import CourseStatusBadge from "@/components/layouts/admin/courses/CourseStatusBadge";
import {
  useAdminApprovalDetails,
  useAdminCourse,
  useAdminCurriculum,
  useAdminCurriculumStats,
  useCourseReviewHistory,
} from "@/features/admin/hooks/use-admin-learning";
import type { CourseReviewRecord } from "@/features/admin/types/learning-api.types";
import {
  canEditCourse,
  getCourseAdminActions,
  getCourseActionCopy,
  formatCoursePrice,
  formatLearningDuration,
} from "@/features/admin/utils/learning.utils";
import { formatManagementDate } from "@/features/admin/utils/management.utils";

export default function CourseDetailsClient({
  courseId,
}: {
  courseId: string;
}) {
  const router = useRouter();
  const courseQuery = useAdminCourse(courseId);
  const curriculumQuery = useAdminCurriculum(courseId);
  const curriculumStatsQuery = useAdminCurriculumStats(courseId);
  const approvalDetailsQuery = useAdminApprovalDetails(courseId);
  const reviewHistoryQuery = useCourseReviewHistory(courseId, { page: 1, limit: 100 });
  const course = courseQuery.data;
  const sections = curriculumQuery.data?.sections ?? [];
  const lessons = sections.flatMap((section) => section.lessons);
  const reviews = reviewHistoryQuery.data?.items ?? [];
  const [pendingAction, setPendingAction] = useState<PendingCourseAction | null>(null);

  const courseSections = sections;
  const courseLessons = lessons;
  if (courseQuery.isLoading) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8" aria-live="polite">
        <p className="text-sm text-brand-text-muted">Loading course details…</p>
      </main>
    );
  }
  if (courseQuery.isError || !course) {
    return (
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8">
        <AdminErrorState
          title="Course not found"
          description={courseQuery.error?.message ?? "The course could not be found."}
        />
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/courses")}
          >
            Back to courses
          </Button>
        </div>
      </main>
    );
  }

  const categoryName = course.categoryName ?? "—";
  const effectivePrice =
    course.pricing.discountedPriceMinorUnits ??
    course.pricing.priceMinorUnits;
  const readinessIssues = approvalDetailsQuery.data?.readinessErrors ?? [];
  const canEdit = canEditCourse(course.status);
  const statusActions = getCourseAdminActions(course);

  return (
    <section className="mx-auto w-full max-w-450 space-y-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <AdminPageHeader
          title={course.title}
          description={`Course details and lifecycle information for /${course.slug}.`}
          actions={
            <>
              {canEdit && (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() =>
                    router.push(`/admin/courses/${course.id}/edit`)
                  }
                >
                  <Pencil size={15} aria-hidden="true" />
                  Edit course
                </Button>
              )}
              <Button
                type="button"
                className="gap-2"
                onClick={() =>
                  router.push(`/admin/courses/${course.id}/curriculum`)
                }
              >
                <BookOpen size={15} aria-hidden="true" />
                {canEdit ? "Manage curriculum" : "View curriculum"}
              </Button>
              {course.status === "PUBLISHED" && (
                <Button variant="outline" onClick={() => router.push(`/courses/${course.slug}`)}>
                  View public course
                </Button>
              )}
              {course.status === "PENDING_REVIEW" && (
                <Button variant="outline" onClick={() => router.push(`/admin/course-approvals?courseId=${course.id}`)}>
                  Review course
                </Button>
              )}
              {statusActions.map((action) => (
                <Button
                  key={action}
                  type="button"
                  variant={action === "submit" || action === "publish" ? "default" : "outline"}
                  className="gap-2"
                  onClick={() => {
                    if (action === "submit" && readinessIssues.length > 0) {
                      toast.error(readinessIssues[0]);
                      return;
                    }
                    setPendingAction({ course, action });
                  }}
                >
                  {action === "archive" ? <Archive size={15} aria-hidden="true" /> : <PlayCircle size={15} aria-hidden="true" />}
                  {getCourseActionCopy(action, course).label}
                </Button>
              ))}
            </>
          }
        />
        <Button
          type="button"
          variant="ghost"
          className="gap-2"
          onClick={() => router.push("/admin/courses")}
        >
          <ArrowLeft size={15} aria-hidden="true" />
          All courses
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-border bg-card px-4 py-3">
        <CourseStatusBadge status={course.status} />
        <span className="text-xs text-brand-text-muted">
          Category: <span className="font-medium text-brand-text">{categoryName}</span>
        </span>
        <span className="text-xs text-brand-text-muted">
          Last updated {formatManagementDate(course.updatedAt)}
        </span>
      </div>

      <AdminStatsGrid
        stats={[
          {
            label: "Sections",
            value: courseSections.length,
            description: "Course curriculum sections",
            icon: BookOpen,
            tone: "primary",
          },
          {
            label: "Lessons",
            value: courseLessons.length,
            description: "Lessons across all sections",
            icon: PlayCircle,
            tone: "violet",
          },
          {
            label: "Total duration",
            value: formatLearningDuration(
              curriculumStatsQuery.data?.totalDurationSeconds ?? 0,
            ),
            description: "Sum of lesson durations",
            icon: Clock3,
            tone: "amber",
          },
          {
            label: "Course price",
            value:
              course.pricing.type === "FREE"
                ? "Free"
                : formatCoursePrice(effectivePrice, course.pricing.currency),
            description: "Catalog price",
            icon: CircleDollarSign,
            tone: "green",
          },
        ]}
      />

      {readinessIssues.length > 0 &&
        (course.status === "DRAFT" || course.status === "REJECTED") && (
        <section
          aria-labelledby="readiness-title"
          className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4"
        >
          <h2 id="readiness-title" className="text-sm font-semibold text-brand-text">
            Readiness checks
          </h2>
          <p className="mt-1 text-xs text-brand-text-muted">
            Resolve these required fields before submitting this course for review.
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {readinessIssues.map((issue) => (
              <li key={issue} className="text-xs text-amber-800 dark:text-amber-300">
                • {issue}
              </li>
            ))}
          </ul>
        </section>
      )}
      {approvalDetailsQuery.isError && (
        <AdminErrorState
          title="Course readiness could not be checked"
          description={approvalDetailsQuery.error.message}
        />
      )}
      {curriculumQuery.isError && (
        <AdminErrorState
          title="Curriculum could not be loaded"
          description={curriculumQuery.error.message}
        />
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">
        <article className="overflow-hidden rounded-xl border border-brand-border bg-card">
          {course.thumbnailDataUrl ? (
            <Image
              src={course.thumbnailDataUrl}
              alt={`${course.title} thumbnail`}
              width={1280}
              height={720}
              unoptimized
              className="h-52 w-full border-b border-brand-border object-cover sm:h-72"
            />
          ) : (
            <div className="flex h-52 items-center justify-center border-b border-brand-border bg-primary/5 text-primary sm:h-72">
              <GraduationCap size={48} aria-hidden="true" />
            </div>
          )}
          <div className="space-y-4 p-5">
            <div>
              <h2 className="text-base font-semibold text-brand-text">
                About this course
              </h2>
              <p className="mt-2 text-sm leading-6 text-brand-text-muted">
                {course.description}
              </p>
            </div>
            <div className="grid gap-4 border-t border-brand-border pt-4 sm:grid-cols-2">
              <InfoList title="Learning outcomes" items={course.learningOutcomes} />
              <InfoList title="Requirements" items={course.requirements} />
              <InfoList title="Who this course is for" items={course.targetAudience} />
              <div>
                <h3 className="text-xs font-semibold text-brand-text">Course information</h3>
                <dl className="mt-2 space-y-2 text-xs">
                  <DetailRow label="Difficulty" value={course.level.toLowerCase()} />
                  <DetailRow label="Language" value={course.language} />
                  <DetailRow label="Created" value={formatManagementDate(course.createdAt)} />
                  <DetailRow
                    label="Price"
                    value={
                      course.pricing.type === "FREE"
                        ? "Free"
                        : formatCoursePrice(effectivePrice, course.pricing.currency)
                    }
                  />
                </dl>
              </div>
            </div>
          </div>
        </article>

        <aside className="space-y-5">
          <section className="rounded-xl border border-brand-border bg-card p-5">
            <h2 className="text-sm font-semibold text-brand-text">Curriculum overview</h2>
            {curriculumQuery.isLoading ? (
              <p className="mt-3 text-xs text-brand-text-muted">Loading curriculum…</p>
            ) : courseSections.length === 0 ? (
              <p className="mt-3 text-xs text-brand-text-muted">
                No sections have been added to this course yet.
              </p>
            ) : (
              <ol className="mt-4 space-y-4">
                {courseSections.map((section) => {
                  const sectionLessons = courseLessons.filter(
                    (lesson) => lesson.sectionId === section.id,
                  );
                  return (
                    <li key={section.id}>
                      <p className="text-xs font-medium text-brand-text">
                        {section.position}. {section.title}
                      </p>
                      <p className="mt-1 text-[11px] text-brand-text-muted">
                        {sectionLessons.length} lessons
                      </p>
                    </li>
                  );
                })}
              </ol>
            )}
            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full gap-2"
              onClick={() =>
                router.push(`/admin/courses/${course.id}/curriculum`)
              }
            >
              <BookOpen size={14} aria-hidden="true" />
              {canEdit ? "Open curriculum builder" : "View curriculum"}
            </Button>
          </section>

          <section id="review-history" className="scroll-mt-24 rounded-xl border border-brand-border bg-card p-5">
            <h2 className="text-sm font-semibold text-brand-text">
              Review history
            </h2>
            {reviews.length === 0 ? (
              <p className="mt-3 text-xs text-brand-text-muted">
                No review activity is recorded for this course.
              </p>
            ) : (
              <ol className="mt-4 space-y-4">
                {reviews
                  .slice()
                  .sort(
                    (left, right) =>
                      new Date(right.createdAt).getTime() -
                      new Date(left.createdAt).getTime(),
                  )
                  .map((review) => (
                    <li
                      key={review.id}
                      className="border-l-2 border-primary/30 pl-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <ReviewOutcomeBadge decision={review.decision} />
                        <time
                          dateTime={review.createdAt}
                          className="text-[11px] text-brand-text-muted"
                        >
                          {formatManagementDate(review.createdAt)}
                        </time>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-brand-text-muted">
                        {review.feedback || "No reviewer feedback was recorded."}
                      </p>
                    </li>
                  ))}
              </ol>
            )}
          </section>
        </aside>
      </div>

      <CourseLifecycleDialog
        pending={pendingAction}
        onClose={() => setPendingAction(null)}
        onComplete={({ action, course: previous }) => {
          if (action === "delete") router.push("/admin/courses");
          if (action === "restore" && previous.status === "PUBLISHED") {
            router.push(`/admin/courses/${previous.id}/edit`);
          }
        }}
      />
    </section>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-brand-text">{title}</h3>
      {items.length > 0 ? (
        <ul className="mt-2 space-y-1.5">
          {items.map((item, index) => (
            <li
              key={`${title}-${index}`}
              className="text-xs leading-5 text-brand-text-muted"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-brand-text-muted">No items provided.</p>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-brand-text-muted">{label}</dt>
      <dd className="capitalize text-brand-text">{value}</dd>
    </div>
  );
}

function ReviewOutcomeBadge({
  decision,
}: {
  decision: CourseReviewRecord["decision"];
}) {
  const label =
    decision === "APPROVED"
      ? "Approved"
      : decision === "REJECTED"
        ? "Rejected"
        : "Changes requested";
  const className =
    decision === "APPROVED"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : decision === "REJECTED"
        ? "border-destructive/20 bg-destructive/10 text-destructive"
        : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400";
  return (
    <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${className}`}>
      {label}
    </span>
  );
}
