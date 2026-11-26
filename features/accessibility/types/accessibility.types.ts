export type AccessibilityFontScale = 100 | 112.5 | 125 | 150 | 200;

export interface AccessibilityPreferences {
  fontScale: AccessibilityFontScale;
  highContrast: boolean;
  textSpacing: boolean;
  highlightLinks: boolean;
  reduceMotion: boolean;
  readableFont: boolean;
  enhancedFocus: boolean;
}

export type AccessibilityTogglePreference = Exclude<
  keyof AccessibilityPreferences,
  "fontScale"
>;
