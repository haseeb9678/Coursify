import {
    LayoutDashboard,
    BookOpen,
    Compass,
    Heart,
    Award,
    Bell,
    Settings,
} from "lucide-react";

import type {
    DashboardNavigationGroup,
    DashboardNavigationItem,
} from "@/features/dashboard/types/dashboard.types";

export const STUDENT_BASE_PATH = "/student";

export const studentNavigation = [
    {
        label: "Dashboard",
        href: `${STUDENT_BASE_PATH}/dashboard`,
        icon: LayoutDashboard,
    },
    {
        label: "My Learning",
        href: `${STUDENT_BASE_PATH}/my-learning`,
        icon: BookOpen,
    },
    {
        label: "Explore Courses",
        href: `${STUDENT_BASE_PATH}/courses`,
        icon: Compass,
    },
] satisfies readonly DashboardNavigationItem[];

export const studentLearningNavigation = [
    {
        label: "Wishlist",
        href: `${STUDENT_BASE_PATH}/wishlist`,
        icon: Heart,
    },
    {
        label: "Certificates",
        href: `${STUDENT_BASE_PATH}/certificates`,
        icon: Award,
    },
] satisfies readonly DashboardNavigationItem[];

export const studentPreferencesNavigation = [
    {
        label: "Notifications",
        href: `${STUDENT_BASE_PATH}/notifications`,
        icon: Bell,
    },
    {
        label: "Settings",
        href: `${STUDENT_BASE_PATH}/settings`,
        icon: Settings,
    },
] satisfies readonly DashboardNavigationItem[];

// Used by the existing profile dropdown.
export const studentAccountNavigation = [
    ...studentLearningNavigation,
    {
        label: "Account Settings",
        href: `${STUDENT_BASE_PATH}/settings`,
        icon: Settings,
    },
] satisfies readonly DashboardNavigationItem[];

export const studentNavigationGroups = [
    {
        label: "Workspace",
        items: studentNavigation,
    },
    {
        label: "My Library",
        items: studentLearningNavigation,
    },
    {
        label: "Preferences",
        items: studentPreferencesNavigation,
    },
] satisfies readonly DashboardNavigationGroup[];