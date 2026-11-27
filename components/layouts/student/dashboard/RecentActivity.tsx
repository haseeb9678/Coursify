"use client";

import {
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  History,
} from "lucide-react";

import { formatDistanceToNow } from "date-fns";

import DashboardCard from "./DashboardCard";
import { RecentActivityItem } from "@/features/student/types/dashboard.types";


interface RecentActivityProps {
  activities: RecentActivityItem[];
  isDemo?: boolean;
}

const activityConfig = {
  lesson_completed: {
    icon: CheckCircle2,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },

  course_enrolled: {
    icon: BookOpen,
    color: "bg-primary/10 text-primary",
  },

  course_started: {
    icon: BookOpen,
    color: "bg-primary/10 text-primary",
  },

  certificate_earned: {
    icon: Award,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },

  course_completed: {
    icon: GraduationCap,
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
};

export default function RecentActivity({
  activities,
  isDemo = false,
}: RecentActivityProps) {
  const sortedActivities = [...activities].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime(),
  );

  return (
    <DashboardCard delay={0.35}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-brand-text">
            Recent activity
          </h2>

          <p className="mt-1 text-sm text-brand-text-muted">
            Your latest learning milestones.
          </p>
        </div>

        <History
          size={20}
          className="shrink-0 text-brand-text-muted"
        />
      </div>

      {sortedActivities.length > 0 ? (
        <div className="mt-5">
          {sortedActivities.slice(0, 5).map(
            (activity, index) => {
              const config =
                activityConfig[activity.type];

              const Icon = config.icon;

              return (
                <div
                  key={activity.id}
                  className="relative flex gap-3 pb-6 last:pb-0"
                >
                  {index <
                    Math.min(sortedActivities.length, 5) -
                      1 && (
                    <span
                      aria-hidden="true"
                      className="absolute left-5 top-10 h-[calc(100%-40px)] w-px bg-brand-border"
                    />
                  )}

                  <span
                    className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl ${config.color}`}
                  >
                    <Icon
                      size={19}
                      strokeWidth={1.8}
                    />
                  </span>

                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-semibold text-brand-text">
                      {activity.title}
                    </p>

                    <p className="line-clamp-2 text-xs leading-relaxed text-brand-text-muted">
                      {activity.description}
                    </p>

                    <p className="text-[11px] text-brand-text-muted/80">
                      {isDemo
                        ? "Sample activity"
                        : formatDistanceToNow(
                            new Date(activity.createdAt),
                            { addSuffix: true },
                          )}
                    </p>
                  </div>
                </div>
              );
            },
          )}
        </div>
      ) : (
        <div className="flex min-h-40 items-center justify-center text-center text-sm text-brand-text-muted">
          Your learning activities will appear here.
        </div>
      )}
    </DashboardCard>
  );
}