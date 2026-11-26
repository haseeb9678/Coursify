"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ClipboardCheck,
  Clock3,
  Eye,
  MessageSquareText,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import AdminConfirmDialog from "@/components/layouts/admin/shared/AdminConfirmDialog";
import AdminDataTable, {
  type AdminTableColumn,
} from "@/components/layouts/admin/shared/AdminDataTable";
import {
  AdminTableActionContent,
  AdminTableActionTrigger,
} from "@/components/layouts/admin/shared/AdminTableActionMenu";
import AdminExportButton, {
  type AdminExportMode,
} from "@/components/layouts/admin/shared/AdminExportButton";
import AdminFilterSelect from "@/components/layouts/admin/shared/AdminFilterSelect";
import AdminPageHeader from "@/components/layouts/admin/shared/AdminPageHeader";
import AdminStatsGrid from "@/components/layouts/admin/shared/AdminStatsGrid";
import AdminTableToolbar from "@/components/layouts/admin/shared/AdminTableToolbar";
import CourseStatusBadge from "@/components/layouts/admin/courses/CourseStatusBadge";
import LearningSampleNotice from "@/components/layouts/admin/learning/LearningSampleNotice";
import { useAdminTableState } from "@/features/admin/hooks/use-admin-table-state";
import { sampleAdminInstructors } from "@/features/admin/data/instructors.data";
import { sampleAdminUsers } from "@/features/admin/data/users.data";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useLearningDemoStore } from "@/features/admin/store/learning-demo.store";
import type {
  AdminCourse,
  CourseApprovalFilters,
  CourseReviewDecision,
} from "@/features/admin/types/learning.types";
import {
  courseReviewChecklist,
  filterCourseApprovals,
  getCourseApprovalStats,
} from "@/features/admin/utils/learning.utils";
import {
  downloadCsv,
  formatManagementDate,
  paginateRecords,
  sortRecords,
} from "@/features/admin/utils/management.utils";

type ApprovalStatusFilter =
  | "ALL"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED";

type PendingDecision = {
  decision: CourseReviewDecision;
  course: AdminCourse;
} | null;

const visibleColumns = [
  "course",
  "category",
  "instructor",
  "status",
  "submittedAt",
  "updatedAt",
  "actions",
];

