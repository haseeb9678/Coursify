"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import AdminDialog from "./AdminDialog";

interface AdminConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  isDestructive?: boolean;
  isDisabled?: boolean;
  children?: ReactNode;
}

export default function AdminConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  isDestructive = false,
  isDisabled = false,
  children,
}: AdminConfirmDialogProps) {
  return (
    <AdminDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={isDestructive ? "destructive" : "default"}
            disabled={isDisabled}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </AdminDialog>
  );
}
