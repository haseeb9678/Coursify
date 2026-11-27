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
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import CourseLifecycleDialog, { type PendingCourseAction } from "./CourseLifecycleDialog";
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
import {
  useAdminCourseStats,
  useAdminCourses,
  useCourseCategoryOptions,
  useCourseInstructorOptions,
} from "@/features/admin/hooks/use-admin-learning";
import type {
  AdminCourse,
  CourseLevel,
  CoursePricingType,
  CourseStatus,
} from "@/features/admin/types/learning.types";
import {
  canEditCourse,
  getCourseAdminActions,
  getCourseActionCopy,
  type CourseAdminAction,
  formatCoursePrice,
} from "@/features/admin/utils/learning.utils";
import {
  downloadCsv,
  formatManagementDate,
} from "@/features/admin/utils/management.utils";

const initialVisibleColumns = [
  "identity",
  "category",
  "instructor",
  "level",
  "price",
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

const levelLabel: Record<CourseLevel, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export default function AdminCoursesClient() {
  const router = useRouter();
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
  const [pendingAction, setPendingAction] = useState<PendingCourseAction | null>(null);
  const filter = {
    ...(filters.search.trim() ? { search: filters.search.trim() } : {}),
    ...(filters.categoryId !== "ALL" ? { categoryId: filters.categoryId } : {}),
    ...(filters.instructorId !== "ALL" ? { instructorId: filters.instructorId } : {}),
    ...(filters.status !== "ALL" ? { status: filters.status } : {}),
    ...(filters.level !== "ALL" ? { level: filters.level } : {}),
    ...(filters.language !== "ALL" ? { language: filters.language } : {}),
    ...(filters.pricing !== "ALL" ? { pricingType: filters.pricing } : {}),
  };
  const sortFields: Record<string, string> = {
    identity: "TITLE",
    price: "PRICE",
    createdAt: "CREATED_AT",
    updatedAt: "UPDATED_AT",
  };
  const sort = table.sorting && sortFields[table.sorting.column]
    ? {
        field: sortFields[table.sorting.column],
        direction: table.sorting.direction.toUpperCase() as "ASC" | "DESC",
      }
    : undefined;
  const courseQuery = useAdminCourses(
    { page: table.page, limit: table.pageSize },
    filter,
    sort,
  );
  const statsQuery = useAdminCourseStats();
  const categoriesQuery = useCourseCategoryOptions();
  const instructorsQuery = useCourseInstructorOptions();
  const courses = courseQuery.data?.items ?? [];
  const categories = categoriesQuery.data ?? [];
  const instructors = instructorsQuery.data ?? [];
  const stats = statsQuery.data;
  const totalCourses = courseQuery.data?.meta.total ?? 0;
  const filteredCourses = courses;

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
        cell: (course) => (
          <span className="whitespace-nowrap">
            {course.categoryName ?? "—"}
          </span>
        ),
      },
      {
        id: "instructor",
        header: "Instructor",
        cell: (course) => (
          <span className="whitespace-nowrap">
            {course.instructorName ?? "—"}
          </span>
        ),
      },
      {
        id: "level",
        header: "Level",
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
        id: "status",
        header: "Status",
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
            onView={() => router.push(`/admin/courses/${course.id}`)}
            onEdit={() => router.push(`/admin/courses/${course.id}/edit`)}
            onCurriculum={() =>
              router.push(`/admin/courses/${course.id}/curriculum`)
            }
            onAction={(action) => setPendingAction({ action, course })}
            onNavigate={(href) => router.push(href)}
          />
        ),
      },
    ],
    [router],
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
        : filteredCourses;
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
        "Created",
        "Updated",
      ],
      records.map((course) => [
        course.title,
        course.slug,
        course.categoryName ?? "",
        course.instructorName ?? "",
        course.level,
        course.language,
        course.pricing.type === "FREE"
          ? "Free"
          : formatCoursePrice(
              course.pricing.priceMinorUnits,
              course.pricing.currency,
            ),
        course.status,
        course.createdAt,
        course.updatedAt,
      ]),
    );
    toast.success(`Exported ${records.length} loaded course records.`);
  };

  return (
    <section className="mx-auto w-full max-w-450 space-y-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <AdminPageHeader
        title="Courses"
        description="Manage, organize, and monitor your platform's learning content."
        actions={
          <>
            <AdminExportButton
              selectedCount={table.selectedIds.size}
              filteredCount={totalCourses}
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
      <AdminStatsGrid
        columns={5}
        stats={[
          {
            label: "Total courses",
            value: stats?.totalCourses ?? "—",
            description: "Across all course statuses",
            icon: BookOpen,
            tone: "primary",
          },
          {
            label: "Published",
            value: stats?.publishedCourses ?? "—",
            description: "Available to learners",
            icon: Star,
            tone: "green",
          },
          {
            label: "Drafts",
            value: stats?.draftCourses ?? "—",
            description: "Not yet submitted for review",
            icon: Layers3,
            tone: "violet",
          },
          {
            label: "Pending review",
            value: stats?.pendingReviewCourses ?? "—",
            description: "Waiting for an administrator",
            icon: CalendarDays,
            tone: "amber",
          },
          {
            label: "Archived",
            value: stats?.archivedCourses ?? "—",
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
                ...instructors.map((instructor) => ({
                  value: instructor.id,
                  label: instructor.name,
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

      {courseQuery.isError && (
        <AdminErrorState
          title="Courses could not be loaded"
          description={courseQuery.error.message}
        />
      )}
      <AdminDataTable
        rows={courses}
        columns={columns}
        getRowId={(course) => course.id}
        pagination={courseQuery.data?.meta ?? {
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
          table.setPage(1);
        }}
        selectedIds={table.selectedIds}
        onToggleRows={table.toggleRows}
        visibleColumnIds={shownColumns}
        onVisibleColumnsChange={setShownColumns}
        isLoading={courseQuery.isLoading}
        isPlaceholderData={courseQuery.isPlaceholderData}
        error={courseQuery.isError ? courseQuery.error.message : null}
        emptyTitle="No courses match these filters"
        emptyDescription="Try a different search or clear one or more filters."
      />

      <CourseLifecycleDialog
        pending={pendingAction}
        onClose={() => setPendingAction(null)}
        onComplete={({ action, course }) => {
          table.clearSelection();
          if (action === "restore" && course.status === "PUBLISHED") {
            router.push(`/admin/courses/${course.id}/edit`);
          }
        }}
      />
    </section>
  );
}

function CourseActions({
  course,
  onView,
  onEdit,
  onCurriculum,
  onAction,
  onNavigate,
}: {
  course: AdminCourse;
  onView: () => void;
  onEdit: () => void;
  onCurriculum: () => void;
  onAction: (action: CourseAdminAction) => void;
  onNavigate: (href: string) => void;
}) {
  const actions = getCourseAdminActions(course);
  const icons = { submit: Send, publish: Globe, archive: Archive, withdraw: Archive, restore: Pencil, featured: Star, delete: Trash2 };
  return (
    <DropdownMenu>
      <AdminTableActionTrigger label={`Actions for ${course.title}`} />
      <AdminTableActionContent className="w-56">
        <DropdownMenuItem onClick={onView}>
          <Eye size={14} aria-hidden="true" />
          View course
        </DropdownMenuItem>
        {canEditCourse(course.status) && (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil size={14} aria-hidden="true" />
            Edit course
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onCurriculum}>
          <BookOpen size={14} aria-hidden="true" />
          {canEditCourse(course.status) ? "Manage curriculum" : "View curriculum"}
        </DropdownMenuItem>
        {course.status === "PUBLISHED" && (
          <DropdownMenuItem onClick={() => onNavigate(`/courses/${course.slug}`)}>
            <Globe size={14} aria-hidden="true" />
            View public course
          </DropdownMenuItem>
        )}
        {course.status === "PENDING_REVIEW" && (
          <DropdownMenuItem onClick={() => onNavigate(`/admin/course-approvals?courseId=${course.id}`)}>
            <Eye size={14} aria-hidden="true" />
            Review course
          </DropdownMenuItem>
        )}
        {course.status === "REJECTED" && (
          <DropdownMenuItem onClick={() => onNavigate(`/admin/courses/${course.id}#review-history`)}>
            <Eye size={14} aria-hidden="true" />
            View feedback and history
          </DropdownMenuItem>
        )}
        {actions.length > 0 && <DropdownMenuSeparator />}
        {actions.map((action) => {
          const Icon = icons[action];
          return (
            <DropdownMenuItem
              key={action}
              onClick={() => onAction(action)}
              className={action === "delete" ? "text-destructive focus:text-destructive" : undefined}
            >
              <Icon size={14} aria-hidden="true" />
              {getCourseActionCopy(action, course).label}
            </DropdownMenuItem>
          );
        })}
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
