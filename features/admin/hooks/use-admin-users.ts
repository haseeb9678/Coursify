"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAdminUsers } from "@/features/admin/api/users.api";
import { adminUsersKeys } from "@/features/admin/constants/users.constants";
import type { AdminUsersVariables } from "@/features/admin/types/users.types";
import { useAdminUserAccess } from "@/features/admin/hooks/use-admin-user-access";
import {
  normalizeAdminUsersVariables,
  shouldRetryAdminQuery,
} from "@/features/admin/utils/users.utils";

export function useAdminUsers(variables: AdminUsersVariables) {
  const adminId = useAdminUserAccess();
  const normalizedVariables = normalizeAdminUsersVariables(variables);

  return useQuery({
    queryKey: adminUsersKeys.list(adminId, normalizedVariables),
    queryFn: () => getAdminUsers(normalizedVariables),
    enabled: adminId !== null,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
    retry: shouldRetryAdminQuery,
  });
}
