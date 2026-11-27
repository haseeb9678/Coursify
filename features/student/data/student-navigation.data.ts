import { BookOpen, CreditCard, LayoutDashboard, ShoppingBag } from "lucide-react";
import type { DashboardNavigationGroup, DashboardNavigationItem } from "@/features/dashboard/types/dashboard.types";

export const STUDENT_BASE_PATH = "/student";

export const studentNavigationGroups = [
    {
        label: "Overview",
        items: [{ label: "Dashboard", href: `${STUDENT_BASE_PATH}/dashboard`, icon: LayoutDashboard }],
    },
    {
        label: "My Learning",
        items: [{
            label: "My Courses",
            href: `${STUDENT_BASE_PATH}/my-courses`,
            activePaths: [`${STUDENT_BASE_PATH}/my-learning`, `${STUDENT_BASE_PATH}/learning`],
            icon: BookOpen,
        }],
    },
    {
        label: "Purchases & Billing",
        items: [
            { label: "Purchase History", href: `${STUDENT_BASE_PATH}/purchase-history`, icon: ShoppingBag },
            { label: "Payment History", href: `${STUDENT_BASE_PATH}/payments`, icon: CreditCard },
        ],
    },
] satisfies readonly DashboardNavigationGroup[];

// The account menu already displays the signed-in student's profile and sign-out action.
export const studentAccountNavigation: readonly DashboardNavigationItem[] = [];
