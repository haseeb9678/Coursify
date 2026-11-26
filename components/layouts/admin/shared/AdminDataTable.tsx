"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type {
  PaginationMeta,
  TableSorting,
} from "@/features/admin/types/management.types";
import AdminErrorState from "./AdminErrorState";
import AdminEmptyState from "./AdminEmptyState";
import AdminTablePagination from "./AdminTablePagination";

export interface AdminTableColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number | null;
  hideable?: boolean;
  className?: string;
}

interface AdminDataTableProps<T> {
  rows: readonly T[];
  columns: readonly AdminTableColumn<T>[];
  getRowId: (row: T) => string;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  sorting: TableSorting | null;
  onSort: (column: string) => void;
  selectedIds: ReadonlySet<string>;
  onToggleRows: (ids: string[], checked: boolean) => void;
  visibleColumnIds: readonly string[];
  onVisibleColumnsChange: (columnIds: string[]) => void;
  isLoading?: boolean;
  isPlaceholderData?: boolean;
  isSelectionDisabled?: boolean;
  isPaginationDisabled?: boolean;
  error?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
}

export default function AdminDataTable<T>({
  rows,
  columns,
  getRowId,
  pagination,
  onPageChange,
  onPageSizeChange,
  sorting,
  onSort,
  selectedIds,
  onToggleRows,
  visibleColumnIds,
  onVisibleColumnsChange,
  isLoading = false,
  isPlaceholderData = false,
  isSelectionDisabled = false,
  isPaginationDisabled = false,
  error = null,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your search or filters.",
}: AdminDataTableProps<T>) {
  const visibleColumns = columns.filter(
    (column) => column.hideable === false || visibleColumnIds.includes(column.id),
  );
  const selectableColumns = columns.filter((column) => column.hideable !== false);
  const rowIds = rows.map(getRowId);
  const selectedOnPage = rowIds.filter((id) => selectedIds.has(id)).length;
  const allSelected = rowIds.length > 0 && selectedOnPage === rowIds.length;
  const partiallySelected = selectedOnPage > 0 && !allSelected;

  return (
    <section className="overflow-hidden rounded-xl border border-brand-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-brand-border px-4 py-3">
        <p className="text-xs text-brand-text-muted" aria-live="polite">
          {selectedIds.size > 0
            ? `${selectedIds.size} selected`
            : `${pagination.total} records`}
        </p>
        <details className="group relative">
          <summary className="cursor-pointer list-none rounded-lg border border-brand-border px-3 py-1.5 text-xs font-medium text-brand-text transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
            Columns
          </summary>
          <div className="absolute right-0 z-30 mt-2 max-h-72 w-52 overflow-y-auto rounded-xl border border-brand-border bg-popover p-2 text-popover-foreground shadow-lg">
            {selectableColumns.map((column) => (
              <label
                key={column.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs hover:bg-accent"
              >
                <Checkbox
                  checked={visibleColumnIds.includes(column.id)}
                  onCheckedChange={(checked) => {
                    const next = new Set(visibleColumnIds);
                    if (checked === true) next.add(column.id);
                    else next.delete(column.id);
                    onVisibleColumnsChange([...next]);
                  }}
                  aria-label={`Show ${column.header} column`}
                />
                <span>{column.header}</span>
              </label>
            ))}
          </div>
        </details>
      </div>

      {error ? (
        <AdminErrorState title="Records could not be displayed" description={error} />
      ) : rows.length === 0 && !isLoading ? (
        <AdminEmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div
          className={`overflow-x-auto ${isPlaceholderData ? "opacity-60" : ""}`}
          aria-busy={isPlaceholderData}
        >
          <table className="w-full min-w-[880px] border-collapse text-left text-xs">
            <thead className="bg-brand-page-secondary/70">
              <tr className="border-b border-brand-border">
                <th scope="col" className="w-11 px-4 py-3">
                  <span className="relative flex size-4">
                    <Checkbox
                      checked={allSelected}
                      disabled={isSelectionDisabled}
                      aria-checked={partiallySelected ? "mixed" : allSelected}
                      onCheckedChange={(checked) =>
                        onToggleRows(rowIds, checked !== false)
                      }
                      aria-label="Select all rows on this page"
                      className={partiallySelected ? "border-primary" : ""}
                    />
                    {partiallySelected && (
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
                        <span className="h-0.5 w-2 rounded-full bg-primary" />
                      </span>
                    )}
                  </span>
                </th>
                {visibleColumns.map((column) => (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={
                      sorting?.column === column.id
                        ? sorting.direction === "asc" ? "ascending" : "descending"
                        : "none"
                    }
                    className={`whitespace-nowrap px-4 py-3 font-semibold text-brand-text-muted ${column.className ?? ""}`}
                  >
                    {column.sortValue ? (
                      <button
                        type="button"
                        onClick={() => onSort(column.id)}
                        className="inline-flex items-center gap-1.5 text-left hover:text-brand-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {column.header}
                        {sorting?.column === column.id ? (
                          sorting.direction === "asc"
                            ? <ArrowUp size={13} aria-hidden="true" />
                            : <ArrowDown size={13} aria-hidden="true" />
                        ) : (
                          <ArrowUpDown size={13} aria-hidden="true" className="opacity-50" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, rowIndex) => (
                  <tr key={`loading-${rowIndex}`}>
                    <td colSpan={visibleColumns.length + 1} className="px-4 py-5">
                      <div className="h-4 animate-pulse rounded bg-brand-soft motion-reduce:animate-none" />
                    </td>
                  </tr>
                ))
              ) : (
                rows.map((row) => {
                  const id = getRowId(row);
                  return (
                    <tr
                      key={id}
                      className="transition-colors hover:bg-brand-page-secondary/60"
                    >
                      <td className="px-4 py-3.5">
                        <Checkbox
                          checked={selectedIds.has(id)}
                          disabled={isSelectionDisabled}
                          onCheckedChange={(checked) => onToggleRows([id], checked === true)}
                          aria-label={`Select row ${id}`}
                        />
                      </td>
                      {visibleColumns.map((column) => (
                        <td key={column.id} className={`px-4 py-3.5 text-brand-text ${column.className ?? ""}`}>
                          {column.cell(row)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      <AdminTablePagination
        meta={pagination}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        isDisabled={isPaginationDisabled}
      />
    </section>
  );
}
