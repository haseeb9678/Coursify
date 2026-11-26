import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ADMIN_PAGE_SIZES,
  type PaginationMeta,
} from "@/features/admin/types/management.types";

interface AdminTablePaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isDisabled?: boolean;
}

export default function AdminTablePagination({
  meta,
  onPageChange,
  onPageSizeChange,
  isDisabled = false,
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
          <Select
            value={String(meta.limit)}
            disabled={isDisabled}
            onValueChange={(value) => {
              if (value === null) return;
              const nextSize = Number(value);
              if (ADMIN_PAGE_SIZES.some((size) => size === nextSize)) {
                onPageSizeChange(nextSize);
              }
            }}
          >
            <SelectTrigger
            aria-label="Rows per page"
              size="sm"
              className="h-8 min-w-14 rounded-md border-brand-border bg-background px-2 text-xs text-brand-text"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              align="end"
              className="min-w-16 rounded-xl border-brand-border bg-popover p-1.5 text-popover-foreground shadow-lg"
            >
              {ADMIN_PAGE_SIZES.map((size) => (
                <SelectItem
                  key={size}
                  value={String(size)}
                  className="min-h-9 rounded-lg px-2.5 py-2 text-sm font-medium data-[highlighted]:bg-accent data-[selected]:bg-primary/10 data-[selected]:text-primary"
                >
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          disabled={isDisabled || !meta.hasPrevious}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft size={15} aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Next page"
          disabled={isDisabled || !meta.hasNext}
          onClick={() => onPageChange(meta.page + 1)}
        >
          <ChevronRight size={15} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
