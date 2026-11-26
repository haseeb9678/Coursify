"use client";

import { formatDistanceToNow } from "date-fns";
import {
  BadgeCheck,
  BookOpenCheck,
  CreditCard,
  GraduationCap,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type {
  AdminActivity,
  AdminActivityType,
} from "@/features/admin/types/dashboard.types";

import AdminDashboardCard from "./AdminDashboardCard";

interface RecentActivityProps {
  activities: AdminActivity[];
}

interface ActivityPresentation {
  icon: typeof UserPlus;
  iconClass: string;
}

const activityPresentation: Record<
  AdminActivityType,
  ActivityPresentation
> = {
  user_registered: {
    icon: UserPlus,
    iconClass: "bg-primary/10 text-primary",
  },
  course_published: {
    icon: BookOpenCheck,
    iconClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  student_enrolled: {
    icon: GraduationCap,
    iconClass: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  },
  instructor_application: {
    icon: UsersRound,
    iconClass: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  },
  payment_received: {
    icon: CreditCard,
    iconClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  course_approved: {
    icon: BadgeCheck,
    iconClass: "bg-primary/10 text-primary",
  },
};

function formatActivityDate(value?: string | null): string {
  if (!value) return "Time unavailable";

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "Time unavailable";

  return formatDistanceToNow(timestamp, { addSuffix: true });
}

export default function RecentActivity({
  activities,
}: RecentActivityProps) {
  const sortedActivities = [...activities].sort((first, second) => {
    const firstTime = first.createdAt ? Date.parse(first.createdAt) : NaN;
    const secondTime = second.createdAt ? Date.parse(second.createdAt) : NaN;
    return (
      (Number.isFinite(secondTime) ? secondTime : 0) -
      (Number.isFinite(firstTime) ? firstTime : 0)
    );
  });

  return (
    <AdminDashboardCard delay={0.34}>
      <div>
        <h2 className="text-base font-semibold text-brand-text sm:text-lg">
          Recent activity
        </h2>
        <p className="mt-1 text-xs text-brand-text-muted sm:text-sm">
          A timeline of recent platform events.
        </p>
      </div>

      {sortedActivities.length > 0 ? (
        <div className="mt-5">
          {sortedActivities.slice(0, 6).map((activity, index) => {
            const presentation = activityPresentation[activity.type];
            const Icon = presentation.icon;

            return (
              <article
                key={activity.id}
                className="relative flex gap-3 pb-5 last:pb-0"
              >
                {index < Math.min(sortedActivities.length, 6) - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-4 top-9 h-[calc(100%-36px)] w-px bg-brand-border"
                  />
                )}
                <span
                  aria-hidden="true"
                  className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-lg ${presentation.iconClass}`}
                >
                  <Icon size={16} strokeWidth={1.8} />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-brand-text">
                      {activity.title}
                    </h3>
                    {activity.status && (
                      <Badge
                        variant="outline"
                        className="h-5 px-1.5 text-[10px] text-brand-text-muted"
                      >
                        {activity.status}
                      </Badge>
                    )}
                  </div>
                  {activity.description && (
                    <p className="line-clamp-2 text-xs leading-relaxed text-brand-text-muted">
                      {activity.description}
                    </p>
                  )}
                  <time
                    dateTime={activity.createdAt ?? undefined}
                    className="block text-[11px] text-brand-text-muted/80"
                  >
                    {formatActivityDate(activity.createdAt)}
                  </time>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-40 items-center justify-center text-center text-sm text-brand-text-muted">
          Platform activity will appear here.
        </div>
      )}
    </AdminDashboardCard>
  );
}
