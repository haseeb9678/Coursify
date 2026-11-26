import { graphqlClient } from "@/lib/graphql/client";
import {
  ADMIN_CREATE_USER_MUTATION,
  ADMIN_REVOKE_USER_SESSIONS_MUTATION,
  ADMIN_UPDATE_USER_MUTATION,
  ADMIN_UPDATE_USER_ROLE_MUTATION,
  ADMIN_UPDATE_USER_STATUS_MUTATION,
  ADMIN_USER_QUERY,
  ADMIN_USER_SESSIONS_QUERY,
  ADMIN_USER_STATS_QUERY,
  ADMIN_USERS_QUERY,
} from "@/features/admin/graphql/users.graphql";
import type {
  AdminCreateUserInput,
  AdminRevokeSessionsInput,
  AdminUpdateUserInput,
  AdminUpdateUserRoleInput,
  AdminUpdateUserStatusInput,
  AdminUser,
  AdminUserMutationResponse,
  AdminUserQueryVariables,
  AdminUserSession,
  AdminUserSessionsVariables,
  AdminUserStats,
  AdminUsersResponse,
  AdminUsersVariables,
  MutationResponse,
} from "@/features/admin/types/users.types";

function assertMutationSucceeded<T extends MutationResponse>(response: T): T {
  if (!response.success) {
    throw new Error(response.message);
  }

  return response;
}

export async function getAdminUsers(
  variables: AdminUsersVariables,
): Promise<AdminUsersResponse> {
  const response = await graphqlClient.request<
    { adminUsers: AdminUsersResponse },
    AdminUsersVariables
  >(ADMIN_USERS_QUERY, variables);

  return response.adminUsers;
}

export async function getAdminUser(
  variables: AdminUserQueryVariables,
): Promise<AdminUser> {
  const response = await graphqlClient.request<
    { adminUser: AdminUser },
    AdminUserQueryVariables
  >(ADMIN_USER_QUERY, variables);

  return response.adminUser;
}

export async function getAdminUserStats(): Promise<AdminUserStats> {
  const response = await graphqlClient.request<{
    adminUserStats: AdminUserStats;
  }>(ADMIN_USER_STATS_QUERY);

  return response.adminUserStats;
}

export async function createAdminUser(
  input: AdminCreateUserInput,
): Promise<AdminUserMutationResponse> {
  const response = await graphqlClient.request<
    { adminCreateUser: AdminUserMutationResponse },
    { input: AdminCreateUserInput }
  >(ADMIN_CREATE_USER_MUTATION, { input });

  return assertMutationSucceeded(response.adminCreateUser);
}

export async function updateAdminUser(
  input: AdminUpdateUserInput,
): Promise<AdminUserMutationResponse> {
  const response = await graphqlClient.request<
    { adminUpdateUser: AdminUserMutationResponse },
    { input: AdminUpdateUserInput }
  >(ADMIN_UPDATE_USER_MUTATION, { input });

  return assertMutationSucceeded(response.adminUpdateUser);
}

export async function updateAdminUserStatus(
  input: AdminUpdateUserStatusInput,
): Promise<AdminUserMutationResponse> {
  const response = await graphqlClient.request<
    { adminUpdateUserStatus: AdminUserMutationResponse },
    { input: AdminUpdateUserStatusInput }
  >(ADMIN_UPDATE_USER_STATUS_MUTATION, { input });

  return assertMutationSucceeded(response.adminUpdateUserStatus);
}

export async function updateAdminUserRole(
  input: AdminUpdateUserRoleInput,
): Promise<AdminUserMutationResponse> {
  const response = await graphqlClient.request<
    { adminUpdateUserRole: AdminUserMutationResponse },
    { input: AdminUpdateUserRoleInput }
  >(ADMIN_UPDATE_USER_ROLE_MUTATION, { input });

  return assertMutationSucceeded(response.adminUpdateUserRole);
}

export async function getAdminUserSessions(
  variables: AdminUserSessionsVariables,
): Promise<AdminUserSession[]> {
  const response = await graphqlClient.request<
    { adminUserSessions: AdminUserSession[] },
    AdminUserSessionsVariables
  >(ADMIN_USER_SESSIONS_QUERY, variables);

  return response.adminUserSessions;
}

export async function revokeAdminUserSessions(
  input: AdminRevokeSessionsInput,
): Promise<MutationResponse> {
  const response = await graphqlClient.request<
    { adminRevokeUserSessions: MutationResponse },
    { input: AdminRevokeSessionsInput }
  >(ADMIN_REVOKE_USER_SESSIONS_MUTATION, { input });

  return assertMutationSucceeded(response.adminRevokeUserSessions);
}
