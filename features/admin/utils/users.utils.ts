import { ClientError } from "graphql-request";
import { getGraphQLErrorCode } from "@/lib/graphql/error";
import type {
  AdminUserSortField,
  AdminUsersVariables,
} from "@/features/admin/types/users.types";

export function normalizeAdminUsersVariables(
  variables: AdminUsersVariables,
): AdminUsersVariables {
  const filter = variables.filter;
  const normalizedFilter = filter
    ? {
        ...(filter.search?.trim()
          ? { search: filter.search.trim() }
          : {}),
        ...(filter.role ? { role: filter.role } : {}),
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.isEmailVerified !== undefined
          ? { isEmailVerified: filter.isEmailVerified }
          : {}),
        ...(filter.createdFrom
          ? { createdFrom: filter.createdFrom }
          : {}),
        ...(filter.createdTo ? { createdTo: filter.createdTo } : {}),
        ...(filter.lastLoginFrom
          ? { lastLoginFrom: filter.lastLoginFrom }
          : {}),
        ...(filter.lastLoginTo
          ? { lastLoginTo: filter.lastLoginTo }
          : {}),
      }
    : undefined;

  return {
    pagination: {
      page: variables.pagination.page,
      limit: variables.pagination.limit,
    },
    ...(normalizedFilter && Object.keys(normalizedFilter).length > 0
      ? { filter: normalizedFilter }
      : {}),
    ...(variables.sort
      ? {
          sort: {
            field: variables.sort.field,
            direction: variables.sort.direction,
          },
        }
      : {}),
  };
}

export function getAdminDateRange(
  value: "ALL" | "30_DAYS" | "12_MONTHS",
): { from?: string; to?: string } {
  if (value === "ALL") return {};

  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - (value === "30_DAYS" ? 30 : 365));

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export function getAdminSortField(
  column: string,
): AdminUserSortField | undefined {
  const fields: Record<string, AdminUserSortField> = {
    identity: "NAME",
    role: "ROLE",
    status: "STATUS",
    createdAt: "CREATED_AT",
    lastLoginAt: "LAST_LOGIN_AT",
  };

  return fields[column];
}

export function shouldRetryAdminQuery(
  failureCount: number,
  error: unknown,
): boolean {
  const code = getGraphQLErrorCode(error);
  const status =
    error instanceof ClientError ? error.response.status : undefined;
  const permanentHttpStatuses = [400, 401, 403, 404, 409, 422, 429];

  if (status !== undefined && permanentHttpStatuses.includes(status)) {
    return false;
  }

  if (
    code &&
    code !== "INTERNAL_SERVER_ERROR" &&
    code !== "SERVICE_UNAVAILABLE"
  ) {
    return false;
  }

  return failureCount < 1;
}
