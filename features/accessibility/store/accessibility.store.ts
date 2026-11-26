import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  ACCESSIBILITY_FONT_SCALES,
  ACCESSIBILITY_STORAGE_KEY,
  DEFAULT_ACCESSIBILITY_PREFERENCES,
} from "../constants/accessibility.constants";
import type {
  AccessibilityFontScale,
  AccessibilityPreferences,
  AccessibilityTogglePreference,
} from "../types/accessibility.types";
import {
  getAdjacentFontScale,
  normalizeAccessibilityPreferences,
} from "../utils/accessibility.utils";

interface AccessibilityStore extends AccessibilityPreferences {
  setFontScale: (fontScale: AccessibilityFontScale) => void;
  increaseFontScale: () => void;
  decreaseFontScale: () => void;
  toggleHighContrast: () => void;
  toggleTextSpacing: () => void;
  toggleHighlightLinks: () => void;
  toggleReduceMotion: () => void;
  toggleReadableFont: () => void;
  toggleEnhancedFocus: () => void;
  resetPreferences: () => void;
}

function togglePreference(
  key: AccessibilityTogglePreference,
  set: (partial: Partial<AccessibilityStore>) => void,
  get: () => AccessibilityStore,
) {
  set({ [key]: !get()[key] });
}

export const useAccessibilityStore = create<AccessibilityStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_ACCESSIBILITY_PREFERENCES,
      setFontScale: (fontScale) => {
        if (ACCESSIBILITY_FONT_SCALES.includes(fontScale)) {
          set({ fontScale });
        }
      },
      increaseFontScale: () =>
        set({
          fontScale: getAdjacentFontScale(get().fontScale, "increase"),
        }),
      decreaseFontScale: () =>
        set({
          fontScale: getAdjacentFontScale(get().fontScale, "decrease"),
        }),
      toggleHighContrast: () => togglePreference("highContrast", set, get),
      toggleTextSpacing: () => togglePreference("textSpacing", set, get),
      toggleHighlightLinks: () => togglePreference("highlightLinks", set, get),
      toggleReduceMotion: () => togglePreference("reduceMotion", set, get),
      toggleReadableFont: () => togglePreference("readableFont", set, get),
      toggleEnhancedFocus: () => togglePreference("enhancedFocus", set, get),
      resetPreferences: () => set(DEFAULT_ACCESSIBILITY_PREFERENCES),
    }),
    {
      name: ACCESSIBILITY_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        fontScale: state.fontScale,
        highContrast: state.highContrast,
        textSpacing: state.textSpacing,
        highlightLinks: state.highlightLinks,
        reduceMotion: state.reduceMotion,
        readableFont: state.readableFont,
        enhancedFocus: state.enhancedFocus,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...normalizeAccessibilityPreferences(persistedState),
      }),
    },
  ),
);
