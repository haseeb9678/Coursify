"use client";

import Link from "next/link";
import {
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  ArrowUpRight,
  LogIn,
  UserPlus,
  UserRound,
  ChevronRight,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import { useAuthStore } from "@/features/auth/store/auth.store";

interface MobileNavSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const navigationLinks = [
  {
    label: "Explore Courses",
    description: "Discover your next skill",
    href: "/courses",
    icon: BookOpen,
  },
  {
    label: "Become an Instructor",
    description: "Share your knowledge",
    href: "/teach",
    icon: BriefcaseBusiness,
  },
];

export default function MobileNavSidebar({
  open,
  onOpenChange,
}: MobileNavSidebarProps) {
  const shouldReduceMotion = useReducedMotion();

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

  const closeSidebar = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex w-[300px] flex-col overflow-hidden border-r border-brand-border bg-white p-0 sm:w-[360px]"
      >
        {/* Sidebar Header */}
        <SheetHeader className="border-b border-brand-border px-5 py-6 text-left">
          <SheetTitle className="sr-only">
            Navigation Menu
          </SheetTitle>

          <SheetDescription className="sr-only">
            Explore courses and access your Coursify account.
          </SheetDescription>

          <Link
            href="/"
            onClick={closeSidebar}
            className="flex w-fit items-center gap-2"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
              <GraduationCap size={23} strokeWidth={2.2} />
            </span>

            <span className="text-2xl font-extrabold tracking-tight text-primary">
              Coursify
            </span>
          </Link>
        </SheetHeader>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-text-muted">
            Main Navigation
          </p>

          <motion.nav
            className="space-y-2"
            initial="hidden"
            animate={open ? "visible" : "hidden"}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: shouldReduceMotion ? 0 : 0.07,
                },
              },
            }}
          >
            {navigationLinks.map((item) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.href}
                  variants={{
                    hidden: {
                      opacity: 0,
                      x: shouldReduceMotion ? 0 : -12,
                    },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: {
                        duration: shouldReduceMotion ? 0 : 0.22,
                      },
                    },
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={closeSidebar}
                    className="group flex items-center gap-3 rounded-xl border border-transparent p-3 transition-all duration-200 hover:border-primary/15 hover:bg-brand-soft"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Icon size={20} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-brand-text transition-colors group-hover:text-primary">
                        {item.label}
                      </span>

                      <span className="mt-0.5 block text-[11px] text-brand-text-muted">
                        {item.description}
                      </span>
                    </span>

                    <ArrowUpRight
                      size={16}
                      className="shrink-0 text-brand-text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                    />
                  </Link>
                </motion.div>
              );
            })}
          </motion.nav>
        </div>

        {/* Authentication Footer */}
        <div className="shrink-0 border-t border-brand-border bg-brand-page-secondary/60 p-5">
          {!isInitialized ? (
            /* Authentication Loading Skeleton */
            <div
              role="status"
              aria-label="Checking authentication"
              className="flex items-center gap-3 rounded-xl border border-brand-border bg-white p-3"
            >
              <div className="size-11 shrink-0 animate-pulse rounded-full bg-brand-soft motion-reduce:animate-none" />

              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 animate-pulse rounded-md bg-brand-soft motion-reduce:animate-none" />

                <div className="h-2.5 w-32 max-w-full animate-pulse rounded-md bg-brand-soft motion-reduce:animate-none" />
              </div>
            </div>
          ) : isAuthenticated && user ? (
            /* Authenticated User Profile */
            <div className="space-y-3">
              <p className="px-1 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-text-muted">
                Your Account
              </p>

              <Link
                href="/student/dashboard"
                onClick={closeSidebar}
                aria-label={`Open dashboard for ${user.name}`}
                className="group flex items-center gap-3 rounded-xl border border-brand-border bg-white p-3 transition-colors duration-200 hover:border-primary/25 hover:bg-brand-soft/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {/* Profile Avatar */}
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary/10 text-sm font-semibold tracking-wide text-primary">
                  {userInitials ? (
                    <span>{userInitials}</span>
                  ) : (
                    <UserRound size={20} strokeWidth={1.8} />
                  )}
                </span>

                {/* User Information */}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-brand-text">
                    {user.name}
                  </span>

                  <span className="mt-0.5 block truncate text-xs text-brand-text-muted">
                    {user.email}
                  </span>

                  <span className="mt-1.5 block text-[11px] font-medium text-primary">
                    Go to Dashboard
                  </span>
                </span>

                <ChevronRight
                  size={17}
                  strokeWidth={1.8}
                  className="shrink-0 text-brand-text-muted transition-colors group-hover:text-primary"
                />
              </Link>
            </div>
          ) : (
            /* Guest Authentication */
            <>
              <p className="mb-3 text-center text-xs text-brand-text-muted">
                Get started with Coursify
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={closeSidebar}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-brand-border bg-white text-sm font-semibold text-brand-text transition-colors hover:border-primary/30 hover:bg-brand-soft hover:text-primary"
                >
                  <LogIn size={16} />
                  Login
                </Link>

                <Link
                  href="/signup"
                  onClick={closeSidebar}
                  className="group relative flex h-11 items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-primary-hover hover:shadow-lg hover:shadow-primary/20"
                >
                  <UserPlus size={16} />
                  Sign Up

                  <ArrowUpRight
                    size={14}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}