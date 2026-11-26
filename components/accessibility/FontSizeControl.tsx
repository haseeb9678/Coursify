"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ACCESSIBILITY_FONT_SCALES,
} from "@/features/accessibility/constants/accessibility.constants";
import { useAccessibilityStore } from "@/features/accessibility/store/accessibility.store";

const SCALE_LABELS: Record<(typeof ACCESSIBILITY_FONT_SCALES)[number], string> = {
  100: "Normal",
  112.5: "Medium",
  125: "Large",
  150: "Extra Large",
  200: "Maximum",
};

export default function FontSizeControl() {
  const fontScale = useAccessibilityStore((state) => state.fontScale);
  const increaseFontScale = useAccessibilityStore(
    (state) => state.increaseFontScale,
  );
  const decreaseFontScale = useAccessibilityStore(
    (state) => state.decreaseFontScale,
  );
  const currentIndex = ACCESSIBILITY_FONT_SCALES.indexOf(fontScale);

  return (
    <section
      aria-labelledby="accessibility-text-size"
      className="rounded-xl border border-border bg-card p-[16px]"
    >
      <div className="flex flex-col gap-[12px] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3
            id="accessibility-text-size"
            className="text-sm font-semibold text-foreground"
          >
            Text size
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {SCALE_LABELS[fontScale]} · {fontScale}%
          </p>
        </div>
        <div className="flex items-center gap-2 sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Decrease text size"
            onClick={decreaseFontScale}
            disabled={currentIndex === 0}
          >
            <Minus aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Increase text size"
            onClick={increaseFontScale}
            disabled={currentIndex === ACCESSIBILITY_FONT_SCALES.length - 1}
          >
            <Plus aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div
        className="mt-[16px] rounded-lg bg-muted/60 p-[12px] text-foreground"
        aria-live="polite"
      >
        <p className="text-sm font-semibold">Readable text preview</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Adjust text size to make course descriptions and learning materials
          easier to read.
        </p>
      </div>
    </section>
  );
}
