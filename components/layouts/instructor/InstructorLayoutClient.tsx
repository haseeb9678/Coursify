"use client";

import type { ReactNode } from "react";
import DashboardLayoutClient from "@/components/layouts/dashboard/DashboardLayoutClient";
import { instructorDashboardConfig } from "@/features/instructor/config";

export default function InstructorLayoutClient({ children }: { children: ReactNode }) {
  return <DashboardLayoutClient config={instructorDashboardConfig} restoreSidebarState>{children}</DashboardLayoutClient>;
}
