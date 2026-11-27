"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { commerceApi } from "./commerce.api";
import { commerceKeys } from "./commerce-cache";

export function useStudentId() {
  return useAuthStore((state) =>
    state.isInitialized && state.user?.role === "STUDENT" && state.user.status === "ACTIVE"
      ? state.user.id
      : undefined,
  );
}

export function useStudentCommerceStats(userId: string | undefined) {
  return useQuery({
    queryKey: [...commerceKeys.scope("student", userId), "stats"],
    queryFn: commerceApi.studentStats,
    enabled: !!userId,
    retry: false,
  });
}
