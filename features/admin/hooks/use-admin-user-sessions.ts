"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAdminUserSessions } from "@/features/admin/api/users.api";
import {
  ADMIN_SESSIONS_PAGE_SIZE,
  adminUsersKeys,
} from "@/features/admin/constants/users.constants";
import { useAdminUserAccess } from "@/features/admin/hooks/use-admin-user-access";
import { shouldRetryAdminQuery } from "@/features/admin/utils/users.utils";

export function useAdminUserSessions(
  userId: string | null,
  page: number,
  enabled = true,
) {
  const adminId = useAdminUserAccess();

  return useQuery({
    queryKey: adminUsersKeys.sessions(
      adminId,
      userId,
      page,
      ADMIN_SESSIONS_PAGE_SIZE,
    ),
    queryFn: () => {
      if (!userId) {
        throw new Error("A user ID is required to load sessions.");
      }

      return getAdminUserSessions({
        userId,
        pagination: {
          page,
          limit: ADMIN_SESSIONS_PAGE_SIZE,
        },
      });
    },
    enabled: adminId !== null && enabled && userId !== null,
    staleTime: 15 * 1000,
    placeholderData: keepPreviousData,
    retry: shouldRetryAdminQuery,
  });
}
