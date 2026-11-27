"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { enrollmentReturnPath } from "@/features/commerce/return-path";

import { useAuthStore } from "../store/auth.store";

import { getRoleDashboardRoute } from "../constants/auth.routes";
import AuthLoader from "@/components/layouts/auth/AuthLoader";


interface GuestGuardProps {
  children: ReactNode;
  redirectTo?: string;
}

export default function GuestGuard({
  children,
  redirectTo,
}: GuestGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnTo = pathname === "/login" ? enrollmentReturnPath(searchParams.get("returnTo")) : null;

  // Authentication state
  const user = useAuthStore((state) => state.user);

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  );

  const isInitialized = useAuthStore(
    (state) => state.isInitialized,
  );

  // Check authenticated user
  const hasAuthenticatedUser =
    isAuthenticated && user !== null;

  // Determine role-based redirect destination
  const redirectPath =
    isInitialized && hasAuthenticatedUser
      ? (user.role === "STUDENT" ? returnTo : null) ?? redirectTo ?? getRoleDashboardRoute(user.role)
      : null;

  // Redirect authenticated users
  useEffect(() => {
    if (redirectPath) {
      router.replace(redirectPath);
    }
  }, [redirectPath, router]);

  // Wait for authentication initialization
  if (!isInitialized) {
    return (
      <AuthLoader message="Verifying your session..." />
    );
  }

  // Redirect authenticated users
  if (hasAuthenticatedUser) {
    return (
      <AuthLoader message="Redirecting to your dashboard..." />
    );
  }

  // Only guest users can access these pages
  return <>{children}</>;
}