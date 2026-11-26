"use client";

import type { ReactNode } from "react";

import DashboardLayoutClient from "@/components/layouts/dashboard/DashboardLayoutClient";
import { studentDashboardConfig } from "@/features/student/data/student-dashboard.config";

interface StudentLayoutClientProps {
  children: ReactNode;
  defaultOpen?: boolean;
  notificationCount?: number;
}

export default function StudentLayoutClient({
  children,
  defaultOpen = true,
  notificationCount = 0,
}: StudentLayoutClientProps) {
  return (
    <DashboardLayoutClient
      config={studentDashboardConfig}
      defaultOpen={defaultOpen}
      notificationCount={notificationCount}
    >
      {children}
    </DashboardLayoutClient>
  );
}
