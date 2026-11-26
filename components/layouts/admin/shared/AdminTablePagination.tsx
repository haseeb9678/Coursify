import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ADMIN_PAGE_SIZES,
  type PaginationMeta,
} from "@/features/admin/types/management.types";

interface AdminTablePaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function AdminTablePagination({
  meta,
  onPageChange,
  onPageSizeChange,
}: AdminTablePaginationProps) {
  const first = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const last = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="flex flex-col gap-3 border-t border-brand-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-brand-text-muted">
        <span>
          Showing <span className="font-semibold text-brand-text">{first}-{last}</span> of{" "}
          <span className="font-semibold text-brand-text">{meta.total}</span>
        </span>
        <label className="flex items-center gap-2">
          Rows per page
          <select
            aria-label="Rows per page"
            value={meta.limit}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-8 rounded-md border border-brand-border bg-background px-2 text-xs text-brand-text outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {ADMIN_PAGE_SIZES.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-2">
        <span className="mr-1 text-xs text-brand-text-muted">
          Page {meta.totalPages === 0 ? 0 : meta.page} of {meta.totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Previous page"
          disabled={!meta.hasPrevious}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft size={15} aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Next page"
          disabled={!meta.hasNext}
          onClick={() => onPageChange(meta.page + 1)}
        >
          <ChevronRight size={15} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
