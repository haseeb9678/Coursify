import type { AdminUsersVariables } from "@/features/admin/types/users.types";
import { normalizeAdminUsersVariables } from "@/features/admin/utils/users.utils";

export const ADMIN_SESSIONS_PAGE_SIZE = 50;

export const adminUsersKeys = {
  all: (adminId: string | null) =>
    ["admin", "users", adminId] as const,

  lists: (adminId: string | null) =>
    [...adminUsersKeys.all(adminId), "list"] as const,

  list: (adminId: string | null, variables: AdminUsersVariables) =>
    [
      ...adminUsersKeys.lists(adminId),
      normalizeAdminUsersVariables(variables),
    ] as const,

  details: (adminId: string | null) =>
    [...adminUsersKeys.all(adminId), "detail"] as const,

  detail: (adminId: string | null, userId: string | null) =>
    [...adminUsersKeys.details(adminId), userId] as const,

  stats: (adminId: string | null) =>
    [...adminUsersKeys.all(adminId), "stats"] as const,

  sessionLists: (adminId: string | null, userId: string | null) =>
    [...adminUsersKeys.all(adminId), "sessions", userId] as const,

  sessions: (
    adminId: string | null,
    userId: string | null,
    page: number,
    limit: number,
  ) =>
    [
      ...adminUsersKeys.sessionLists(adminId, userId),
      { page, limit },
    ] as const,
};
