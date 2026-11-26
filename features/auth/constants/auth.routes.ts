import type { UserRole } from "../types/auth.types";

export const AUTH_ROUTES = {
    LOGIN: "/login",
    REGISTER: "/signup",
} as const;

export const ROLE_DASHBOARD_ROUTES = {
    STUDENT: "/student/dashboard",
    INSTRUCTOR: "/instructor/dashboard",
    ADMIN: "/admin/dashboard",
} as const satisfies Record<UserRole, string>;

export function getRoleDashboardRoute(
    role: UserRole,
): string {
    return ROLE_DASHBOARD_ROUTES[role];
}