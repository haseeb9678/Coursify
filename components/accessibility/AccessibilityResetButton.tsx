"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAccessibilityStore } from "@/features/accessibility/store/accessibility.store";

export default function AccessibilityResetButton() {
  const resetPreferences = useAccessibilityStore(
    (state) => state.resetPreferences,
  );

  return (
    <Button
      type="button"
      variant="outline"
      onClick={resetPreferences}
      className="w-full justify-center gap-2"
    >
      <RotateCcw aria-hidden="true" className="size-4" />
      Reset all preferences
    </Button>
  );
}
