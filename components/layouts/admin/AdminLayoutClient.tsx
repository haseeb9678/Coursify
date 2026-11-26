"use client";

import type { ReactNode } from "react";

import DashboardLayoutClient from "@/components/layouts/dashboard/DashboardLayoutClient";
import { adminDashboardConfig } from "@/features/admin/data/admin-dashboard.config";

interface AdminLayoutClientProps {
  children: ReactNode;
  defaultOpen?: boolean;
  notificationCount?: number;
}

export default function AdminLayoutClient({
  children,
  defaultOpen = true,
  notificationCount = 0,
}: AdminLayoutClientProps) {
  return (
    <DashboardLayoutClient
      config={adminDashboardConfig}
      defaultOpen={defaultOpen}
      notificationCount={notificationCount}
    >
      {children}
    </DashboardLayoutClient>
  );
}
