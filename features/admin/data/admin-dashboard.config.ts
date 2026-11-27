import {
  Award,
  Bell,
  BookOpen,
  ChartPie,
  CreditCard,
  FileCheck2,
  LayoutDashboard,
  Megaphone,
  PanelsTopLeft,
  ReceiptText,
  Settings,
  ShieldCheck,
  Star,
  Tags,
  UserRound,
  UsersRound,
} from "lucide-react";

import type {
  DashboardConfiguration,
  DashboardNavigationGroup,
  DashboardNavigationItem,
} from "@/features/dashboard/types/dashboard.types";

const adminBaseRoute = "/admin";

const adminAccountNavigation = [
  {
    label: "My Profile",
    href: `${adminBaseRoute}/profile`,
    icon: UserRound,
    implemented: false,
  },
  {
    label: "Account Settings",
    href: `${adminBaseRoute}/settings`,
    icon: Settings,
    implemented: false,
  },
] satisfies readonly DashboardNavigationItem[];

const adminNavigationGroups = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: `${adminBaseRoute}/dashboard`,
        icon: LayoutDashboard,
      },
      {
        label: "Analytics",
        href: `${adminBaseRoute}/analytics`,
        icon: ChartPie,
        implemented: false,
      },
    ],
  },
  {
    label: "User Management",
    items: [
      {
        label: "Users",
        href: `${adminBaseRoute}/users`,
        icon: UsersRound,
        implemented: true,
      },
      {
        label: "Students",
        href: `${adminBaseRoute}/students`,
        icon: UserRound,
        implemented: true,
      },
      {
        label: "Instructors",
        href: `${adminBaseRoute}/instructors`,
        icon: Award,
        implemented: true,
      },
    ],
  },
  {
    label: "Learning Management",
    items: [
      {
        label: "Courses",
        href: `${adminBaseRoute}/courses`,
        icon: BookOpen,
        implemented: true,
      },
      {
        label: "Categories",
        href: `${adminBaseRoute}/categories`,
        icon: Tags,
        implemented: true,
      },
      {
        label: "Enrollments",
        href: `${adminBaseRoute}/enrollments`,
        icon: FileCheck2,
        implemented: true,
      },
      {
        label: "Course Approvals",
        href: `${adminBaseRoute}/course-approvals`,
        icon: ShieldCheck,
        implemented: true,
      },
      {
        label: "Reviews",
        href: `${adminBaseRoute}/reviews`,
        icon: Star,
        implemented: false,
      },
    ],
  },
  {
    label: "Website Management",
    items: [
      { label: "Hero Management", href: `${adminBaseRoute}/website/hero`, icon: PanelsTopLeft, implemented: true },
      { label: "Promotional Popups", href: `${adminBaseRoute}/website/popups`, icon: Megaphone, implemented: true },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        label: "Orders",
        href: `${adminBaseRoute}/orders`,
        icon: ReceiptText,
        implemented: true,
      },
      {
        label: "Transactions",
        href: `${adminBaseRoute}/transactions`,
        icon: ReceiptText,
        implemented: true,
      },
      {
        label: "Stripe Webhooks",
        href: `${adminBaseRoute}/webhooks`,
        icon: CreditCard,
        implemented: true,
      },
      {
        label: "Subscriptions",
        href: `${adminBaseRoute}/subscriptions`,
        icon: CreditCard,
        implemented: false,
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        label: "Notifications",
        href: `${adminBaseRoute}/notifications`,
        icon: Bell,
        implemented: false,
      },
      {
        label: "Roles & Permissions",
        href: `${adminBaseRoute}/roles-permissions`,
        icon: ShieldCheck,
        implemented: false,
      },
      {
        label: "Settings",
        href: `${adminBaseRoute}/settings`,
        icon: Settings,
        implemented: false,
      },
    ],
  },
  {
    label: "Account Navigation",
    items: adminAccountNavigation,
  },
] satisfies readonly DashboardNavigationGroup[];

export const adminDashboardConfig = {
  userRole: "ADMIN",
  baseRoute: adminBaseRoute,
  dashboardRoute: `${adminBaseRoute}/dashboard`,
  workspaceName: "Coursify",
  workspaceDescription: "Administration workspace",
  navigationGroups: adminNavigationGroups,
  accountNavigation: adminAccountNavigation,
  notificationRoute: `${adminBaseRoute}/notifications`,
  notificationRouteImplemented: false,
  searchPlaceholder: "Search courses...",
  searchRoute: "/courses",
  routeLabels: {
    admin: "Admin",
    dashboard: "Dashboard",
    analytics: "Analytics",
    users: "Users",
    students: "Students",
    instructors: "Instructors",
    courses: "Courses",
    website: "Website Management",
    hero: "Hero Management",
    popups: "Promotional Popups",
    categories: "Categories",
    enrollments: "Enrollments",
    "course-approvals": "Course Approvals",
    reviews: "Reviews",
    transactions: "Transactions",
    orders: "Orders",
    webhooks: "Stripe Webhooks",
    subscriptions: "Subscriptions",
    notifications: "Notifications",
    "roles-permissions": "Roles & Permissions",
    settings: "Settings",
    profile: "My Profile",
  },
} satisfies DashboardConfiguration;
