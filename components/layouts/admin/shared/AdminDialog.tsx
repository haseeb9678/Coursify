"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectPortalContainerProvider } from "@/components/ui/select";

interface AdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
} as const;

export default function AdminDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
}: AdminDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClose={() => {
        if (open) onOpenChange(false);
      }}
      className={`fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] ${sizes[size]} overflow-visible rounded-2xl border border-brand-border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-black/50`}
    >
      <SelectPortalContainerProvider containerRef={dialogRef}>
        <div className="max-h-[90dvh] overflow-y-auto rounded-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-brand-border px-5 py-4">
            <div>
              <h2 id={titleId} className="text-base font-semibold text-brand-text">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="mt-1 text-xs text-brand-text-muted">
                  {description}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Close dialog"
              onClick={() => onOpenChange(false)}
            >
              <X size={16} aria-hidden="true" />
            </Button>
          </div>
          <div className="px-5 py-4">{children}</div>
          {footer && (
            <div className="flex justify-end gap-2 border-t border-brand-border px-5 py-4">
              {footer}
            </div>
          )}
        </div>
      </SelectPortalContainerProvider>
    </dialog>
  );
}
