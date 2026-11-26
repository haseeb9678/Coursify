"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateAdminUserRole } from "@/features/admin/api/users.api";
import { adminUsersKeys } from "@/features/admin/constants/users.constants";
import type { AdminUpdateUserRoleInput } from "@/features/admin/types/users.types";
import { useAdminUserAccess } from "@/features/admin/hooks/use-admin-user-access";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";

export function useAdminUpdateUserRole() {
  const queryClient = useQueryClient();
  const adminId = useAdminUserAccess();

  return useMutation({
    mutationFn: (input: AdminUpdateUserRoleInput) =>
      updateAdminUserRole(input),
    retry: false,
    onSuccess: async (response) => {
      if (adminId) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: adminUsersKeys.lists(adminId),
          }),
          queryClient.invalidateQueries({
            queryKey: adminUsersKeys.stats(adminId),
          }),
          queryClient.invalidateQueries({
            queryKey: adminUsersKeys.detail(adminId, response.user.id),
          }),
          queryClient.invalidateQueries({
            queryKey: adminUsersKeys.sessionLists(adminId, response.user.id),
          }),
        ]);
      }

      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getGraphQLErrorMessage(error));
    },
  });
}
