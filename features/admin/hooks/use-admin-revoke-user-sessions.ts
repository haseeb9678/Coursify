"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { revokeAdminUserSessions } from "@/features/admin/api/users.api";
import { adminUsersKeys } from "@/features/admin/constants/users.constants";
import type { AdminRevokeSessionsInput } from "@/features/admin/types/users.types";
import { useAdminUserAccess } from "@/features/admin/hooks/use-admin-user-access";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";

export function useAdminRevokeUserSessions() {
  const queryClient = useQueryClient();
  const adminId = useAdminUserAccess();

  return useMutation({
    mutationFn: (input: AdminRevokeSessionsInput) =>
      revokeAdminUserSessions(input),
    retry: false,
    onSuccess: async (response, input) => {
      if (adminId) {
        await queryClient.invalidateQueries({
          queryKey: adminUsersKeys.sessionLists(adminId, input.userId),
        });
      }

      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getGraphQLErrorMessage(error));
    },
  });
}
