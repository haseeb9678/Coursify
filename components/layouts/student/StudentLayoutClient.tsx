"use client";

import type {
  ReactNode,
  CSSProperties,
} from "react";

import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

import StudentSidebar from "./StudentSidebar";
import StudentHeader from "./StudentHeader";

import type { StudentProfile } from "@/features/student/types/student.types";

interface StudentLayoutClientProps {
  children: ReactNode;

  defaultOpen?: boolean;
  student?: StudentProfile | null;
  notificationCount?: number;
}

export default function StudentLayoutClient({
  children,
  defaultOpen = true,
  student,
  notificationCount = 0,
}: StudentLayoutClientProps) {
  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "4rem",
        } as CSSProperties
      }
      className="min-h-dvh w-full bg-background"
    >
      {/* Fixed Student Sidebar */}
      <StudentSidebar
       
        notificationCount={notificationCount}
      />

      {/* Main Application Workspace */}
      <SidebarInset className="min-h-dvh min-w-0 bg-background">

        {/* Sticky Student Header */}
        <StudentHeader
          notificationCount={notificationCount}
        />

        {/* Dynamic Page Content */}
        <div
          id="student-content"
          className="min-w-0 flex-1 bg-brand-page-secondary/40"
        >
          {children}
        </div>

       
      </SidebarInset>
    </SidebarProvider>
  );
}