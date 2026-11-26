"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Archive,
  BookOpen,
  CalendarDays,
  Eye,
  Globe,
  Layers3,
  Pencil,
  Plus,
  Send,
  Star,
  Trash2,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { sampleAdminUsers } from "@/features/admin/data/users.data";
import { sampleAdminInstructors } from "@/features/admin/data/instructors.data";
import { useLearningDemoStore } from "@/features/admin/store/learning-demo.store";
import type {
  AdminCourse,
  CourseLevel,
  CoursePricingType,
  CourseStatus,
} from "@/features/admin/types/learning.types";
import {
  canTransitionCourseStatus,
  filterLearningCourses,
  formatCoursePrice,
  getCourseReadinessIssues,
  getCourseStats,
} from "@/features/admin/utils/learning.utils";
import {
  downloadCsv,
  formatManagementDate,
  paginateRecords,
  sortRecords,
} from "@/features/admin/utils/management.utils";

const initialVisibleColumns = [
  "identity",
  "category",
  "instructor",
  "level",
  "price",
  "enrollments",
  "status",
  "createdAt",
  "updatedAt",
  "actions",
];

type CoursePageFilters = {
  search: string;
  categoryId: string;
  instructorId: string;
  status: CourseStatus | "ALL";
  level: CourseLevel | "ALL";
  language: string;
  pricing: CoursePricingType | "ALL";
};

type PendingCourseAction =
  | {
      kind: "transition";
      course: AdminCourse;
      status: CourseStatus;
    }
  | { kind: "delete"; course: AdminCourse }
  | null;

