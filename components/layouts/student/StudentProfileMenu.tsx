"use client";

import Link from "next/link";
import Image from "next/image";

import {
  ChevronDown,
  LogOut,
  LoaderCircle,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { studentAccountNavigation } from "@/features/student/data/student-navigation.data";

import type { StudentProfileMenuProps } from "@/features/student/types/student.types";

export default function StudentProfileMenu({
  student,
  onLogout,
  isLoggingOut = false,
}: StudentProfileMenuProps) {
  // User information
  const name = student.name.trim() || "Student";
  const role = student.role.toLowerCase();

  // Generate profile initials
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

  // Handle logout
  const handleLogout = () => {
    if (isLoggingOut) return;

    onLogout();
  };

  return (
    <DropdownMenu>
      {/* Profile Trigger */}
      <DropdownMenuTrigger
        disabled={isLoggingOut}
        render={
          <button
            type="button"
            aria-label={
              isLoggingOut
                ? "Signing out"
                : "Open account menu"
            }
            aria-busy={isLoggingOut}
            className="
              group flex cursor-pointer items-center gap-2.5
              rounded-xl p-1.5 transition-colors
              hover:bg-brand-soft
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-primary
              disabled:cursor-not-allowed
              disabled:opacity-70
            "
          />
        }
      >
        {/* Avatar */}
        <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/15 bg-primary/10 text-xs font-semibold text-primary">
          {isLoggingOut ? (
            <LoaderCircle
              size={19}
              strokeWidth={1.8}
              className="animate-spin motion-reduce:animate-none"
            />
          ) : student.avatar ? (
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

        {/* Account Information */}
        <div className="hidden max-w-28 text-left 2xl:block">
          <p
            title={name}
            className="truncate text-xs font-semibold text-brand-text"
          >
            {name}
          </p>

          <p className="mt-0.5 text-[10px] capitalize text-brand-text-muted">
            {isLoggingOut ? "Signing out..." : role}
          </p>
        </div>

        <ChevronDown
          size={14}
          className="hidden text-brand-text-muted sm:block"
        />
      </DropdownMenuTrigger>

      {/* Profile Dropdown */}
      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="w-64 rounded-xl border-brand-border bg-card p-1.5 shadow-lg"
      >
        {/* Account Details */}
        <div className="space-y-1 px-3 py-3">
          <p
            title={name}
            className="truncate text-sm font-semibold text-brand-text"
          >
            {name}
          </p>

          <p
            title={student.email}
            className="truncate text-xs text-brand-text-muted"
          >
            {student.email}
          </p>

          <span className="inline-flex rounded-md bg-primary/10 px-2 py-1 text-[10px] font-medium capitalize text-primary">
            {role} account
          </span>
        </div>

        <DropdownMenuSeparator />

        {/* Account Navigation */}
        {studentAccountNavigation.map(
          ({ label, href, icon: Icon }) => (
            <DropdownMenuItem
              key={href}
              disabled={isLoggingOut}
              render={<Link href={href} />}
              className="
                flex cursor-pointer items-center gap-3
                rounded-lg px-3 py-2.5
                text-sm text-brand-text
                transition-colors duration-200
              "
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

        {/* Logout */}
        <DropdownMenuItem
          disabled={isLoggingOut}
          onClick={handleLogout}
          className="
            flex cursor-pointer items-center gap-3
            rounded-lg px-3 py-2.5
            text-sm font-medium
            text-red-600!
            transition-colors duration-200

            hover:bg-red-500/10!
            hover:text-red-600!

            focus:bg-red-500/10!
            focus:text-red-600!

            data-highlighted:bg-red-500/10!
            data-highlighted:text-red-600!

            [&_svg]:text-red-600!

            dark:text-red-400!
            dark:hover:text-red-400!
            dark:focus:text-red-400!
            dark:data-highlighted:text-red-400!
            dark:[&_svg]:text-red-400!

            data-disabled:cursor-not-allowed
            data-disabled:opacity-60
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {isLoggingOut ? (
            <LoaderCircle
              size={17}
              strokeWidth={1.8}
              className="animate-spin motion-reduce:animate-none"
            />
          ) : (
            <LogOut
              size={17}
              strokeWidth={1.8}
            />
          )}

          <span>
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}