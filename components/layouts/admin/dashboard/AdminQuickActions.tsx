"use client";

import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  FolderKanban,
  type LucideIcon,
  Settings,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import AdminDashboardCard from "./AdminDashboardCard";

interface QuickAction {
  label: string;
  description: string;
  icon: LucideIcon;
  href?: string;
}

const quickActions: QuickAction[] = [
  {
    label: "Manage users",
    description: "User management route unavailable",
    icon: UsersRound,
  },
  {
    label: "Browse course catalog",
    description: "Explore published courses",
    icon: BookOpen,
    href: "/courses",
  },
  {
    label: "Manage categories",
    description: "Category management route unavailable",
    icon: FolderKanban,
  },
  {
    label: "Review approvals",
    description: "Approval review route unavailable",
    icon: ShieldCheck,
  },
  {
    label: "View analytics",
    description: "Analytics route unavailable",
    icon: BarChart3,
  },
  {
    label: "Platform settings",
    description: "Settings route unavailable",
    icon: Settings,
  },
];

export default function AdminQuickActions() {
  return (
    <AdminDashboardCard delay={0.38}>
      <div>
        <h2 className="text-base font-semibold text-brand-text sm:text-lg">
          Quick actions
        </h2>
        <p className="mt-1 text-xs text-brand-text-muted sm:text-sm">
          Common platform destinations.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const content = (
            <>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-brand-text">
                  {action.label}
                </span>
                <span className="mt-0.5 block truncate text-[10px] text-brand-text-muted">
                  {action.description}
                </span>
              </span>
            </>
          );
          const className =
            "group flex min-w-0 items-center gap-2.5 rounded-xl border border-brand-border/80 p-2.5 text-left transition-colors hover:border-primary/25 hover:bg-brand-page-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

          return action.href === "/courses" ? (
            <Link
              key={action.label}
              href="/courses"
              className={className}
            >
              {content}
            </Link>
          ) : (
            <div
              key={action.label}
              aria-disabled="true"
              className={`${className} cursor-not-allowed opacity-60`}
            >
              {content}
            </div>
          );
        })}
      </div>
    </AdminDashboardCard>
  );
}
