"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, ArrowUpRight } from "lucide-react";

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

  const navigation = [
    ...studentNavigation,
    ...studentAccountNavigation,
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[min(340px,90vw)] gap-0 border-brand-border bg-background p-0"
      >
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

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
          <div className="mb-6">
            <StudentSearchBar />
          </div>

          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-text-muted">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map(({ label, href, icon: Icon }) => {
              const isActive =
                pathname === href ||
                pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => onOpenChange(false)}
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
                onClick={() => onOpenChange(false)}
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