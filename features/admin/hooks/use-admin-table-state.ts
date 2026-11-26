"use client";

import { useCallback, useState } from "react";
import type { TableSorting } from "@/features/admin/types/management.types";

export function useAdminTableState(defaultPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(defaultPageSize);
  const [sorting, setSorting] = useState<TableSorting | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const changePageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1);
  }, []);

  const toggleSorting = useCallback((column: string) => {
    setPage(1);
    setSorting((current) =>
      current?.column === column
        ? { column, direction: current.direction === "asc" ? "desc" : "asc" }
        : { column, direction: "asc" },
    );
  }, []);

  const toggleRows = useCallback((ids: string[], checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      ids.forEach((id) => (checked ? next.add(id) : next.delete(id)));
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  return {
    page,
    setPage,
    pageSize,
    setPageSize: changePageSize,
    sorting,
    toggleSorting,
    selectedIds,
    toggleRows,
    clearSelection,
  };
}
