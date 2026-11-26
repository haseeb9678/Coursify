import type {
  User,
  UserRole,
  UserStatus,
} from "@/features/auth/types/auth.types";
import type {
  PaginatedResponse,
  PaginationMeta,
} from "@/features/admin/types/management.types";

export interface AdminUser extends User {
  avatar: string | null;
  lastLoginAt: string | null;
  updatedAt: string;
}

export interface AdminUserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalAdmins: number;
  newUsersThisMonth: number;
}

export type AdminUsersResponse = PaginatedResponse<AdminUser>;

export interface AdminUsersFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  isEmailVerified?: boolean;
  createdFrom?: string;
  createdTo?: string;
  lastLoginFrom?: string;
  lastLoginTo?: string;
}

export type AdminUserSortField =
  | "NAME"
  | "EMAIL"
  | "ROLE"
  | "STATUS"
  | "CREATED_AT"
  | "UPDATED_AT"
  | "LAST_LOGIN_AT";

export type AdminUsersSortDirection = "ASC" | "DESC";

export interface AdminUsersSort {
  field: AdminUserSortField;
  direction: AdminUsersSortDirection;
}

export interface AdminUsersVariables {
  pagination: {
    page: number;
    limit: number;
  };
  filter?: AdminUsersFilters;
  sort?: AdminUsersSort;
}

export interface AdminUserQueryVariables {
  userId: string;
}

export interface AdminUserSessionsVariables {
  userId: string;
  pagination: {
    page: number;
    limit: number;
  };
}

export type AdminAssignableRole = Exclude<UserRole, "ADMIN">;

export interface AdminCreateUserInput {
  name: string;
  email: string;
  password: string;
  role: AdminAssignableRole;
  status?: UserStatus;
}

export interface AdminUpdateUserInput {
  id: string;
  name?: string;
  email?: string;
  avatar?: string | null;
}

export interface AdminUpdateUserStatusInput {
  userId: string;
  status: UserStatus;
}

export interface AdminUpdateUserRoleInput {
  userId: string;
  role: AdminAssignableRole;
}

export interface AdminUserSession {
  id: string;
  userId: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  revokedAt: string | null;
}

export interface AdminRevokeSessionsInput {
  userId: string;
  sessionId?: string;
}

export interface MutationResponse {
  success: boolean;
  message: string;
}

export interface AdminUserMutationResponse extends MutationResponse {
  user: AdminUser;
}

export type { PaginationMeta };
