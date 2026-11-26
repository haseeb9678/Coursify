"use client";

import AccessibilityPanel from "./AccessibilityPanel";

export default function AccessibilityWidget({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AccessibilityPanel open={open} onOpenChange={onOpenChange} />
  );
}