export default function AdminCourseApprovalsClient() {
  const router = useRouter();
  const courses = useLearningDemoStore((state) => state.courses);
  const categories = useLearningDemoStore((state) => state.categories);
  const reviews = useLearningDemoStore((state) => state.reviews);
  const reviewChecklists = useLearningDemoStore(
    (state) => state.reviewChecklists,
  );
  const toggleReviewChecklist = useLearningDemoStore(
    (state) => state.toggleReviewChecklist,
  );
  const reviewCourse = useLearningDemoStore((state) => state.reviewCourse);
  const reviewerId = useAuthStore((state) => state.user?.id ?? null);
  const table = useAdminTableState();
  const [filters, setFilters] = useState<CourseApprovalFilters>({
    search: "",
    categoryId: "ALL",
    status: "ALL",
    submittedWithin: "ALL",
  });
  const [shownColumns, setShownColumns] = useState(visibleColumns);
  const [activeCourse, setActiveCourse] = useState<AdminCourse | null>(null);
  const [pendingDecision, setPendingDecision] = useState<PendingDecision>(null);
  const [feedback, setFeedback] = useState("");

  const instructorNames = useMemo(
    () =>
      new Map(
        sampleAdminInstructors.map((profile) => [
          profile.userId,
          sampleAdminUsers.find((user) => user.id === profile.userId)?.name ??
            "Sample instructor",
        ]),
      ),
    [],
  );
  const approvalCourses = useMemo(
    () =>
      filterCourseApprovals(courses, filters, categories, instructorNames),
    [categories, courses, filters, instructorNames],
  );
  const sortedCourses = useMemo(
    () =>
      sortRecords(approvalCourses, table.sorting, (course, column) => {
        switch (column) {
          case "course":
            return course.title;
          case "category":
            return categories.find((item) => item.id === course.categoryId)?.name ?? "";
          case "instructor":
            return instructorNames.get(course.instructorId) ?? "";
          case "status":
            return course.status;
          case "submittedAt":
            return course.submittedAt;
          case "updatedAt":
            return course.updatedAt;
          default:
            return null;
        }
      }),
    [approvalCourses, categories, instructorNames, table.sorting],
  );
  const page = paginateRecords(sortedCourses, table.page, table.pageSize);
  const stats = getCourseApprovalStats(courses, reviews);
  const selectedChecklist = activeCourse
    ? reviewChecklists[activeCourse.id] ?? []
    : [];
  const checklistComplete =
    selectedChecklist.length === courseReviewChecklist.length;
  const feedbackValid = feedback.trim().length >= 10;

  const setFilter = <K extends keyof CourseApprovalFilters>(
    key: K,
    value: CourseApprovalFilters[K],
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
    table.setPage(1);
    table.clearSelection();
  };
  const clearFilters = () => {
    setFilters({
      search: "",
      categoryId: "ALL",
      status: "ALL",
      submittedWithin: "ALL",
    });
    table.setPage(1);
    table.clearSelection();
  };
  const filtersActive =
    Boolean(filters.search.trim()) ||
    filters.categoryId !== "ALL" ||
    filters.status !== "ALL" ||
    filters.submittedWithin !== "ALL";

  const columns = useMemo<AdminTableColumn<AdminCourse>[]>(
    () => [
      {
        id: "course",
        header: "Course",
        sortValue: (course) => course.title,
        className: "min-w-60",
        cell: (course) => (
          <div className="min-w-48">
            <p className="max-w-64 truncate font-semibold text-brand-text">
              {course.title}
            </p>
            <p className="mt-0.5 text-[11px] text-brand-text-muted">
              /{course.slug}
            </p>
          </div>
        ),
      },
      {
        id: "category",
        header: "Category",
        sortValue: (course) =>
          categories.find((item) => item.id === course.categoryId)?.name ?? "",
        cell: (course) =>
          categories.find((item) => item.id === course.categoryId)?.name ??
          "Uncategorized",
      },
      {
        id: "instructor",
        header: "Instructor",
        sortValue: (course) =>
          instructorNames.get(course.instructorId) ?? "",
        cell: (course) =>
          instructorNames.get(course.instructorId) ?? "Instructor unavailable",
      },
      {
        id: "status",
        header: "Status",
        sortValue: (course) => course.status,
        cell: (course) => <CourseStatusBadge status={course.status} />,
      },
      {
        id: "submittedAt",
        header: "Submitted",
        sortValue: (course) => course.submittedAt,
        cell: (course) => (
          <span className="whitespace-nowrap text-brand-text-muted">
            {formatManagementDate(course.submittedAt)}
          </span>
        ),
      },
      {
        id: "updatedAt",
        header: "Last updated",
        sortValue: (course) => course.updatedAt,
        cell: (course) => (
          <span className="whitespace-nowrap text-brand-text-muted">
            {formatManagementDate(course.updatedAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        hideable: false,
        className: "w-14 text-right",
        cell: (course) => (
          <DropdownMenu>
            <AdminTableActionTrigger label={`Actions for ${course.title}`} />
            <AdminTableActionContent className="w-44">
              {course.status === "PENDING_REVIEW" ? (
                <DropdownMenuItem
                  onClick={() => {
                    setFeedback("");
                    setActiveCourse(course);
                  }}
                >
                  <ClipboardCheck size={14} aria-hidden="true" />
                  Review submission
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => router.push(`/admin/courses/${course.id}`)}
                >
                  <Eye size={14} aria-hidden="true" />
                  View course
                </DropdownMenuItem>
              )}
            </AdminTableActionContent>
          </DropdownMenu>
        ),
      },
    ],
    [categories, instructorNames, router],
  );

  const exportCourses = (mode: AdminExportMode) => {
    const records =
      mode === "selected"
        ? approvalCourses.filter((course) => table.selectedIds.has(course.id))
        : mode === "filtered"
          ? approvalCourses
          : courses.filter(
              (course) =>
                course.status === "PENDING_REVIEW" ||
                course.status === "APPROVED" ||
                course.status === "REJECTED",
            );
    if (records.length === 0) return;
    downloadCsv(
      `coursify-course-approvals-${mode}`,
      ["Course", "Category", "Instructor", "Status", "Submitted", "Updated"],
      records.map((course) => [
        course.title,
        categories.find((item) => item.id === course.categoryId)?.name ?? "",
        instructorNames.get(course.instructorId) ?? "",
        course.status,
        course.submittedAt,
        course.updatedAt,
      ]),
    );
    toast.success(`Exported ${records.length} sample review records.`);
  };

  const openDecision = (decision: CourseReviewDecision) => {
    if (!activeCourse) return;
    if (!reviewerId) {
      toast.error("Your authenticated admin profile is not available.");
      return;
    }
    if (decision === "APPROVED" && !checklistComplete) {
      toast.error("Complete each manual review checklist item before approval.");
      return;
    }
    if (decision !== "APPROVED" && !feedbackValid) {
      toast.error("Add at least 10 characters of reviewer feedback.");
      return;
    }
    setPendingDecision({ decision, course: activeCourse });
  };

  const confirmDecision = () => {
    if (!pendingDecision || !reviewerId) {
      toast.error("Your authenticated admin profile is not available.");
      return;
    }
    const saved = reviewCourse(
      pendingDecision.course.id,
      reviewerId,
      pendingDecision.decision,
      feedback.trim(),
    );
    if (!saved) {
      toast.error("This submission is no longer waiting for review.");
      return;
    }
    const label =
      pendingDecision.decision === "APPROVED"
        ? "approved"
        : pendingDecision.decision === "REJECTED"
          ? "rejected"
          : "returned for changes";
    toast.success(
      `${pendingDecision.course.title} was ${label} in the sample workspace.`,
    );
    setPendingDecision(null);
    setActiveCourse(null);
    setFeedback("");
    table.clearSelection();
  };

  const recentReviewActivity = useMemo(
    () =>
      reviews
        .slice()
        .sort(
          (left, right) =>
            new Date(right.createdAt).getTime() -
            new Date(left.createdAt).getTime(),
        )
        .slice(0, 5),
    [reviews],
  );

  return (
    <section className="mx-auto w-full max-w-450 space-y-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <AdminPageHeader
        title="Course Approvals"
        description="Review course submissions using the administrator checklist and record a decision."
        actions={
          <AdminExportButton
            selectedCount={table.selectedIds.size}
            filteredCount={approvalCourses.length}
            onExport={exportCourses}
          />
        }
      />
      <LearningSampleNotice />
      <AdminStatsGrid
        stats={[
          {
            label: "Awaiting review",
            value: stats.pendingReviews,
            description: "Submissions requiring attention",
            icon: Clock3,
            tone: "amber",
          },
          {
            label: "Approved",
            value: stats.approvedCourses,
            description: "Ready for publication",
            icon: Check,
            tone: "green",
          },
          {
            label: "Changes requested",
            value: stats.rejectedCourses,
            description: "Returned to course authors",
            icon: MessageSquareText,
            tone: "red",
          },
          {
            label: "Reviewed this month",
            value: stats.reviewedThisMonth,
            description: "Sample review history",
            icon: ShieldCheck,
            tone: "violet",
          },
        ]}
      />
      <AdminTableToolbar
        search={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search courses or instructors..."
        searchLabel="Search course approvals"
        onClear={clearFilters}
        filtersActive={filtersActive}
        filters={
          <>
            <AdminFilterSelect
              label="Filter by category"
              value={filters.categoryId}
              options={[
                { value: "ALL", label: "All categories" },
                ...categories.map((category) => ({
                  value: category.id,
                  label: category.name,
                })),
              ]}
              onChange={(value) => setFilter("categoryId", value)}
            />
            <AdminFilterSelect
              label="Filter by review status"
              value={filters.status}
              options={[
                { value: "ALL", label: "All review statuses" },
                { value: "PENDING_REVIEW", label: "Pending review" },
                { value: "APPROVED", label: "Approved" },
                { value: "REJECTED", label: "Changes requested" },
              ]}
              onChange={(value) =>
                setFilter(
                  "status",
                  isApprovalStatus(value) ? value : "ALL",
                )
              }
            />
            <AdminFilterSelect
              label="Filter by submission date"
              value={filters.submittedWithin}
              options={[
                { value: "ALL", label: "Any submission date" },
                { value: "30_DAYS", label: "Last 30 days" },
                { value: "12_MONTHS", label: "Last 12 months" },
              ]}
              onChange={(value) => {
                if (
                  value === "ALL" ||
                  value === "30_DAYS" ||
                  value === "12_MONTHS"
                ) {
                  setFilter("submittedWithin", value);
                }
              }}
            />
          </>
        }
      />
      <AdminDataTable
        rows={page.items}
        columns={columns}
        getRowId={(course) => course.id}
        pagination={page.meta}
        onPageChange={(nextPage) => {
          table.clearSelection();
          table.setPage(nextPage);
        }}
        onPageSizeChange={(size) => {
          table.clearSelection();
          table.setPageSize(size);
        }}
        sorting={table.sorting}
        onSort={(column) => {
          table.clearSelection();
          table.toggleSorting(column);
        }}
        selectedIds={table.selectedIds}
        onToggleRows={table.toggleRows}
        visibleColumnIds={shownColumns}
        onVisibleColumnsChange={setShownColumns}
        emptyTitle="No submissions match these filters"
        emptyDescription="Try a different search or clear the current filters."
      />

      <section className="rounded-xl border border-brand-border bg-card p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-brand-text">
          Recent review activity
        </h2>
        {recentReviewActivity.length === 0 ? (
          <p className="mt-3 text-xs text-brand-text-muted">
            No sample review decisions have been recorded.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-brand-border">
            {recentReviewActivity.map((review) => {
              const reviewedCourse = courses.find(
                (course) => course.id === review.courseId,
              );
              return (
                <li
                  key={review.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-brand-text">
                      {reviewedCourse?.title ?? "Course unavailable"}
                    </p>
                    <p className="mt-1 text-[11px] text-brand-text-muted">
                      {review.feedback || "No feedback recorded"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <ReviewDecisionBadge decision={review.decision} />
                    <time
                      dateTime={review.createdAt}
                      className="text-[11px] text-brand-text-muted"
                    >
                      {formatManagementDate(review.createdAt)}
                    </time>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Sheet
        open={activeCourse !== null}
        onOpenChange={(open) => {
          if (!open) {
            setActiveCourse(null);
            setFeedback("");
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-2xl"
        >
          <SheetHeader className="border-b border-brand-border pr-14">
            <SheetTitle>Review course submission</SheetTitle>
            <SheetDescription>
              Check each item manually. This sample workflow does not claim to
              automatically verify course quality.
            </SheetDescription>
          </SheetHeader>
          {activeCourse && (
            <div className="space-y-5 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-brand-text">
                    {activeCourse.title}
                  </h3>
                  <p className="mt-1 text-xs text-brand-text-muted">
                    {categories.find(
                      (category) => category.id === activeCourse.categoryId,
                    )?.name ?? "Uncategorized"}
                    {" · "}
                    {instructorNames.get(activeCourse.instructorId) ??
                      "Instructor unavailable"}
                  </p>
                </div>
                <CourseStatusBadge status={activeCourse.status} />
              </div>
              <div className="rounded-lg border border-brand-border bg-brand-page-secondary/50 p-3">
                <p className="text-xs font-medium text-brand-text">
                  Course summary
                </p>
                <p className="mt-2 text-xs leading-5 text-brand-text-muted">
                  {activeCourse.shortDescription}
                </p>
                <p className="mt-2 text-[11px] text-brand-text-muted">
                  Submitted {formatManagementDate(activeCourse.submittedAt)}
                </p>
              </div>
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-brand-text">
                  Manual review checklist
                </legend>
                <div className="space-y-2">
                  {courseReviewChecklist.map((item) => {
                    const checked = selectedChecklist.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className="flex cursor-pointer items-start gap-3 rounded-lg border border-brand-border p-3 text-xs text-brand-text transition-colors hover:bg-brand-page-secondary"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() =>
                            toggleReviewChecklist(activeCourse.id, item.id)
                          }
                          aria-label={item.label}
                          className="mt-0.5"
                        />
                        <span>{item.label}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-[11px] text-brand-text-muted" aria-live="polite">
                  {selectedChecklist.length} of {courseReviewChecklist.length} items reviewed.
                </p>
              </fieldset>
              <div className="space-y-2">
                <label
                  htmlFor="reviewer-feedback"
                  className="text-xs font-medium text-brand-text"
                >
                  Reviewer feedback
                  <span className="ml-1 font-normal text-brand-text-muted">
                    (required for rejection or requested changes)
                  </span>
                </label>
                <textarea
                  id="reviewer-feedback"
                  rows={4}
                  maxLength={1200}
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                  placeholder="Share actionable feedback with the course author."
                  className="w-full resize-y rounded-lg border border-brand-border bg-background px-3 py-2 text-sm text-brand-text outline-none placeholder:text-brand-text-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                />
                <p className="text-[11px] text-brand-text-muted">
                  {feedback.length}/1200 characters
                </p>
              </div>
              {!reviewerId && (
                <p role="alert" className="text-xs text-destructive">
                  An authenticated admin profile is required to record a review.
                </p>
              )}
              <div className="flex flex-wrap justify-end gap-2 border-t border-brand-border pt-4">
                <Button
                  type="button"
                  variant="destructive"
                  disabled={!reviewerId || !feedbackValid}
                  onClick={() => openDecision("REJECTED")}
                >
                  <X size={14} aria-hidden="true" />
                  Reject
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!reviewerId || !feedbackValid}
                  onClick={() => openDecision("CHANGES_REQUESTED")}
                >
                  <MessageSquareText size={14} aria-hidden="true" />
                  Request changes
                </Button>
                <Button
                  type="button"
                  disabled={!reviewerId || !checklistComplete}
                  onClick={() => openDecision("APPROVED")}
                >
                  <Check size={14} aria-hidden="true" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AdminConfirmDialog
        open={pendingDecision !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDecision(null);
        }}
        title={
          pendingDecision?.decision === "APPROVED"
            ? "Approve this course?"
            : pendingDecision?.decision === "REJECTED"
              ? "Reject this course?"
              : "Request course changes?"
        }
        description={
          pendingDecision
            ? `Record this decision for ${pendingDecision.course.title} as the authenticated admin.`
            : ""
        }
        confirmLabel={
          pendingDecision?.decision === "APPROVED"
            ? "Approve course"
            : pendingDecision?.decision === "REJECTED"
              ? "Reject course"
              : "Request changes"
        }
        isDestructive={pendingDecision?.decision === "REJECTED"}
        onConfirm={confirmDecision}
      />
    </section>
  );
}

function isApprovalStatus(
  value: string,
): value is ApprovalStatusFilter {
  return (
    value === "ALL" ||
    value === "PENDING_REVIEW" ||
    value === "APPROVED" ||
    value === "REJECTED"
  );
}

function ReviewDecisionBadge({
  decision,
}: {
  decision: CourseReviewDecision;
}) {
  const text =
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
      {text}
    </span>
  );
}
