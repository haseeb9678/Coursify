import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminSearchInput from "./AdminSearchInput";

interface AdminTableToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchLabel: string;
  onClear: () => void;
  filtersActive: boolean;
  filters?: ReactNode;
  actions?: ReactNode;
}

export default function AdminTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  searchLabel,
  onClear,
  filtersActive,
  filters,
  actions,
}: AdminTableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-brand-border bg-card p-3 sm:p-4">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <AdminSearchInput
          value={search}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          label={searchLabel}
        />
        {filters && (
          <div className="flex flex-wrap items-center gap-2">{filters}</div>
        )}
        {actions && <div className="flex items-center gap-2 lg:ml-auto">{actions}</div>}
      </div>
      {filtersActive && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-8 gap-1.5 text-xs text-brand-text-muted"
          >
            <RotateCcw size={13} aria-hidden="true" />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
