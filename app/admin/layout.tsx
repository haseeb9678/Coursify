import { Suspense, type ReactNode } from "react";
import { cookies } from "next/headers";

import AdminLayoutClient from "@/components/layouts/admin/AdminLayoutClient";
import AdminLayoutSkeleton from "@/components/layouts/admin/AdminLayoutSkeleton";
import AuthGuard from "@/features/auth/guards/auth-guard";

interface AdminLayoutProps {
  children: ReactNode;
}

export const instant = false;

async function AdminLayoutContent({ children }: AdminLayoutProps) {
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar_state")?.value;
  const defaultOpen =
    sidebarState === undefined ? true : sidebarState === "true";

  return (
    <AdminLayoutClient defaultOpen={defaultOpen}>
      {children}
    </AdminLayoutClient>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <Suspense fallback={<AdminLayoutSkeleton />}>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </Suspense>
    </AuthGuard>
  );
}
