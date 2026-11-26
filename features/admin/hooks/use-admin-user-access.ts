"use client";

import { useAuthStore } from "@/features/auth/store/auth.store";

export function useAdminUserAccess() {
  return useAuthStore((state) =>
    state.isInitialized &&
    state.isAuthenticated &&
    state.user?.role === "ADMIN"
      ? state.user.id
      : null,
  );
}
