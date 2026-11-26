"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  ArrowUpRight,
  UserRound,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  studentNavigation,
  studentAccountNavigation,
} from "@/features/student/data/student-navigation.data";

import { useAuthStore } from "@/features/auth/store/auth.store";

import StudentSearchBar from "./StudentSearchBar";

interface StudentMobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StudentMobileNav({
  open,
  onOpenChange,
}: StudentMobileNavProps) {
  const pathname = usePathname();

  // Authentication state
  const user = useAuthStore((state) => state.user);

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  );

  const isInitialized = useAuthStore(
    (state) => state.isInitialized,
  );

  // Generate user initials
  const userInitials = user?.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");

  const navigation = [
    ...studentNavigation,
    ...studentAccountNavigation,
  ];

  const closeSidebar = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[min(340px,90vw)] gap-0 border-brand-border bg-background p-0"
      >
        {/* Sidebar Header */}
        <SheetHeader className="border-b border-brand-border p-5">
          <SheetTitle className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap size={23} strokeWidth={1.8} />
            </div>

            <span className="text-xl font-bold tracking-tight text-brand-text">
              Coursify
            </span>
          </SheetTitle>

          <SheetDescription className="text-left text-xs text-brand-text-muted">
            Your personal learning workspace
          </SheetDescription>
        </SheetHeader>

        {/* Authenticated User Profile */}
        {!isInitialized ? (
          <div
            role="status"
            aria-label="Loading user profile"
            className="flex shrink-0 items-center gap-3 border-b border-brand-border px-5 py-4"
          >
            <div className="size-11 shrink-0 animate-pulse rounded-full bg-brand-soft motion-reduce:animate-none" />

            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-28 max-w-full animate-pulse rounded-md bg-brand-soft motion-reduce:animate-none" />

              <div className="h-2.5 w-36 max-w-full animate-pulse rounded-md bg-brand-soft motion-reduce:animate-none" />
            </div>
          </div>
        ) : isAuthenticated && user ? (
          <div className="shrink-0 border-b border-brand-border px-5 py-4">
            <div className="flex items-center gap-3">
              {/* Profile Avatar */}
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary/10 text-sm font-semibold tracking-wide text-primary">
                {userInitials || (
                  <UserRound size={21} strokeWidth={1.8} />
                )}
              </span>

              {/* User Information */}
              <div className="min-w-0 flex-1">
                <p
                  title={user.name}
                  className="truncate text-sm font-semibold text-brand-text"
                >
                  {user.name}
                </p>

                <p
                  title={user.email}
                  className="mt-0.5 truncate text-xs text-brand-text-muted"
                >
                  {user.email}
                </p>

                <span className="mt-1.5 inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium capitalize text-primary">
                  {user.role.toLowerCase()}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Sidebar Content */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">

          {/* Search Bar */}
          <div className="mb-6">
            <StudentSearchBar />
          </div>

          {/* Navigation Label */}
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-text-muted">
            Workspace
          </p>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navigation.map(({ label, href, icon: Icon }) => {
              const isActive =
                pathname === href ||
                pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeSidebar}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-brand-text-muted hover:bg-brand-soft hover:text-brand-text"
                  }`}
                >
                  <Icon size={19} strokeWidth={1.7} />

                  <span className="flex-1">{label}</span>

                  {isActive && (
                    <span className="size-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Explore Courses Card */}
          <div className="mt-auto pt-8">
            <div className="rounded-xl border border-brand-border bg-brand-page-secondary/60 p-4">
              <p className="text-sm font-semibold text-brand-text">
                Keep growing your skills.
              </p>

              <p className="mt-1.5 text-xs leading-relaxed text-brand-text-muted">
                Discover your next learning opportunity.
              </p>

              <Link
                href="/courses"
                onClick={closeSidebar}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary"
              >
                Explore courses
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}