import type { DashboardConfiguration } from "@/features/dashboard/types/dashboard.types";

import {
  STUDENT_BASE_PATH,
  studentAccountNavigation,
  studentNavigationGroups,
} from "./student-navigation.data";

export const studentDashboardConfig = {
  userRole: "STUDENT",
  baseRoute: STUDENT_BASE_PATH,
  dashboardRoute: `${STUDENT_BASE_PATH}/dashboard`,
  workspaceName: "Coursify",
  workspaceDescription: "Your personal learning workspace",
  navigationGroups: studentNavigationGroups,
  accountNavigation: studentAccountNavigation,
  notificationRoute: `${STUDENT_BASE_PATH}/notifications`,
  searchPlaceholder: "Search courses...",
  searchRoute: "/courses",
  routeLabels: {
    student: "Student",
    dashboard: "Dashboard",
    "my-learning": "My Learning",
    courses: "Explore Courses",
    wishlist: "Wishlist",
    certificates: "Certificates",
    notifications: "Notifications",
    settings: "Settings",
    profile: "Profile",
    security: "Security",
  },
  promotionalCard: {
    title: "Keep growing your skills.",
    description: "Discover your next learning opportunity.",
    href: "/courses",
    linkLabel: "Explore courses",
  },
} satisfies DashboardConfiguration;
