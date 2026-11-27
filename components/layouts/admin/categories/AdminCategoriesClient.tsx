"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  Boxes,
  BriefcaseBusiness,
  Camera,
  ChartNoAxesColumn,
  CheckCircle2,
  Code2,
  Megaphone,
  PenTool,
  Pencil,
  Plus,
  Tags,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";
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
import AdminErrorState from "@/components/layouts/admin/shared/AdminErrorState";
import { useAdminTableState } from "@/features/admin/hooks/use-admin-table-state";
import {
  useAdminCategories,
  useAdminCategoryStats,
  useCreateAdminCategory,
  useDeleteAdminCategory,
  useUpdateAdminCategory,
  useUpdateAdminCategoryStatus,
} from "@/features/admin/hooks/use-admin-learning";
import type {
  AdminCategory,
  CategoryInput,
  CategoryStatus,
} from "@/features/admin/types/learning.types";
import { downloadCsv, formatManagementDate } from "@/features/admin/utils/management.utils";

const categoryIcons: Record<string, LucideIcon> = {
  PenTool,
  Code2,
  Megaphone,
  BriefcaseBusiness,
  Camera,
  ChartNoAxesColumn,
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

  const filter = {
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(status !== "ALL" ? { status } : {}),
  };
  const sortFields: Record<string, string> = {
    identity: "NAME",
    createdAt: "CREATED_AT",
    courses: "COURSE_COUNT",
  };
  const categoryQuery = useAdminCategories(
    { page: table.page, limit: table.pageSize },
    filter,
    table.sorting
      ? {
          field: sortFields[table.sorting.column] ?? "CREATED_AT",
          direction: table.sorting.direction.toUpperCase() as "ASC" | "DESC",
        }
      : undefined,
  );
  const statsQuery = useAdminCategoryStats();
  const createCategory = useCreateAdminCategory();
  const editCategory = useUpdateAdminCategory();
  const changeCategoryStatus = useUpdateAdminCategoryStatus();
  const removeCategory = useDeleteAdminCategory();
  const categories = categoryQuery.data?.items ?? [];
  const stats = statsQuery.data;

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
        sortValue: (category) => category.courseCount ?? 0,
        cell: (category) => (
          <span className="tabular-nums">
            {category.courseCount ?? 0}
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
            statusBusy={changeCategoryStatus.isPending && changeCategoryStatus.variables?.id === category.id}
            disabled={changeCategoryStatus.isPending}
            courseCount={category.courseCount ?? 0}
            onView={() => setDetailsCategory(category)}
            onEdit={() => {
              setEditingCategory(category);
              setIsFormOpen(true);
            }}
            onToggleStatus={() => {
              if (changeCategoryStatus.isPending) return;
              const nextStatus = category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
              changeCategoryStatus.mutate(
                { id: category.id, status: nextStatus },
                {
                  onSuccess: () => toast.success(`${category.name} is now ${nextStatus.toLowerCase()}.`),
                  onError: (error) => toast.error(getGraphQLErrorMessage(error)),
                },
              );
            }}
            onDelete={() => setDeleteTarget(category)}
          />
        ),
      },
    ],
    [changeCategoryStatus],
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
        ? categories.filter((category) =>
            table.selectedIds.has(category.id),
          )
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
        category.courseCount ?? 0,
        category.createdAt,
      ]),
    );
    toast.success(`Exported ${records.length} category records.`);
  };

  const saveCategory = async (input: CategoryInput) => {
    const backendInput = {
      name: input.name,
      slug: input.slug,
      description: input.description,
      status: input.status,
      iconName: input.iconKey,
      iconColor: editingCategory?.iconColor ?? "#2563EB",
      iconBackground: editingCategory?.iconBackground ?? "#DBEAFE",
      imageUrl: input.imageDataUrl,
    };
    try {
      if (editingCategory) {
        await editCategory.mutateAsync({ ...backendInput, id: editingCategory.id });
      } else {
        await createCategory.mutateAsync(backendInput);
      }
      toast.success(`Category ${editingCategory ? "updated" : "created"}.`);
      setEditingCategory(null);
      return true;
    } catch (error) {
      toast.error(getGraphQLErrorMessage(error));
      return false;
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeCategory.mutateAsync(deleteTarget.id);
      toast.success(`${deleteTarget.name} was deleted.`);
      setDeleteTarget(null);
      table.clearSelection();
    } catch (error) {
      toast.error(getGraphQLErrorMessage(error));
    }
  };

  const onSort = (column: string) => {
    table.clearSelection();
    table.toggleSorting(column);
    table.setPage(1);
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
              filteredCount={categoryQuery.data?.meta.total ?? 0}
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
      <AdminStatsGrid
        stats={[
          {
            label: "Total categories",
            value: stats?.totalCategories ?? "—",
            description: "Available catalog topics",
            icon: Tags,
            tone: "primary",
          },
          {
            label: "Active categories",
            value: stats?.activeCategories ?? "—",
            description: "Shown in course forms",
            icon: CheckCircle2,
            tone: "green",
          },
          {
            label: "Inactive categories",
            value: stats?.inactiveCategories ?? "—",
            description: "Hidden from new courses",
            icon: Boxes,
            tone: "amber",
          },
          {
            label: "Categorized courses",
            value: stats?.categorizedCourses ?? "—",
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

      {categoryQuery.isError && (
        <AdminErrorState
          title="Categories could not be loaded"
          description={categoryQuery.error.message}
        />
      )}
      <AdminDataTable
        rows={categories}
        columns={columns}
        getRowId={(category) => category.id}
        pagination={categoryQuery.data?.meta ?? {
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
        onSort={onSort}
        selectedIds={table.selectedIds}
        onToggleRows={table.toggleRows}
        visibleColumnIds={shownColumns}
        onVisibleColumnsChange={setShownColumns}
        isLoading={categoryQuery.isLoading}
        isPlaceholderData={categoryQuery.isPlaceholderData}
        error={categoryQuery.isError ? categoryQuery.error.message : null}
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
        courseCount={detailsCategory?.courseCount ?? 0}
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
        description={`Delete ${deleteTarget?.name ?? "this category"}? This action cannot be undone.`}
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
  statusBusy,
  disabled,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  category: AdminCategory;
  courseCount: number;
  statusBusy: boolean;
  disabled: boolean;
  onView: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <AdminTableActionTrigger label={`Actions for ${category.name}`} busy={statusBusy} disabled={disabled} />
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
  courseCount,
  onOpenChange,
}: {
  category: AdminCategory | null;
  courseCount: number;
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
                {courseCount} associated{" "}
                {courseCount === 1 ? "course" : "courses"}
              </p>
            </div>
            {courseCount > 0 && (
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
