"use client";

import { useSyncExternalStore } from "react";

import { useAccessibilityStore } from "../store/accessibility.store";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToSystemPreference(onChange: () => void) {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getSystemPreference() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function getServerPreference() {
  return false;
}

export function useAccessibleMotion() {
  const userRequestsReducedMotion = useAccessibilityStore(
    (state) => state.reduceMotion,
  );
  const systemRequestsReducedMotion = useSyncExternalStore(
    subscribeToSystemPreference,
    getSystemPreference,
    getServerPreference,
  );

  return userRequestsReducedMotion || systemRequestsReducedMotion;
}
