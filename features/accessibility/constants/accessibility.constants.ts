import type {
  AccessibilityFontScale,
  AccessibilityPreferences,
} from "../types/accessibility.types";

export const ACCESSIBILITY_STORAGE_KEY =
  "coursify-accessibility-preferences";

export const ACCESSIBILITY_FONT_SCALES = [
  100,
  112.5,
  125,
  150,
  200,
] as const satisfies readonly AccessibilityFontScale[];

export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferences = {
  fontScale: 100,
  highContrast: false,
  textSpacing: false,
  highlightLinks: false,
  reduceMotion: false,
  readableFont: false,
  enhancedFocus: false,
};
