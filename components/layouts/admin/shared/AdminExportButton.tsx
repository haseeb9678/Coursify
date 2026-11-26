"use client";

import { ChevronDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type AdminExportMode =
  | "selected"
  | "filtered"
  | "all"
  | "current-page";

interface AdminExportButtonProps {
  selectedCount: number;
  filteredCount: number;
  currentPageCount?: number;
  isDisabled?: boolean;
  onExport: (mode: AdminExportMode) => void;
}

export default function AdminExportButton({
  selectedCount,
  filteredCount,
  currentPageCount,
  isDisabled = false,
  onExport,
}: AdminExportButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="min-w-36 justify-between font-semibold"
            disabled={isDisabled}
          >
            <span className="inline-flex items-center gap-2">
              <Download size={15} aria-hidden="true" />
              Export
            </span>
            <ChevronDown size={14} aria-hidden="true" />
          </Button>
        }
      />
      <DropdownMenuContent
        align="end"
        className="w-60 rounded-xl border-brand-border p-1.5"
      >
        <DropdownMenuItem
          disabled={isDisabled || selectedCount === 0}
          onClick={() => onExport("selected")}
          className="min-h-10 rounded-lg px-3 py-2.5"
        >
          Export selected ({selectedCount})
        </DropdownMenuItem>
        {currentPageCount === undefined ? (
          <>
            <DropdownMenuItem
              disabled={isDisabled || filteredCount === 0}
              onClick={() => onExport("filtered")}
              className="min-h-10 rounded-lg px-3 py-2.5"
            >
              Export filtered ({filteredCount})
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isDisabled}
              onClick={() => onExport("all")}
              className="min-h-10 rounded-lg px-3 py-2.5"
            >
              Export all sample records
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem
            disabled={isDisabled || currentPageCount === 0}
            onClick={() => onExport("current-page")}
            className="min-h-10 rounded-lg px-3 py-2.5"
          >
            Export current page ({currentPageCount})
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
