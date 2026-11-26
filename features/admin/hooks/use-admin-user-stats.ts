"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminUserStats } from "@/features/admin/api/users.api";
import { adminUsersKeys } from "@/features/admin/constants/users.constants";
import { useAdminUserAccess } from "@/features/admin/hooks/use-admin-user-access";
import { shouldRetryAdminQuery } from "@/features/admin/utils/users.utils";

export function useAdminUserStats() {
  const adminId = useAdminUserAccess();

  return useQuery({
    queryKey: adminUsersKeys.stats(adminId),
    queryFn: getAdminUserStats,
    enabled: adminId !== null,
    staleTime: 60 * 1000,
    retry: shouldRetryAdminQuery,
  });
}
