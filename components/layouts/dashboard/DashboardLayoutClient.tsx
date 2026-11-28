"use client";

import type { CSSProperties } from "react";

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

import type { DashboardLayoutClientProps } from "@/features/dashboard/types/dashboard.types";

import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";

export default function DashboardLayoutClient({
  children,
  config,
  defaultOpen = true,
  restoreSidebarState = false,
  notificationCount = 0,
}: DashboardLayoutClientProps) {
  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      restoreOpenFromCookie={restoreSidebarState}
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "4rem",
        } as CSSProperties
      }
      className="min-h-dvh w-full bg-background"
      data-dashboard-panel={config.userRole.toLowerCase()}
    >
      <DashboardSidebar
        config={config}
        notificationCount={notificationCount}
      />

      <SidebarInset className="min-h-dvh min-w-0 bg-background">
        <DashboardHeader
          config={config}
          notificationCount={notificationCount}
        />

        <div
          id={`${config.userRole.toLowerCase()}-content`}
          className="min-w-0 flex-1 bg-brand-page-secondary/40"
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
