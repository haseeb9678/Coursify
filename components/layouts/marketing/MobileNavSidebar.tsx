
"use client";

import Link from "next/link";
import {
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  ArrowUpRight,
  LogIn,
  UserPlus,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";

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

  const closeSidebar = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex w-[300px] flex-col overflow-hidden border-r border-brand-border bg-white p-0 sm:w-[360px]"
      >
        <SheetHeader className="border-b border-brand-border px-5 py-6 text-left">
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

        <div className="border-t border-brand-border bg-brand-page-secondary/60 p-5">
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
