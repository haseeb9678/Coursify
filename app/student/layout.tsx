import { Suspense, type ReactNode } from "react";
import { cookies } from "next/headers";

import StudentLayoutClient from "@/components/layouts/student/StudentLayoutClient";
import StudentLayoutSkeleton from "@/components/layouts/student/StudentLayoutSkeleton";

import AuthGuard from "@/features/auth/guards/auth-guard";

interface StudentLayoutProps {
  children: ReactNode;
}

// Opt out of instant navigation validation
// because AuthGuard conditionally renders nested pages.
export const instant = false;

// Resolve student layout preferences
async function StudentLayoutContent({
  children,
}: StudentLayoutProps) {
  const cookieStore = await cookies();

  const sidebarState =
    cookieStore.get("sidebar_state")?.value;

  const defaultOpen =
    sidebarState === undefined
      ? true
      : sidebarState === "true";

  return (
    <StudentLayoutClient defaultOpen={defaultOpen}>
      {children}
    </StudentLayoutClient>
  );
}

// Protected student layout
export default function StudentLayout({
  children,
}: StudentLayoutProps) {
  return (
    <AuthGuard allowedRoles={["STUDENT"]}>
      <Suspense fallback={<StudentLayoutSkeleton />}>
        <StudentLayoutContent>
          {children}
        </StudentLayoutContent>
      </Suspense>
    </AuthGuard>
  );
}