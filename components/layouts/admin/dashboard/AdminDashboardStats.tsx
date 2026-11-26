"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BookOpenCheck,
  CircleDollarSign,
  Minus,
  UsersRound,
  UserRoundCheck,
  UserRoundCog,
} from "lucide-react";

import type {
  AdminDashboardMetric,
  AdminDashboardStats as AdminDashboardStatsData,
} from "@/features/admin/types/dashboard.types";

import AdminDashboardCard from "./AdminDashboardCard";

interface AdminDashboardStatsProps {
  stats: AdminDashboardStatsData;
  currency: {
    code: string;
    locale: string;
  };
}

const metricPresentation = {
  totalUsers: {
    label: "Total users",
    icon: UsersRound,
    iconClass: "bg-primary/10 text-primary",
  },
  activeStudents: {
    label: "Active students",
    icon: UserRoundCheck,
    iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  instructors: {
    label: "Instructors",
    icon: UserRoundCog,
    iconClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  publishedCourses: {
    label: "Published courses",
    icon: BookOpenCheck,
    iconClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
  totalEnrollments: {
    label: "Total enrollments",
    icon: Activity,
    iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  totalRevenue: {
    label: "Total revenue",
    icon: CircleDollarSign,
    iconClass: "bg-primary/10 text-primary",
  },
} as const;

function formatMetricValue(
  metricId: keyof AdminDashboardStatsData,
  value: number | null,
  locale: string,
  currency: string,
): string {
  if (value === null || !Number.isFinite(value)) return "—";

  if (metricId === "totalRevenue") {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  }

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(value);
}

function Trend({
  metric,
}: {
  metric: AdminDashboardMetric;
}) {
  const trend = metric.trend ?? "neutral";
  const TrendIcon =
    trend === "positive"
      ? ArrowUpRight
      : trend === "negative"
        ? ArrowDownRight
        : Minus;
  const colorClass =
    trend === "positive"
      ? "text-emerald-600 dark:text-emerald-400"
      : trend === "negative"
        ? "text-red-600 dark:text-red-400"
        : "text-brand-text-muted";
  const change =
    metric.percentageChange !== null &&
    Number.isFinite(metric.percentageChange)
      ? `${metric.percentageChange > 0 ? "+" : ""}${metric.percentageChange.toFixed(1)}%`
      : "Change unavailable";

  return (
    <p className={`flex min-w-0 items-center gap-1 text-xs ${colorClass}`}>
      {metric.percentageChange !== null &&
        Number.isFinite(metric.percentageChange) && (
          <TrendIcon size={14} aria-hidden="true" />
        )}
      <span className="font-semibold tabular-nums">{change}</span>
      <span className="truncate text-brand-text-muted">
        {metric.comparisonPeriod}
      </span>
    </p>
  );
}

export default function AdminDashboardStats({
  stats,
  currency,
}: AdminDashboardStatsProps) {
  return (
    <section
      aria-label="Platform statistics"
      className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 xl:gap-4"
    >
      {(
        Object.keys(metricPresentation) as Array<
          keyof AdminDashboardStatsData
        >
      ).map((metricId, index) => {
        const presentation = metricPresentation[metricId];
        const Icon = presentation.icon;
        const metric = stats[metricId];

        return (
          <AdminDashboardCard
            key={metricId}
            delay={index * 0.04}
            className="flex min-h-36 flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-brand-text-muted">
                  {presentation.label}
                </p>
                <p className="mt-3 truncate text-2xl font-bold tracking-tight tabular-nums text-brand-text sm:text-3xl">
                  {formatMetricValue(
                    metricId,
                    metric.value,
                    currency.locale,
                    currency.code,
                  )}
                </p>
              </div>
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${presentation.iconClass}`}
              >
                <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
              </span>
            </div>

            <div className="mt-3 space-y-1">
              <Trend metric={metric} />
              {metric.description && (
                <p className="truncate text-[11px] text-brand-text-muted/80">
                  {metric.description}
                </p>
              )}
            </div>
          </AdminDashboardCard>
        );
      })}
    </section>
  );
}
