"use client";

import { toast } from "sonner";
import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import AdminDialog from "./AdminDialog";

interface AdminConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void | Promise<void>;
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
  const submitting = useRef(false);
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    if (submitting.current || isDisabled) return;
    submitting.current = true;
    setBusy(true);
    try {
      await onConfirm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The action failed.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };

  return (
    <AdminDialog
      open={open}
      busy={busy}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button type="button" variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={isDestructive ? "destructive" : "default"}
            disabled={isDisabled}
            busy={busy}
            onClick={() => void confirm()}
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
