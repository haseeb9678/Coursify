import { gql } from "graphql-request";

const ADMIN_USER_FIELDS = gql`
  fragment AdminUserFields on User {
    id
    name
    email
    avatar
    role
    status
    isEmailVerified
    lastLoginAt
    createdAt
    updatedAt
  }
`;

export const ADMIN_USERS_QUERY = gql`
  ${ADMIN_USER_FIELDS}
  query AdminUsers(
    $pagination: PaginationInput!
    $filter: AdminUsersFilterInput
    $sort: AdminUsersSortInput
  ) {
    adminUsers(pagination: $pagination, filter: $filter, sort: $sort) {
      items {
        ...AdminUserFields
      }
      meta {
        page
        limit
        total
        totalPages
        hasNext
        hasPrevious
      }
    }
  }
`;

export const ADMIN_USER_QUERY = gql`
  ${ADMIN_USER_FIELDS}
  query AdminUser($userId: ID!) {
    adminUser(userId: $userId) {
      ...AdminUserFields
    }
  }
`;

export const ADMIN_USER_STATS_QUERY = gql`
  query AdminUserStats {
    adminUserStats {
      totalUsers
      activeUsers
      inactiveUsers
      suspendedUsers
      verifiedUsers
      unverifiedUsers
      totalStudents
      totalInstructors
      totalAdmins
      newUsersThisMonth
    }
  }
`;

export const ADMIN_USER_SESSIONS_QUERY = gql`
  query AdminUserSessions(
    $userId: ID!
    $pagination: PaginationInput!
  ) {
    adminUserSessions(userId: $userId, pagination: $pagination) {
      id
      userId
      userAgent
      ipAddress
      createdAt
      updatedAt
      expiresAt
      revokedAt
    }
  }
`;

export const ADMIN_CREATE_USER_MUTATION = gql`
  ${ADMIN_USER_FIELDS}
  mutation AdminCreateUser($input: AdminCreateUserInput!) {
    adminCreateUser(input: $input) {
      success
      message
      user {
        ...AdminUserFields
      }
    }
  }
`;

export const ADMIN_UPDATE_USER_MUTATION = gql`
  ${ADMIN_USER_FIELDS}
  mutation AdminUpdateUser($input: AdminUpdateUserInput!) {
    adminUpdateUser(input: $input) {
      success
      message
      user {
        ...AdminUserFields
      }
    }
  }
`;

export const ADMIN_UPDATE_USER_STATUS_MUTATION = gql`
  ${ADMIN_USER_FIELDS}
  mutation AdminUpdateUserStatus(
    $input: AdminUpdateUserStatusInput!
  ) {
    adminUpdateUserStatus(input: $input) {
      success
      message
      user {
        ...AdminUserFields
      }
    }
  }
`;

export const ADMIN_UPDATE_USER_ROLE_MUTATION = gql`
  ${ADMIN_USER_FIELDS}
  mutation AdminUpdateUserRole($input: AdminUpdateUserRoleInput!) {
    adminUpdateUserRole(input: $input) {
      success
      message
      user {
        ...AdminUserFields
      }
    }
  }
`;

export const ADMIN_REVOKE_USER_SESSIONS_MUTATION = gql`
  mutation AdminRevokeUserSessions(
    $input: AdminRevokeSessionsInput!
  ) {
    adminRevokeUserSessions(input: $input) {
      success
      message
    }
  }
`;
