"use client";

import { useMemo, useState } from "react";
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
  Star,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AdminConfirmDialog from "@/components/layouts/admin/shared/AdminConfirmDialog";
import AdminErrorState from "@/components/layouts/admin/shared/AdminErrorState";
import AdminPageHeader from "@/components/layouts/admin/shared/AdminPageHeader";
import AdminStatsGrid from "@/components/layouts/admin/shared/AdminStatsGrid";
import CourseStatusBadge from "@/components/layouts/admin/courses/CourseStatusBadge";
import LearningSampleNotice from "@/components/layouts/admin/learning/LearningSampleNotice";
import { useLearningDemoStore } from "@/features/admin/store/learning-demo.store";
import type {
  CourseReviewDecision,
  CourseStatus,
} from "@/features/admin/types/learning.types";
import {
  canTransitionCourseStatus,
  formatCoursePrice,
  formatLearningDuration,
  getCourseReadinessIssues,
} from "@/features/admin/utils/learning.utils";
import { formatManagementDate } from "@/features/admin/utils/management.utils";

export default function CourseDetailsClient({
  courseId,
}: {
  courseId: string;
}) {
  const router = useRouter();
  const course = useLearningDemoStore((state) =>
    state.courses.find((item) => item.id === courseId),
  );
  const categories = useLearningDemoStore((state) => state.categories);
  const sections = useLearningDemoStore((state) => state.sections);
  const lessons = useLearningDemoStore((state) => state.lessons);
  const allReviews = useLearningDemoStore((state) => state.reviews);
  const transitionCourse = useLearningDemoStore(
    (state) => state.transitionCourse,
  );
  const [nextStatus, setNextStatus] = useState<CourseStatus | null>(null);

  const courseSections = useMemo(
    () =>
      sections
        .filter((section) => section.courseId === courseId)
        .sort((a, b) => a.position - b.position),
    [courseId, sections],
  );
  const courseLessons = useMemo(
    () =>
      lessons
        .filter((lesson) =>
          courseSections.some((section) => section.id === lesson.sectionId),
        )
        .sort((a, b) => a.position - b.position),
    [courseSections, lessons],
  );
  const reviews = useMemo(
    () => allReviews.filter((item) => item.courseId === courseId),
    [allReviews, courseId],
  );
  if (!course) {
    return (
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8">
        <AdminErrorState
          title="Course not found"
          description="This sample course may have been removed or its ID is invalid."
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

  const category = categories.find((item) => item.id === course.categoryId);
  const effectivePrice =
    course.pricing.discountedPriceMinorUnits ??
    course.pricing.priceMinorUnits;
  const revenueMinorUnits =
    course.pricing.type === "FREE"
      ? 0
      : effectivePrice * course.enrollmentCount;
  const readinessIssues = getCourseReadinessIssues(
    course,
    categories,
    sections,
    lessons,
  );
  const canEdit = course.status !== "ARCHIVED";
  const requestTransition = (status: CourseStatus) => setNextStatus(status);
  const confirmTransition = () => {
    if (!course || !nextStatus) return;
    if (nextStatus === "PENDING_REVIEW" && readinessIssues.length > 0) {
      toast.error(readinessIssues[0]);
      return;
    }
    if (!transitionCourse(course.id, nextStatus)) {
      toast.error("This course cannot make that status transition.");
      return;
    }
    toast.success(
      `${course.title} is now ${nextStatus.replaceAll("_", " ").toLowerCase()} in sample data.`,
    );
    setNextStatus(null);
  };
  const statusAction =
    canTransitionCourseStatus(course.status, "PENDING_REVIEW")
      ? { status: "PENDING_REVIEW" as const, label: "Submit for review" }
      : canTransitionCourseStatus(course.status, "PUBLISHED")
        ? { status: "PUBLISHED" as const, label: "Publish course" }
        : canTransitionCourseStatus(course.status, "ARCHIVED")
          ? { status: "ARCHIVED" as const, label: "Archive course" }
          : null;

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
                Curriculum
              </Button>
              {statusAction && (
                <Button
                  type="button"
                  variant={
                    statusAction.status === "ARCHIVED" ? "outline" : "default"
                  }
                  className="gap-2"
                  onClick={() => requestTransition(statusAction.status)}
                >
                  {statusAction.status === "ARCHIVED" ? (
                    <Archive size={15} aria-hidden="true" />
                  ) : (
                    <PlayCircle size={15} aria-hidden="true" />
                  )}
                  {statusAction.label}
                </Button>
              )}
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
      <LearningSampleNotice />

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-border bg-card px-4 py-3">
        <CourseStatusBadge status={course.status} />
        <span className="text-xs text-brand-text-muted">
          Category: <span className="font-medium text-brand-text">{category?.name ?? "Uncategorized"}</span>
        </span>
        <span className="text-xs text-brand-text-muted">
          Last updated {formatManagementDate(course.updatedAt)}
        </span>
      </div>

      <AdminStatsGrid
        stats={[
          {
            label: "Enrollments",
            value: course.enrollmentCount.toLocaleString(),
            description: "Sample learner records",
            icon: UsersRound,
            tone: "primary",
          },
          {
            label: "Average rating",
            value: course.averageRating?.toFixed(1) ?? "—",
            description: "Sample rating data",
            icon: Star,
            tone: "amber",
          },
          {
            label: "Course length",
            value: formatLearningDuration(
              courseLessons.reduce(
                (total, lesson) => total + (lesson.durationSeconds ?? 0),
                0,
              ),
            ),
            description: `${courseSections.length} sections · ${courseLessons.length} lessons`,
            icon: Clock3,
            tone: "violet",
          },
          {
            label: "Estimated gross revenue",
            value: formatCoursePrice(revenueMinorUnits, course.pricing.currency),
            description: "Derived sample estimate; not transaction data",
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
            {courseSections.length === 0 ? (
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
              Open curriculum builder
            </Button>
          </section>

          <section className="rounded-xl border border-brand-border bg-card p-5">
            <h2 className="text-sm font-semibold text-brand-text">
              Review history
            </h2>
            {reviews.length === 0 ? (
              <p className="mt-3 text-xs text-brand-text-muted">
                No review activity is recorded for this sample course.
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

      <AdminConfirmDialog
        open={nextStatus !== null}
        onOpenChange={(open) => {
          if (!open) setNextStatus(null);
        }}
        title={
          nextStatus === "PENDING_REVIEW"
            ? "Submit course for review?"
            : nextStatus === "PUBLISHED"
              ? "Publish course?"
              : "Archive course?"
        }
        description={`Move ${course.title} to ${nextStatus?.replaceAll("_", " ").toLowerCase()}? This changes only the temporary sample workspace.`}
        confirmLabel={
          nextStatus === "PENDING_REVIEW"
            ? "Submit for review"
            : nextStatus === "PUBLISHED"
              ? "Publish"
              : "Archive"
        }
        isDestructive={nextStatus === "ARCHIVED"}
        onConfirm={confirmTransition}
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
  decision: CourseReviewDecision;
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
