import {
  ACCESSIBILITY_FONT_SCALES,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
} from "../constants/accessibility.constants";
import type {
  AccessibilityFontScale,
  AccessibilityPreferences,
} from "../types/accessibility.types";

export function normalizeAccessibilityPreferences(
  value: unknown,
): AccessibilityPreferences {
  if (!value || typeof value !== "object") {
    return DEFAULT_ACCESSIBILITY_PREFERENCES;
  }

  const saved = value as Partial<Record<keyof AccessibilityPreferences, unknown>>;
  const fontScale = ACCESSIBILITY_FONT_SCALES.find(
    (scale) => scale === saved.fontScale,
  );

  return {
    fontScale: fontScale ?? DEFAULT_ACCESSIBILITY_PREFERENCES.fontScale,
    highContrast:
      typeof saved.highContrast === "boolean"
        ? saved.highContrast
        : DEFAULT_ACCESSIBILITY_PREFERENCES.highContrast,
    textSpacing:
      typeof saved.textSpacing === "boolean"
        ? saved.textSpacing
        : DEFAULT_ACCESSIBILITY_PREFERENCES.textSpacing,
    highlightLinks:
      typeof saved.highlightLinks === "boolean"
        ? saved.highlightLinks
        : DEFAULT_ACCESSIBILITY_PREFERENCES.highlightLinks,
    reduceMotion:
      typeof saved.reduceMotion === "boolean"
        ? saved.reduceMotion
        : DEFAULT_ACCESSIBILITY_PREFERENCES.reduceMotion,
    readableFont:
      typeof saved.readableFont === "boolean"
        ? saved.readableFont
        : DEFAULT_ACCESSIBILITY_PREFERENCES.readableFont,
    enhancedFocus:
      typeof saved.enhancedFocus === "boolean"
        ? saved.enhancedFocus
        : DEFAULT_ACCESSIBILITY_PREFERENCES.enhancedFocus,
  };
}

export function getAdjacentFontScale(
  current: AccessibilityFontScale,
  direction: "increase" | "decrease",
): AccessibilityFontScale {
  const currentIndex = ACCESSIBILITY_FONT_SCALES.indexOf(current);
  const nextIndex =
    direction === "increase"
      ? Math.min(currentIndex + 1, ACCESSIBILITY_FONT_SCALES.length - 1)
      : Math.max(currentIndex - 1, 0);

  return ACCESSIBILITY_FONT_SCALES[nextIndex];
}