const levelLabel: Record<CourseLevel, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export default function AdminCoursesClient() {
  const router = useRouter();
  const courses = useLearningDemoStore((state) => state.courses);
  const categories = useLearningDemoStore((state) => state.categories);
  const sections = useLearningDemoStore((state) => state.sections);
  const lessons = useLearningDemoStore((state) => state.lessons);
  const reviews = useLearningDemoStore((state) => state.reviews);
  const transitionCourse = useLearningDemoStore(
    (state) => state.transitionCourse,
  );
  const deleteCourse = useLearningDemoStore((state) => state.deleteCourse);
  const table = useAdminTableState();
  const [filters, setFilters] = useState<CoursePageFilters>({
    search: "",
    categoryId: "ALL",
    instructorId: "ALL",
    status: "ALL",
    level: "ALL",
    language: "ALL",
    pricing: "ALL",
  });
  const [shownColumns, setShownColumns] = useState(initialVisibleColumns);
  const [pendingAction, setPendingAction] = useState<PendingCourseAction>(null);

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
  const filteredCourses = useMemo(
    () =>
      filterLearningCourses(
        courses,
        filters,
        categories,
        instructorNames,
      ),
    [categories, courses, filters, instructorNames],
  );
  const sortedCourses = useMemo(
    () =>
      sortRecords(filteredCourses, table.sorting, (course, column) => {
        switch (column) {
          case "identity":
            return course.title;
          case "category":
            return categories.find((item) => item.id === course.categoryId)?.name ?? "";
          case "instructor":
            return instructorNames.get(course.instructorId) ?? "";
          case "level":
            return course.level;
          case "price":
            return course.pricing.priceMinorUnits;
          case "enrollments":
            return course.enrollmentCount;
          case "status":
            return course.status;
          case "createdAt":
            return course.createdAt;
          case "updatedAt":
            return course.updatedAt;
          default:
            return null;
        }
      }),
    [categories, filteredCourses, instructorNames, table.sorting],
  );
  const page = paginateRecords(sortedCourses, table.page, table.pageSize);
  const stats = getCourseStats(courses);

  const columns = useMemo<AdminTableColumn<AdminCourse>[]>(
    () => [
      {
        id: "identity",
        header: "Course",
        sortValue: (course) => course.title,
        className: "min-w-64",
        cell: (course) => (
          <div className="flex min-w-56 items-center gap-3">
            {course.thumbnailDataUrl ? (
              <Image
                src={course.thumbnailDataUrl}
                alt=""
                width={64}
                height={44}
                unoptimized
                className="h-11 w-16 shrink-0 rounded-md border border-brand-border object-cover"
              />
            ) : (
              <span className="flex h-11 w-16 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <BookOpen size={18} aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0">
              <p className="max-w-56 truncate font-semibold text-brand-text">
                {course.title}
              </p>
              <p className="mt-0.5 max-w-56 truncate text-[11px] text-brand-text-muted">
                {course.shortDescription}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "category",
        header: "Category",
        sortValue: (course) =>
          categories.find((item) => item.id === course.categoryId)?.name ?? "",
        cell: (course) => (
          <span className="whitespace-nowrap">
            {categories.find((item) => item.id === course.categoryId)?.name ??
              "Uncategorized"}
          </span>
        ),
      },
      {
        id: "instructor",
        header: "Instructor",
        sortValue: (course) =>
          instructorNames.get(course.instructorId) ?? "",
        cell: (course) => (
          <span className="whitespace-nowrap">
            {instructorNames.get(course.instructorId) ?? "Instructor unavailable"}
          </span>
        ),
      },
      {
        id: "level",
        header: "Level",
        sortValue: (course) => course.level,
        cell: (course) => levelLabel[course.level],
      },
      {
        id: "price",
        header: "Price",
        sortValue: (course) => course.pricing.priceMinorUnits,
        cell: (course) =>
          course.pricing.type === "FREE" ? (
            <span className="font-medium text-emerald-700 dark:text-emerald-400">
              Free
            </span>
          ) : (
            <span className="whitespace-nowrap">
              {course.pricing.discountedPriceMinorUnits !== null ? (
                <>
                  <span className="font-medium text-brand-text">
                    {formatCoursePrice(
                      course.pricing.discountedPriceMinorUnits,
                      course.pricing.currency,
                    )}
                  </span>
                  <span className="ml-1 text-[10px] text-brand-text-muted line-through">
                    {formatCoursePrice(
                      course.pricing.priceMinorUnits,
                      course.pricing.currency,
                    )}
                  </span>
                </>
              ) : (
                formatCoursePrice(
                  course.pricing.priceMinorUnits,
                  course.pricing.currency,
                )
              )}
            </span>
          ),
      },
      {
        id: "enrollments",
        header: "Enrollments",
        sortValue: (course) => course.enrollmentCount,
        cell: (course) => (
          <span className="inline-flex items-center gap-1.5 tabular-nums text-brand-text-muted">
            <UsersRound size={13} aria-hidden="true" />
            {course.enrollmentCount.toLocaleString()}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        sortValue: (course) => course.status,
        cell: (course) => <CourseStatusBadge status={course.status} />,
      },
      {
        id: "createdAt",
        header: "Created",
        sortValue: (course) => course.createdAt,
        cell: (course) => (
          <span className="whitespace-nowrap text-brand-text-muted">
            {formatManagementDate(course.createdAt)}
          </span>
        ),
      },
      {
        id: "updatedAt",
        header: "Updated",
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
          <CourseActions
            course={course}
            hasReviews={reviews.some((review) => review.courseId === course.id)}
            onView={() => router.push(`/admin/courses/${course.id}`)}
            onEdit={() => router.push(`/admin/courses/${course.id}/edit`)}
            onCurriculum={() =>
              router.push(`/admin/courses/${course.id}/curriculum`)
            }
            onTransition={(status) =>
              setPendingAction({ kind: "transition", course, status })
            }
            onDelete={() => setPendingAction({ kind: "delete", course })}
          />
        ),
      },
    ],
    [categories, instructorNames, reviews, router],
  );

  const setFilter = <K extends keyof CoursePageFilters>(
    key: K,
    value: CoursePageFilters[K],
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
    table.setPage(1);
    table.clearSelection();
  };
  const clearFilters = () => {
    setFilters({
      search: "",
      categoryId: "ALL",
      instructorId: "ALL",
      status: "ALL",
      level: "ALL",
      language: "ALL",
      pricing: "ALL",
    });
    table.setPage(1);
    table.clearSelection();
  };
  const filtersActive =
    Boolean(filters.search.trim()) ||
    filters.categoryId !== "ALL" ||
    filters.instructorId !== "ALL" ||
    filters.status !== "ALL" ||
    filters.level !== "ALL" ||
    filters.language !== "ALL" ||
    filters.pricing !== "ALL";

  const exportCourses = (mode: AdminExportMode) => {
    const records =
      mode === "selected"
        ? filteredCourses.filter((course) => table.selectedIds.has(course.id))
        : mode === "filtered"
          ? filteredCourses
          : courses;
    if (records.length === 0) return;
    downloadCsv(
      `coursify-courses-${mode}`,
      [
        "Title",
        "Slug",
        "Category",
        "Instructor",
        "Level",
        "Language",
        "Price",
        "Status",
        "Enrollments",
        "Created",
        "Updated",
      ],
      records.map((course) => [
        course.title,
        course.slug,
        categories.find((category) => category.id === course.categoryId)?.name ??
          "",
        instructorNames.get(course.instructorId) ?? "",
        course.level,
        course.language,
        course.pricing.type === "FREE"
          ? "Free"
          : formatCoursePrice(
              course.pricing.priceMinorUnits,
              course.pricing.currency,
            ),
        course.status,
        course.enrollmentCount,
        course.createdAt,
        course.updatedAt,
      ]),
    );
    toast.success(`Exported ${records.length} course records from sample data.`);
  };

  const confirmAction = () => {
    if (!pendingAction) return;
    if (pendingAction.kind === "delete") {
      if (!deleteCourse(pendingAction.course.id)) {
        toast.error(
          "Only draft courses without enrollments or review history can be deleted.",
        );
        return;
      }
      toast.success("Course removed from the temporary sample workspace.");
      setPendingAction(null);
      table.clearSelection();
      return;
    }

    if (pendingAction.status === "PENDING_REVIEW") {
      const readinessIssues = getCourseReadinessIssues(
        pendingAction.course,
        categories,
        sections,
        lessons,
      );
      if (readinessIssues.length > 0) {
        toast.error(readinessIssues[0]);
        return;
      }
    }

    if (!transitionCourse(pendingAction.course.id, pendingAction.status)) {
      toast.error(
        "This course cannot make that status transition or is missing required content.",
      );
      return;
    }
    toast.success(
      `${pendingAction.course.title} is now ${pendingAction.status.replaceAll("_", " ").toLowerCase()} in sample data.`,
    );
    setPendingAction(null);
    table.clearSelection();
  };

  const statusTarget =
    pendingAction?.kind === "transition" ? pendingAction.status : null;
  const confirmDescription =
    pendingAction?.kind === "delete"
      ? `Remove ${pendingAction.course.title}? Only a draft without enrollments or review history can be safely deleted.`
      : pendingAction?.kind === "transition"
        ? `Move ${pendingAction.course.title} to ${pendingAction.status.replaceAll("_", " ").toLowerCase()}?`
        : "";

  return (
    <section className="mx-auto w-full max-w-450 space-y-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <AdminPageHeader
        title="Courses"
        description="Manage, organize, and monitor your platform's learning content."
        actions={
          <>
            <AdminExportButton
              selectedCount={table.selectedIds.size}
              filteredCount={filteredCourses.length}
              onExport={exportCourses}
            />
            <Button
              type="button"
              className="gap-2"
              onClick={() => router.push("/admin/courses/create")}
            >
              <Plus size={16} aria-hidden="true" />
              Create course
            </Button>
          </>
        }
      />
      <LearningSampleNotice />
      <AdminStatsGrid
        columns={5}
        stats={[
          {
            label: "Total courses",
            value: stats.total,
            description: "Across all course statuses",
            icon: BookOpen,
            tone: "primary",
          },
          {
            label: "Published",
            value: stats.published,
            description: "Available to learners",
            icon: Star,
            tone: "green",
          },
          {
            label: "Drafts",
            value: stats.drafts,
            description: "Not yet submitted for review",
            icon: Layers3,
            tone: "violet",
          },
          {
            label: "Pending review",
            value: stats.pendingReview,
            description: "Waiting for an administrator",
            icon: CalendarDays,
            tone: "amber",
          },
          {
            label: "Archived",
            value: stats.archived,
            description: "No longer in active catalog",
            icon: Archive,
            tone: "red",
          },
        ]}
      />

      <AdminTableToolbar
        search={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search by course or instructor..."
        searchLabel="Search courses"
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
              label="Filter by instructor"
              value={filters.instructorId}
              options={[
                { value: "ALL", label: "All instructors" },
                ...Array.from(instructorNames, ([id, name]) => ({
                  value: id,
                  label: name,
                })),
              ]}
              onChange={(value) => setFilter("instructorId", value)}
            />
            <AdminFilterSelect
              label="Filter by course status"
              value={filters.status}
              options={[
                { value: "ALL", label: "All statuses" },
                { value: "DRAFT", label: "Draft" },
                { value: "PENDING_REVIEW", label: "Pending review" },
                { value: "APPROVED", label: "Approved" },
                { value: "REJECTED", label: "Changes requested" },
                { value: "PUBLISHED", label: "Published" },
                { value: "ARCHIVED", label: "Archived" },
              ]}
              onChange={(value) =>
                setFilter(
                  "status",
                  isCourseStatus(value) ? value : "ALL",
                )
              }
            />
            <AdminFilterSelect
              label="Filter by difficulty"
              value={filters.level}
              options={[
                { value: "ALL", label: "All levels" },
                { value: "BEGINNER", label: "Beginner" },
                { value: "INTERMEDIATE", label: "Intermediate" },
                { value: "ADVANCED", label: "Advanced" },
              ]}
              onChange={(value) =>
                setFilter("level", isCourseLevel(value) ? value : "ALL")
              }
            />
            <AdminFilterSelect
              label="Filter by language"
              value={filters.language}
              options={[
                { value: "ALL", label: "All languages" },
                ...Array.from(
                  new Set(courses.map((course) => course.language)),
                ).map((language) => ({ value: language, label: language })),
              ]}
              onChange={(value) => setFilter("language", value)}
            />
            <AdminFilterSelect
              label="Filter by pricing"
              value={filters.pricing}
              options={[
                { value: "ALL", label: "Free and paid" },
                { value: "FREE", label: "Free courses" },
                { value: "PAID", label: "Paid courses" },
              ]}
              onChange={(value) =>
                setFilter("pricing", isPricingType(value) ? value : "ALL")
              }
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
        emptyTitle="No courses match these filters"
        emptyDescription="Try a different search or clear one or more filters."
      />

      <AdminConfirmDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
        title={
          pendingAction?.kind === "delete"
            ? "Delete draft course?"
            : statusTarget === "ARCHIVED"
              ? "Archive course?"
              : statusTarget === "PENDING_REVIEW"
                ? "Submit course for review?"
                : statusTarget === "PUBLISHED"
                  ? "Publish course?"
                  : "Confirm status change"
        }
        description={confirmDescription}
        confirmLabel={
          pendingAction?.kind === "delete"
            ? "Delete course"
            : statusTarget === "PENDING_REVIEW"
              ? "Submit for review"
              : statusTarget === "PUBLISHED"
                ? "Publish"
                : statusTarget === "ARCHIVED"
                  ? "Archive"
                  : "Confirm"
        }
        isDestructive={
          pendingAction?.kind === "delete" || statusTarget === "ARCHIVED"
        }
        onConfirm={confirmAction}
      />
    </section>
  );
}

function CourseActions({
  course,
  hasReviews,
  onView,
  onEdit,
  onCurriculum,
  onTransition,
  onDelete,
}: {
  course: AdminCourse;
  hasReviews: boolean;
  onView: () => void;
  onEdit: () => void;
  onCurriculum: () => void;
  onTransition: (status: CourseStatus) => void;
  onDelete: () => void;
}) {
  const canDelete =
    course.status === "DRAFT" &&
    course.enrollmentCount === 0 &&
    !hasReviews;
  return (
    <DropdownMenu>
      <AdminTableActionTrigger label={`Actions for ${course.title}`} />
      <AdminTableActionContent className="w-56">
        <DropdownMenuItem onClick={onView}>
          <Eye size={14} aria-hidden="true" />
          View course
        </DropdownMenuItem>
        {course.status !== "ARCHIVED" && (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil size={14} aria-hidden="true" />
            Edit course
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onCurriculum}>
          <BookOpen size={14} aria-hidden="true" />
          Manage curriculum
        </DropdownMenuItem>
        {canTransitionCourseStatus(course.status, "PENDING_REVIEW") && (
          <DropdownMenuItem
            onClick={() => onTransition("PENDING_REVIEW")}
          >
            <Send size={14} aria-hidden="true" />
            Submit for review
          </DropdownMenuItem>
        )}
        {canTransitionCourseStatus(course.status, "PUBLISHED") && (
          <DropdownMenuItem onClick={() => onTransition("PUBLISHED")}>
            <Globe size={14} aria-hidden="true" />
            Publish course
          </DropdownMenuItem>
        )}
        {canTransitionCourseStatus(course.status, "ARCHIVED") && (
          <DropdownMenuItem onClick={() => onTransition("ARCHIVED")}>
            <Archive size={14} aria-hidden="true" />
            Archive course
          </DropdownMenuItem>
        )}
        {course.status === "DRAFT" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={!canDelete}
              title={
                canDelete
                  ? undefined
                  : "Courses with enrollments or review history cannot be deleted."
              }
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 size={14} aria-hidden="true" />
              Delete draft
            </DropdownMenuItem>
          </>
        )}
      </AdminTableActionContent>
    </DropdownMenu>
  );
}

function isCourseStatus(value: string): value is CourseStatus {
  return [
    "DRAFT",
    "PENDING_REVIEW",
    "APPROVED",
    "REJECTED",
    "PUBLISHED",
    "ARCHIVED",
  ].includes(value);
}

function isCourseLevel(value: string): value is CourseLevel {
  return value === "BEGINNER" || value === "INTERMEDIATE" || value === "ADVANCED";
}

function isPricingType(value: string): value is CoursePricingType {
  return value === "FREE" || value === "PAID";
}
