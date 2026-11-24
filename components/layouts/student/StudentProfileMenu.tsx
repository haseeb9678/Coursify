"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, LogOut } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { studentAccountNavigation } from "@/features/student/data/student-navigation.data";

import type { StudentProfile } from "@/features/student/types/student.types";

interface StudentProfileMenuProps {
  student?: StudentProfile | null;
  onLogout?: () => void | Promise<void>;
}

export default function StudentProfileMenu({
  student,
  onLogout,
}: StudentProfileMenuProps) {
  const name = student?.name?.trim() || "Student";

  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Open account menu"
            className="group flex cursor-pointer items-center gap-2.5 rounded-xl p-1.5 transition-colors hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        }
      >
        {/* Avatar */}
        <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/15 bg-primary/10 text-xs font-semibold text-primary">
          {student?.avatar ? (
            <Image
              src={student.avatar}
              alt={name}
              fill
              sizes="36px"
              className="object-cover"
            />
          ) : (
            initials
          )}
        </div>

        {/* Account information */}
        <div className="hidden max-w-28 text-left 2xl:block">
          <p className="truncate text-xs font-semibold text-brand-text">
            {name}
          </p>

          <p className="mt-0.5 text-[10px] text-brand-text-muted">
            Student
          </p>
        </div>

        <ChevronDown
          size={14}
          className="hidden text-brand-text-muted sm:block"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="w-64 rounded-xl border-brand-border bg-card p-1.5 shadow-lg"
      >
        {/* Account details */}
        <div className="space-y-1 px-3 py-3">
          <p className="truncate text-sm font-semibold text-brand-text">
            {name}
          </p>

          {student?.email && (
            <p className="truncate text-xs text-brand-text-muted">
              {student.email}
            </p>
          )}

          <span className="inline-flex rounded-md bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">
            Student account
          </span>
        </div>

        <DropdownMenuSeparator />

        {/* Account navigation */}
        {studentAccountNavigation.map(
          ({ label, href, icon: Icon }) => (
            <DropdownMenuItem
              key={href}
              render={<Link href={href} />}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-brand-text"
            >
              <Icon
                size={17}
                strokeWidth={1.7}
                className="text-brand-text-muted"
              />

              {label}
            </DropdownMenuItem>
          ),
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={!onLogout}
          onClick={() => void onLogout?.()}
          className="cursor-pointer gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 focus:bg-red-500/10 focus:text-red-600"
        >
          <LogOut size={17} strokeWidth={1.8} />

          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}