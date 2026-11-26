"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminUser } from "@/features/admin/api/users.api";
import { adminUsersKeys } from "@/features/admin/constants/users.constants";
import { useAdminUserAccess } from "@/features/admin/hooks/use-admin-user-access";
import { shouldRetryAdminQuery } from "@/features/admin/utils/users.utils";

export function useAdminUser(
  userId: string | null,
  enabled = true,
) {
  const adminId = useAdminUserAccess();

  return useQuery({
    queryKey: adminUsersKeys.detail(adminId, userId),
    queryFn: () => {
      if (!userId) {
        throw new Error("A user ID is required to load user details.");
      }

      return getAdminUser({ userId });
    },
    enabled: adminId !== null && enabled && userId !== null,
    staleTime: 30 * 1000,
    retry: shouldRetryAdminQuery,
  });
}
