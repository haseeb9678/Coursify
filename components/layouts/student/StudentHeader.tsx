"use client";

import Link from "next/link";
import { useTheme } from "next-themes";

import {
  Bell,
  Sun,
  Moon,
} from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

import type { StudentHeaderProps } from "@/features/student/types/student.types";

import StudentBreadcrumb from "./StudentBreadcrumb";
import StudentSearchBar from "./StudentSearchBar";
import StudentProfileMenu from "./StudentProfileMenu";

export default function StudentHeader({
  student,
  notificationCount = 0,
  onLogout,
}: StudentHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(
      resolvedTheme === "dark" ? "light" : "dark",
    );
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-brand-border/80 bg-background/85 backdrop-blur-xl">
      <div className="flex h-18 w-full items-center justify-between gap-3 px-3 sm:px-5 lg:px-6">

        {/* =====================================
            LEFT — SIDEBAR TRIGGER & BREADCRUMB
        ====================================== */}

        <div className="flex min-w-0 items-center gap-3">
          <SidebarTrigger
            className="size-9 shrink-0 cursor-pointer rounded-lg text-brand-text-muted transition-colors hover:bg-brand-soft hover:text-primary"
          />

          <Separator
            orientation="vertical"
            className="h-6! bg-brand-border"
          />

          <div className="min-w-0">
            <StudentBreadcrumb />
          </div>
        </div>

        {/* =====================================
            RIGHT — HEADER UTILITIES
        ====================================== */}

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">

          {/* Search Bar */}
          <div className="hidden w-52 md:block xl:w-64">
            <StudentSearchBar />
          </div>

          {/* Notifications */}
          <Link
            href="/student/notifications"
            aria-label={`Notifications, ${notificationCount} unread`}
            className="relative flex size-10 shrink-0 items-center justify-center rounded-lg text-brand-text-muted transition-colors duration-200 hover:bg-brand-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Bell
              size={21}
              strokeWidth={1.7}
            />

            {notificationCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-background bg-primary px-0.5 text-[9px] font-semibold text-primary-foreground">
                {notificationCount > 99
                  ? "99+"
                  : notificationCount}
              </span>
            )}
          </Link>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="relative flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-brand-text-muted transition-colors duration-200 hover:bg-brand-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Sun
              size={20}
              strokeWidth={1.7}
              className="rotate-0 scale-100 transition-transform duration-300 dark:-rotate-90 dark:scale-0 motion-reduce:transition-none"
            />

            <Moon
              size={20}
              strokeWidth={1.7}
              className="absolute rotate-90 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100 motion-reduce:transition-none"
            />
          </button>

          {/* Profile Separator */}
          <Separator
            orientation="vertical"
            className="mx-0.5 h-7! shrink-0 bg-brand-border sm:mx-1"
          />

          {/* Student Profile */}
          <div className="flex shrink-0 items-center">
            <StudentProfileMenu
              student={student}
              onLogout={onLogout}
              
            />
          </div>
        </div>
      </div>
    </header>
  );
}