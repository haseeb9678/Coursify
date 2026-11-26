"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  Boxes,
  BrainCircuit,
  BriefcaseBusiness,
  CheckCircle2,
  Cloud,
  Code2,
  Database,
  Megaphone,
  Pencil,
  Plus,
  ShieldCheck,
  Smartphone,
  Tags,
  Trash2,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import AdminStatusBadge from "@/components/layouts/admin/shared/AdminStatusBadge";
import AdminTableToolbar from "@/components/layouts/admin/shared/AdminTableToolbar";
import CategoryFormDialog from "@/components/layouts/admin/categories/CategoryFormDialog";
import LearningSampleNotice from "@/components/layouts/admin/learning/LearningSampleNotice";
import { useAdminTableState } from "@/features/admin/hooks/use-admin-table-state";
import { useLearningDemoStore } from "@/features/admin/store/learning-demo.store";
import type {
  AdminCategory,
  AdminCourse,
  CategoryInput,
  CategoryStatus,
} from "@/features/admin/types/learning.types";
import {
  categoryCourseCount,
  filterLearningCategories,
  getCategoryStats,
} from "@/features/admin/utils/learning.utils";
import { downloadCsv, formatManagementDate, paginateRecords, sortRecords } from "@/features/admin/utils/management.utils";

const categoryIcons: Record<string, LucideIcon> = {
  code: Code2,
  mobile: Smartphone,
  data: Database,
  ai: BrainCircuit,
  security: ShieldCheck,
  cloud: Cloud,
  design: Tags,
  software: Boxes,
  business: BriefcaseBusiness,
  marketing: Megaphone,
  fundamentals: BookOpen,
  devops: Workflow,
};

const visibleColumns = [
  "identity",
  "slug",
  "courses",
  "status",
  "createdAt",
  "actions",
];

