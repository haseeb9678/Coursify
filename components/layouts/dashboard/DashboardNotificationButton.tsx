"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

import type { DashboardNotificationButtonProps } from "@/features/dashboard/types/dashboard.types";
import { formatNotificationCount } from "@/features/dashboard/utils/dashboard.utils";

export default function DashboardNotificationButton({
  notificationCount = 0,
  notificationRoute,
  isRouteImplemented = true,
}: DashboardNotificationButtonProps) {
  const ariaLabel =
    notificationCount > 0
      ? `Notifications, ${notificationCount} unread`
      : "Notifications";
  const className =
    "relative flex size-10 shrink-0 items-center justify-center rounded-lg text-brand-text-muted transition-colors duration-200 hover:bg-brand-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  const contents = (
    <>
      <Bell size={21} strokeWidth={1.7} />

      {notificationCount > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-background bg-primary px-0.5 text-[9px] font-semibold text-primary-foreground">
          {formatNotificationCount(notificationCount)}
        </span>
      )}
    </>
  );

  if (!isRouteImplemented) {
    return (
      <button
        type="button"
        disabled
        aria-label={`${ariaLabel} (planned)`}
        title="Notifications are planned"
        className={`${className} cursor-not-allowed opacity-60`}
      >
        {contents}
      </button>
    );
  }

  return (
    <Link
      href={notificationRoute}
      aria-label={ariaLabel}
      className={className}
    >
      {contents}
    </Link>
  );
}
