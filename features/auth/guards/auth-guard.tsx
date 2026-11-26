"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "../store/auth.store";

import {
    AUTH_ROUTES,
    getRoleDashboardRoute,
} from "../constants/auth.routes";

import type { UserRole } from "../types/auth.types";
import AuthLoader from "@/components/layouts/auth/AuthLoader";

interface AuthGuardProps {
    children: ReactNode;
    allowedRoles?: readonly UserRole[];
}

export default function AuthGuard({
    children,
    allowedRoles,
}: AuthGuardProps) {
    const router = useRouter();

    // Authentication state
    const user = useAuthStore((state) => state.user);

    const isAuthenticated = useAuthStore(
        (state) => state.isAuthenticated,
    );

    const isInitialized = useAuthStore(
        (state) => state.isInitialized,
    );

    // Check authentication
    const hasAuthenticatedUser =
        isAuthenticated && user !== null;

    // Check role permissions
    const hasAllowedRole =
        user !== null &&
        (
            allowedRoles === undefined ||
            allowedRoles.includes(user.role)
        );

    // Determine redirect destination
    let redirectTo: string | null = null;

    if (isInitialized) {
        if (!hasAuthenticatedUser) {
            redirectTo = AUTH_ROUTES.LOGIN;
        } else if (!hasAllowedRole && user) {
            redirectTo = getRoleDashboardRoute(user.role);
        }
    }

    // Handle unauthorized access
    useEffect(() => {
        if (redirectTo) {
            router.replace(redirectTo);
        }
    }, [redirectTo, router]);

    // Wait until authentication is initialized
    if (!isInitialized) {
        return (
            <AuthLoader message="Verifying your session..." />
        );
    }

    // Handle unauthenticated users
    if (!hasAuthenticatedUser) {
        return (
            <AuthLoader message="Redirecting to login..." />
        );
    }

    // Handle unauthorized roles
    if (!hasAllowedRole) {
        return (
            <AuthLoader message="Redirecting to your dashboard..." />
        );
    }

    // Render authorized content
    return <>{children}</>;
}