export default function AdminCategoriesClient() {
  const categories = useLearningDemoStore((state) => state.categories);
  const courses = useLearningDemoStore((state) => state.courses);
  const addCategory = useLearningDemoStore((state) => state.addCategory);
  const updateCategory = useLearningDemoStore((state) => state.updateCategory);
  const setCategoryStatus = useLearningDemoStore(
    (state) => state.setCategoryStatus,
  );
  const deleteCategory = useLearningDemoStore((state) => state.deleteCategory);
  const table = useAdminTableState();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CategoryStatus | "ALL">("ALL");
  const [shownColumns, setShownColumns] = useState(visibleColumns);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [detailsCategory, setDetailsCategory] = useState<AdminCategory | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);

  const filteredCategories = useMemo(
    () => filterLearningCategories(categories, { search, status }),
    [categories, search, status],
  );
  const sortedCategories = useMemo(
    () =>
      sortRecords(filteredCategories, table.sorting, (category, column) => {
        if (column === "name") return category.name;
        if (column === "createdAt") return category.createdAt;
        if (column === "courses") {
          return categoryCourseCount(category.id, courses);
        }
        return null;
      }),
    [courses, filteredCategories, table.sorting],
  );
  const page = paginateRecords(
    sortedCategories,
    table.page,
    table.pageSize,
  );
  const stats = getCategoryStats(categories, courses);

  const columns = useMemo<AdminTableColumn<AdminCategory>[]>(
    () => [
      {
        id: "identity",
        header: "Category",
        sortValue: (category) => category.name,
        cell: (category) => {
          const Icon = categoryIcons[category.iconKey] ?? Tags;
          return (
            <div className="flex min-w-48 items-center gap-3">
              {category.imageDataUrl ? (
                <Image
                  src={category.imageDataUrl}
                  alt=""
                  width={40}
                  height={40}
                  unoptimized
                  className="size-10 rounded-lg border border-brand-border object-cover"
                />
              ) : (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon size={18} aria-hidden="true" />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-semibold text-brand-text">
                  {category.name}
                </p>
                <p className="truncate text-[11px] text-brand-text-muted">
                  {category.description}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: "slug",
        header: "Slug",
        cell: (category) => (
          <code className="rounded bg-muted px-1.5 py-1 text-[11px] text-brand-text-muted">
            {category.slug}
          </code>
        ),
      },
      {
        id: "courses",
        header: "Courses",
        sortValue: (category) => categoryCourseCount(category.id, courses),
        cell: (category) => (
          <span className="tabular-nums">
            {categoryCourseCount(category.id, courses)}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: (category) => <AdminStatusBadge status={category.status} />,
      },
      {
        id: "createdAt",
        header: "Created",
        sortValue: (category) => category.createdAt,
        cell: (category) => (
          <span className="whitespace-nowrap text-brand-text-muted">
            {formatManagementDate(category.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        hideable: false,
        className: "w-14 text-right",
        cell: (category) => (
          <CategoryActions
            category={category}
            courseCount={categoryCourseCount(category.id, courses)}
            onView={() => setDetailsCategory(category)}
            onEdit={() => {
              setEditingCategory(category);
              setIsFormOpen(true);
            }}
            onToggleStatus={() => {
              const nextStatus =
                category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
              setCategoryStatus(category.id, nextStatus);
              toast.success(
                `${category.name} is now ${nextStatus.toLowerCase()}.`,
              );
            }}
            onDelete={() => setDeleteTarget(category)}
          />
        ),
      },
    ],
    [courses, setCategoryStatus],
  );

  const updateFilter = (nextSearch: string, nextStatus: string) => {
    setSearch(nextSearch);
    if (nextStatus === "ACTIVE" || nextStatus === "INACTIVE" || nextStatus === "ALL") {
      setStatus(nextStatus);
    }
    table.setPage(1);
    table.clearSelection();
  };

  const exportCategories = (mode: AdminExportMode) => {
    const records =
      mode === "selected"
        ? filteredCategories.filter((category) =>
            table.selectedIds.has(category.id),
          )
        : mode === "filtered"
          ? filteredCategories
          : categories;
    if (records.length === 0) return;
    downloadCsv(
      `coursify-categories-${mode}`,
      ["Name", "Slug", "Description", "Status", "Course count", "Created"],
      records.map((category) => [
        category.name,
        category.slug,
        category.description,
        category.status,
        categoryCourseCount(category.id, courses),
        category.createdAt,
      ]),
    );
    toast.success(`Exported ${records.length} category records from sample data.`);
  };

  const saveCategory = (input: CategoryInput) => {
    const saved = editingCategory
      ? updateCategory(editingCategory.id, input)
      : addCategory(input);
    if (!saved) {
      toast.error("That category slug is already in use.");
      return false;
    }
    toast.success(
      `${saved.name} ${editingCategory ? "updated" : "created"} in sample data.`,
    );
    setEditingCategory(null);
    return true;
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (!deleteCategory(deleteTarget.id)) {
      toast.error("Categories assigned to courses cannot be deleted.");
      return;
    }
    toast.success(`${deleteTarget.name} was removed from sample data.`);
    setDeleteTarget(null);
    table.clearSelection();
  };

  const onSort = (column: string) => {
    table.clearSelection();
    table.toggleSorting(column);
  };

  return (
    <section className="mx-auto w-full max-w-450 space-y-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <AdminPageHeader
        title="Categories"
        description="Manage and organize your platform's course categories."
        actions={
          <>
            <AdminExportButton
              selectedCount={table.selectedIds.size}
              filteredCount={filteredCategories.length}
              onExport={exportCategories}
            />
            <Button
              type="button"
              className="gap-2"
              onClick={() => {
                setEditingCategory(null);
                setIsFormOpen(true);
              }}
            >
              <Plus size={16} aria-hidden="true" />
              Add category
            </Button>
          </>
        }
      />
      <LearningSampleNotice />
      <AdminStatsGrid
        stats={[
          {
            label: "Total categories",
            value: stats.total,
            description: "Available catalog topics",
            icon: Tags,
            tone: "primary",
          },
          {
            label: "Active categories",
            value: stats.active,
            description: "Shown in course forms",
            icon: CheckCircle2,
            tone: "green",
          },
          {
            label: "Inactive categories",
            value: stats.inactive,
            description: "Hidden from new courses",
            icon: Boxes,
            tone: "amber",
          },
          {
            label: "Categorized courses",
            value: stats.categorizedCourses,
            description: "Courses with a category",
            icon: BookOpen,
            tone: "violet",
          },
        ]}
      />

      <AdminTableToolbar
        search={search}
        onSearchChange={(nextSearch) =>
          updateFilter(nextSearch, status)
        }
        searchPlaceholder="Search categories by name or slug..."
        searchLabel="Search categories"
        onClear={() => updateFilter("", "ALL")}
        filtersActive={search.trim() !== "" || status !== "ALL"}
        filters={
          <AdminFilterSelect
            label="Filter by category status"
            value={status}
            options={[
              { value: "ALL", label: "All statuses" },
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
            ]}
            onChange={(value) => updateFilter(search, value)}
          />
        }
      />

      <AdminDataTable
        rows={page.items}
        columns={columns}
        getRowId={(category) => category.id}
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
        onSort={onSort}
        selectedIds={table.selectedIds}
        onToggleRows={table.toggleRows}
        visibleColumnIds={shownColumns}
        onVisibleColumnsChange={setShownColumns}
        emptyTitle="No categories found"
        emptyDescription="Try a different search or clear the status filter."
      />

      <CategoryFormDialog
        key={editingCategory?.id ?? "new-category"}
        open={isFormOpen}
        category={editingCategory}
        categories={categories}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingCategory(null);
        }}
        onSave={saveCategory}
      />
      <CategoryDetailsSheet
        category={detailsCategory}
        courses={courses.filter(
          (course) => course.categoryId === detailsCategory?.id,
        )}
        onOpenChange={(open) => {
          if (!open) setDetailsCategory(null);
        }}
      />
      <AdminConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete category?"
        description={`Delete ${deleteTarget?.name ?? "this category"} from sample data? This action cannot be undone.`}
        confirmLabel="Delete category"
        isDestructive
        onConfirm={confirmDelete}
      />
    </section>
  );
}

function CategoryActions({
  category,
  courseCount,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  category: AdminCategory;
  courseCount: number;
  onView: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <AdminTableActionTrigger label={`Actions for ${category.name}`} />
      <AdminTableActionContent className="w-52">
        <DropdownMenuItem onClick={onView}>View details</DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Pencil size={14} aria-hidden="true" />
          Edit category
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onToggleStatus}>
          {category.status === "ACTIVE" ? "Deactivate" : "Activate"} category
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={courseCount > 0}
          title={
            courseCount > 0
              ? "Remove all associated courses before deleting this category."
              : undefined
          }
          onClick={onDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 size={14} aria-hidden="true" />
          {courseCount > 0 ? "Delete unavailable" : "Delete category"}
        </DropdownMenuItem>
      </AdminTableActionContent>
    </DropdownMenu>
  );
}

function CategoryDetailsSheet({
  category,
  courses,
  onOpenChange,
}: {
  category: AdminCategory | null;
  courses: readonly AdminCourse[];
  onOpenChange: (open: boolean) => void;
}) {
  const Icon = category ? categoryIcons[category.iconKey] ?? Tags : Tags;
  return (
    <Sheet open={category !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b border-brand-border pr-14">
          <SheetTitle>Category details</SheetTitle>
          <SheetDescription>
            Description and associated course records.
          </SheetDescription>
        </SheetHeader>
        {category && (
          <div className="space-y-5 p-5">
            <div className="flex items-center gap-3">
              {category.imageDataUrl ? (
                <Image
                  src={category.imageDataUrl}
                  alt=""
                  width={52}
                  height={52}
                  unoptimized
                  className="size-13 rounded-xl border border-brand-border object-cover"
                />
              ) : (
                <span className="flex size-13 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={21} aria-hidden="true" />
                </span>
              )}
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-brand-text">
                  {category.name}
                </h3>
                <code className="text-xs text-brand-text-muted">
                  {category.slug}
                </code>
              </div>
            </div>
            <AdminStatusBadge status={category.status} />
            <p className="text-sm leading-relaxed text-brand-text-muted">
              {category.description}
            </p>
            <div className="rounded-lg border border-brand-border bg-background p-3">
              <p className="text-xs font-medium text-brand-text">
                {courses.length} associated{" "}
                {courses.length === 1 ? "course" : "courses"}
              </p>
              {courses.length > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {courses.slice(0, 8).map((course) => (
                    <li
                      key={course.id}
                      className="truncate text-xs text-brand-text-muted"
                    >
                      {course.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {courses.length > 0 && (
              <p className="rounded-lg bg-muted px-3 py-2 text-xs text-brand-text-muted">
                This category cannot be deleted while courses are assigned to it.
                Reassign or remove those courses first.
              </p>
            )}
            <p className="text-[11px] text-brand-text-muted">
              Created {formatManagementDate(category.createdAt)} · Updated{" "}
              {formatManagementDate(category.updatedAt)}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
