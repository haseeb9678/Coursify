"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MotionConfig } from "motion/react";

import AccessibilityWidget from "./AccessibilityWidget";
import { useAccessibleMotion } from "@/features/accessibility/hooks/use-accessible-motion";
import { useAccessibilityStore } from "@/features/accessibility/store/accessibility.store";

interface AccessibilityPanelContextValue {
  openPanel: () => void;
}

const AccessibilityPanelContext =
  createContext<AccessibilityPanelContextValue | null>(null);

export function useAccessibilityPanel() {
  const context = useContext(AccessibilityPanelContext);
  if (!context) {
    throw new Error(
      "useAccessibilityPanel must be used within AccessibilityProvider.",
    );
  }
  return context;
}

export default function AccessibilityProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const fontScale = useAccessibilityStore((state) => state.fontScale);
  const highContrast = useAccessibilityStore((state) => state.highContrast);
  const textSpacing = useAccessibilityStore((state) => state.textSpacing);
  const highlightLinks = useAccessibilityStore((state) => state.highlightLinks);
  const readableFont = useAccessibilityStore((state) => state.readableFont);
  const enhancedFocus = useAccessibilityStore((state) => state.enhancedFocus);
  const shouldReduceMotion = useAccessibleMotion();

  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const handleOpenChange = useCallback((open: boolean) => {
    setIsPanelOpen(open);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.fontScale = String(fontScale);
    root.dataset.highContrast = String(highContrast);
    root.dataset.textSpacing = String(textSpacing);
    root.dataset.highlightLinks = String(highlightLinks);
    root.dataset.reduceMotion = String(shouldReduceMotion);
    root.dataset.readableFont = String(readableFont);
    root.dataset.enhancedFocus = String(enhancedFocus);
  }, [
    enhancedFocus,
    fontScale,
    highContrast,
    highlightLinks,
    readableFont,
    shouldReduceMotion,
    textSpacing,
  ]);

  useEffect(() => {
    if (!useAccessibilityStore.persist.hasHydrated()) {
      void useAccessibilityStore.persist.rehydrate();
    }
  }, []);

  const contextValue = useMemo(
    () => ({ openPanel }),
    [openPanel],
  );

  return (
    <AccessibilityPanelContext.Provider value={contextValue}>
      <MotionConfig reducedMotion={shouldReduceMotion ? "always" : "never"}>
        {children}
        <AccessibilityWidget
          open={isPanelOpen}
          onOpenChange={handleOpenChange}
        />
      </MotionConfig>
    </AccessibilityPanelContext.Provider>
  );
}
