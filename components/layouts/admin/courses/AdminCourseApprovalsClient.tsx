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
import { getGraphQLErrorMessage } from "@/lib/graphql/error";
import { Button } from "@/components/ui/button";
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
import AdminErrorState from "@/components/layouts/admin/shared/AdminErrorState";
import { useAdminTableState } from "@/features/admin/hooks/use-admin-table-state";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  useAdminApprovalDetails,
  useAdminApprovalStats,
  useAdminCourseApprovals,
  useCourseCategoryOptions,
  useDecideCourseReview,
} from "@/features/admin/hooks/use-admin-learning";
import type {
  AdminCourse,
  CourseApprovalFilters,
} from "@/features/admin/types/learning.types";
import {
  downloadCsv,
  formatManagementDate,
  sortRecords,
} from "@/features/admin/utils/management.utils";
import type { CourseReviewRecord } from "@/features/admin/types/learning-api.types";

type ApprovalFilters = Pick<CourseApprovalFilters, "search" | "categoryId" | "status">;

type ApprovalStatusFilter =
  | "ALL"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED";

type PendingDecision = {
  decision: "APPROVED" | "REJECTED";
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

export default function AdminCourseApprovalsClient({ initialCourseId }: { initialCourseId?: string }) {
  const router = useRouter();
  const reviewerId = useAuthStore((state) => state.user?.id ?? null);
  const table = useAdminTableState();
  const [filters, setFilters] = useState<ApprovalFilters>({
    search: "",
    categoryId: "ALL",
    status: "ALL",
  });
  const [shownColumns, setShownColumns] = useState(visibleColumns);
  const [activeCourseId, setActiveCourseId] = useState(initialCourseId ?? "");
  const [pendingDecision, setPendingDecision] = useState<PendingDecision>(null);
  const [feedback, setFeedback] = useState("");

  const filter = {
    ...(filters.search.trim() ? { search: filters.search.trim() } : {}),
    ...(filters.categoryId !== "ALL" ? { categoryId: filters.categoryId } : {}),
    ...(filters.status !== "ALL" ? { status: filters.status } : {}),
  };
  const approvalQuery = useAdminCourseApprovals(
    { page: table.page, limit: table.pageSize },
    filter,
  );
  const statsQuery = useAdminApprovalStats();
  const categoriesQuery = useCourseCategoryOptions();
  const approvalDetailsQuery = useAdminApprovalDetails(activeCourseId, "always");
  const decideReview = useDecideCourseReview();
  const courses = approvalQuery.data?.items ?? [];
  const activeCourse = approvalDetailsQuery.data?.course ?? courses.find((course) => course.id === activeCourseId);
  const canRecordDecision = activeCourse?.status === "PENDING_REVIEW" &&
    approvalDetailsQuery.isSuccess && !approvalDetailsQuery.isFetching && !decideReview.isPending;
  const categories = categoriesQuery.data ?? [];
  const approvalCourses = courses;
  const sortedCourses = useMemo(
    () =>
      sortRecords(approvalCourses, table.sorting, (course, column) => {
        switch (column) {
          case "course":
            return course.title;
          case "category":
            return course.categoryName ?? "";
          case "instructor":
            return course.instructorName ?? "";
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
    [approvalCourses, table.sorting],
  );
  const stats = statsQuery.data;
  const feedbackValid = feedback.trim().length >= 20;

  const setFilter = <K extends keyof ApprovalFilters>(
    key: K,
    value: ApprovalFilters[K],
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
    });
    table.setPage(1);
    table.clearSelection();
  };
  const filtersActive =
    Boolean(filters.search.trim()) ||
    filters.categoryId !== "ALL" ||
    filters.status !== "ALL";

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
        sortValue: (course) => course.categoryName ?? "",
        cell: (course) => course.categoryName ?? "—",
      },
      {
        id: "instructor",
        header: "Instructor",
        sortValue: (course) =>
          course.instructorName ?? "",
        cell: (course) => course.instructorName ?? "—",
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
                    setActiveCourseId(course.id);
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
    [router],
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
        course.categoryName ?? "",
        course.instructorName ?? "",
        course.status,
        course.submittedAt,
        course.updatedAt,
      ]),
    );
    toast.success(`Exported ${records.length} loaded review records.`);
  };

  const closeCourse = () => {
    setActiveCourseId("");
    setFeedback("");
    if (initialCourseId) router.replace("/admin/course-approvals");
  };

  const openDecision = (decision: "APPROVED" | "REJECTED") => {
    if (!activeCourse || !canRecordDecision) return;
    if (!reviewerId) {
      toast.error("Your authenticated admin profile is not available.");
      return;
    }
    if (decision !== "APPROVED" && !feedbackValid) {
      toast.error("Add at least 20 characters of reviewer feedback.");
      return;
    }
    setPendingDecision({ decision, course: activeCourse });
  };

  const confirmDecision = async () => {
    if (!pendingDecision || !reviewerId) {
      toast.error("Your authenticated admin profile is not available.");
      return;
    }
    try {
      await decideReview.mutateAsync({
        decision: pendingDecision.decision === "APPROVED" ? "approve" : "reject",
        courseId: pendingDecision.course.id,
        feedback: feedback.trim(),
      });
      toast.success(
        `${pendingDecision.course.title} was ${pendingDecision.decision.toLowerCase()}.`,
      );
      setPendingDecision(null);
      closeCourse();
      table.clearSelection();
    } catch (error) {
      toast.error(getGraphQLErrorMessage(error));
    }
  };

  return (
    <section className="mx-auto w-full max-w-450 space-y-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <AdminPageHeader
        title="Course Approvals"
        description="Review course submissions using the administrator checklist and record a decision."
        actions={
          <AdminExportButton
            selectedCount={table.selectedIds.size}
            filteredCount={approvalQuery.data?.meta.total ?? 0}
            onExport={exportCourses}
          />
        }
      />
      <AdminStatsGrid
        stats={[
          {
            label: "Awaiting review",
            value: stats?.pendingReviews ?? "—",
            description: "Submissions requiring attention",
            icon: Clock3,
            tone: "amber",
          },
          {
            label: "Approved",
            value: stats?.approvedCourses ?? "—",
            description: "Ready for publication",
            icon: Check,
            tone: "green",
          },
          {
            label: "Changes requested",
            value: stats?.rejectedCourses ?? "—",
            description: "Returned to course authors",
            icon: MessageSquareText,
            tone: "red",
          },
          {
            label: "Reviewed this month",
            value: stats?.reviewedThisMonth ?? "—",
            description: "Recorded backend decisions",
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
          </>
        }
      />
      {approvalQuery.isError && (
        <AdminErrorState
          title="Course approvals could not be loaded"
          description={approvalQuery.error.message}
        />
      )}
      <AdminDataTable
        rows={sortedCourses}
        columns={columns}
        getRowId={(course) => course.id}
        pagination={approvalQuery.data?.meta ?? {
          page: table.page,
          limit: table.pageSize,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        }}
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
        isLoading={approvalQuery.isLoading}
        isPlaceholderData={approvalQuery.isPlaceholderData}
        error={approvalQuery.isError ? approvalQuery.error.message : null}
        emptyTitle="No submissions match these filters"
        emptyDescription="Try a different search or clear the current filters."
      />


      <Sheet
        open={activeCourseId !== ""}
        onOpenChange={(open) => { if (!open) closeCourse(); }}
      >
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-2xl"
        >
          <SheetHeader className="border-b border-brand-border pr-14">
            <SheetTitle>Review course submission</SheetTitle>
            <SheetDescription>
              Review backend readiness checks and record a decision for this submission.
            </SheetDescription>
          </SheetHeader>
          {!activeCourse && (
            <p className="p-5 text-sm text-brand-text-muted" role={approvalDetailsQuery.isError ? "alert" : "status"}>
              {approvalDetailsQuery.isError ? getGraphQLErrorMessage(approvalDetailsQuery.error) : "Loading submission..."}
            </p>
          )}
          {activeCourse && (
            <div className="space-y-5 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-brand-text">
                    {activeCourse.title}
                  </h3>
                  <p className="mt-1 text-xs text-brand-text-muted">
                    {activeCourse.categoryName ?? "—"}
                    {" · "}
                    {activeCourse.instructorName ?? "—"}
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
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3"
                  onClick={() => router.push(`/admin/courses/${activeCourse.id}/curriculum`)}
                >
                  View curriculum
                </Button>
              </div>
              <section aria-live="polite" className="space-y-2">
                <h4 className="text-sm font-semibold text-brand-text">Backend readiness checks</h4>
                {approvalDetailsQuery.isLoading ? (
                  <p className="text-xs text-brand-text-muted">Checking course readiness…</p>
                ) : approvalDetailsQuery.isError ? (
                  <p role="alert" className="text-xs text-destructive">
                    {approvalDetailsQuery.error.message}
                  </p>
                ) : approvalDetailsQuery.data?.readinessErrors.length ? (
                  <ul className="space-y-1 rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 text-xs text-amber-800 dark:text-amber-300">
                    {approvalDetailsQuery.data.readinessErrors.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-700 dark:text-emerald-400">
                    Backend readiness checks passed.
                  </p>
                )}
                {approvalDetailsQuery.data?.recentReviews.map((review) => (
                  <div key={review.id} className="rounded-lg border border-brand-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <ReviewDecisionBadge decision={review.decision} />
                      <time className="text-[11px] text-brand-text-muted">
                        {formatManagementDate(review.createdAt)}
                      </time>
                    </div>
                    <p className="mt-2 text-xs text-brand-text-muted">
                      {review.reviewer.name}: {review.feedback || "No feedback recorded."}
                    </p>
                  </div>
                ))}
              </section>
              <div className="space-y-2">
                <label
                  htmlFor="reviewer-feedback"
                  className="text-xs font-medium text-brand-text"
                >
                  Reviewer feedback
                  <span className="ml-1 font-normal text-brand-text-muted">
                    (required for rejection; at least 20 characters)
                  </span>
                </label>
                <textarea
                  id="reviewer-feedback"
                  rows={4}
                  maxLength={1200}
                  disabled={!canRecordDecision}
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
                  disabled={!reviewerId || !canRecordDecision || !feedbackValid}
                  onClick={() => openDecision("REJECTED")}
                >
                  <X size={14} aria-hidden="true" />
                  Reject
                </Button>
                <Button
                  type="button"
                  disabled={
                    !reviewerId ||
                    !canRecordDecision ||
                    (approvalDetailsQuery.data?.readinessErrors.length ?? 0) > 0
                  }
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
              : "Record this decision?"
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
              : "Confirm"
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
  decision: CourseReviewRecord["decision"];
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
