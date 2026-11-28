import { BarChart3, BookOpen, CircleDollarSign, ClipboardCheck, Folder, LayoutDashboard, Plus, Settings, UserRound, Users } from "lucide-react";
import type { DashboardConfiguration } from "@/features/dashboard/types/dashboard.types";

const accountNavigation = [
  { label: "My profile", href: "/instructor/profile", icon: UserRound },
  { label: "Settings", href: "/instructor/settings", icon: Settings },
];

export const instructorDashboardConfig = {
  userRole: "INSTRUCTOR",
  baseRoute: "/instructor",
  dashboardRoute: "/instructor/dashboard",
  workspaceName: "Coursify",
  workspaceDescription: "Instructor workspace",
  navigationGroups: [
    { label: "Overview", items: [
      { label: "Dashboard", href: "/instructor/dashboard", icon: LayoutDashboard },
      { label: "Analytics", href: "/instructor/analytics", icon: BarChart3 },
    ] },
    { label: "Course Management", items: [
      {
        label: "My courses",
        href: "/instructor/courses",
        icon: BookOpen,
        excludedPaths: ["/instructor/courses/create", "/instructor/courses/drafts"],
      },
      { label: "Create course", href: "/instructor/courses/create", icon: Plus },
      { label: "Draft courses", href: "/instructor/courses/drafts", icon: Folder },
      { label: "Media library", href: "/instructor/media", icon: Folder },
    ] },
    { label: "Students & Feedback", items: [
      { label: "Enrolled students", href: "/instructor/students", icon: Users },
      { label: "Review feedback", href: "/instructor/reviews", icon: ClipboardCheck },
    ] },
    { label: "Finance", items: [
      { label: "Course sales", href: "/instructor/earnings", icon: CircleDollarSign },
    ] },
    { label: "Account Navigation", items: accountNavigation },
  ],
  accountNavigation,
  notificationRoute: "/instructor/reviews",
  notificationRouteImplemented: false,
  searchRoute: "/instructor/courses",
  searchPlaceholder: "Search your courses…",
  routeLabels: { instructor: "Instructor", dashboard: "Dashboard", courses: "My courses", create: "Create course",
    drafts: "Drafts", curriculum: "Curriculum", students: "Enrolled students", earnings: "Course sales", reviews: "Review feedback",
    "courses/[id]": "Course details", "students/[id]": "Student details" },
} satisfies DashboardConfiguration;
