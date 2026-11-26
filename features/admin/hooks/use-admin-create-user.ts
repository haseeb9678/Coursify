"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createAdminUser } from "@/features/admin/api/users.api";
import { adminUsersKeys } from "@/features/admin/constants/users.constants";
import type { AdminCreateUserInput } from "@/features/admin/types/users.types";
import { useAdminUserAccess } from "@/features/admin/hooks/use-admin-user-access";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";

export function useAdminCreateUser() {
  const queryClient = useQueryClient();
  const adminId = useAdminUserAccess();

  return useMutation({
    mutationFn: (input: AdminCreateUserInput) => createAdminUser(input),
    retry: false,
    gcTime: 0,
    onSuccess: async (response) => {
      if (adminId) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: adminUsersKeys.lists(adminId),
          }),
          queryClient.invalidateQueries({
            queryKey: adminUsersKeys.stats(adminId),
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
