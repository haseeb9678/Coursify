"use client";

import type { ComponentProps } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "cn";

export function AdminTableActionTrigger({
  label,
  disabled = false,
  busy = false,
}: {
  label: string;
  disabled?: boolean;
  busy?: boolean;
}) {
  return (
    <DropdownMenuTrigger
      disabled={disabled || busy}
      render={
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9 rounded-xl border-brand-border bg-card text-brand-text shadow-sm transition-colors hover:border-primary/40 hover:bg-brand-soft hover:text-primary"
          aria-label={label}
          busy={busy}
        />
      }
    >
      <MoreHorizontal size={18} aria-hidden="true" />
    </DropdownMenuTrigger>
  );
}

export function AdminTableActionContent({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      align="end"
      className={cn(
        "rounded-xl border-brand-border bg-popover p-1.5 text-popover-foreground shadow-xl [&_[data-slot=dropdown-menu-item]]:min-h-10 [&_[data-slot=dropdown-menu-item]]:rounded-lg [&_[data-slot=dropdown-menu-item]]:px-3 [&_[data-slot=dropdown-menu-item]]:py-2",
        className,
      )}
      {...props}
    />
  );
}
