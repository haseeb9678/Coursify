"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type AdminExportMode = "selected" | "filtered" | "all";

interface AdminExportButtonProps {
  selectedCount: number;
  filteredCount: number;
  onExport: (mode: AdminExportMode) => void;
}

export default function AdminExportButton({
  selectedCount,
  filteredCount,
  onExport,
}: AdminExportButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button type="button" variant="outline" className="gap-2">
            <Download size={15} aria-hidden="true" />
            Export
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          disabled={selectedCount === 0}
          onClick={() => onExport("selected")}
        >
          Export selected ({selectedCount})
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={filteredCount === 0}
          onClick={() => onExport("filtered")}
        >
          Export filtered ({filteredCount})
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport("all")}>
          Export all sample records
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
