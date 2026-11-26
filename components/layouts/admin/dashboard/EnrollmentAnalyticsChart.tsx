"use client";

import { useAccessibleMotion } from "@/features/accessibility/hooks/use-accessible-motion";
import { useId, useState } from "react";

import { useTheme } from "next-themes";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type {
  AdminDashboardPeriod,
  PeriodAnalytics,
  EnrollmentAnalyticsPoint,
} from "@/features/admin/types/dashboard.types";

import AdminDashboardCard from "./AdminDashboardCard";

interface EnrollmentAnalyticsChartProps {
  analytics: PeriodAnalytics<EnrollmentAnalyticsPoint>;
}

const enrollmentColors = {
  newEnrollments: {
    light: "#2563EB",
    dark: "#60A5FA",
  },
  completedEnrollments: {
    light: "#047857",
    dark: "#34D399",
  },
} as const;

const chartConfig = {
  newEnrollments: {
    label: "New enrollments",
    theme: enrollmentColors.newEnrollments,
  },
  completedEnrollments: {
    label: "Completed enrollments",
    theme: enrollmentColors.completedEnrollments,
  },
} satisfies ChartConfig;

const periods: AdminDashboardPeriod[] = [
  "weekly",
  "monthly",
  "yearly",
];

const periodLabels: Record<AdminDashboardPeriod, string> = {
  weekly: "Week",
  monthly: "Month",
  yearly: "Year",
};

function sumValues(
  points: EnrollmentAnalyticsPoint[],
  key: keyof Pick<
    EnrollmentAnalyticsPoint,
    "newEnrollments" | "completedEnrollments"
  >,
): number {
  return points.reduce((total, point) => {
    const value = point[key];
    return total + (Number.isFinite(value) ? value : 0);
  }, 0);
}

export default function EnrollmentAnalyticsChart({
  analytics,
}: EnrollmentAnalyticsChartProps) {
  const [period, setPeriod] = useState<AdminDashboardPeriod>("monthly");
  const shouldReduceMotion = useAccessibleMotion();
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";
  const gradientId = useId().replace(/:/g, "");
  const chartData = Array.isArray(analytics[period])
    ? analytics[period].filter(
        (point) =>
          Number.isFinite(point.newEnrollments) &&
          Number.isFinite(point.completedEnrollments),
      )
    : [];
  const newTotal = sumValues(chartData, "newEnrollments");
  const completedTotal = sumValues(
    chartData,
    "completedEnrollments",
  );
  const numberFormatter = new Intl.NumberFormat();

  return (
    <AdminDashboardCard className="xl:col-span-2" delay={0.12}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-brand-text sm:text-lg">
            Enrollment analytics
          </h2>
          <p className="mt-1 text-xs text-brand-text-muted sm:text-sm">
            New and completed enrollments over time.
          </p>
        </div>

        <div
          role="group"
          aria-label="Enrollment chart period"
          className="flex items-center gap-1 rounded-lg border border-brand-border bg-brand-page-secondary p-1"
        >
          {periods.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPeriod(option)}
              aria-pressed={period === option}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3 ${
                period === option
                  ? "bg-card text-primary shadow-sm"
                  : "text-brand-text-muted hover:text-brand-text"
              }`}
            >
              {periodLabels[option]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
        <div>
          <p className="text-xs text-brand-text-muted">New enrollments</p>
          <p className="mt-1 text-xl font-bold tabular-nums text-brand-text">
            {numberFormatter.format(newTotal)}
          </p>
        </div>
        <div>
          <p className="text-xs text-brand-text-muted">
            Completed enrollments
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums text-brand-text">
            {numberFormatter.format(completedTotal)}
          </p>
        </div>
      </div>

      {chartData.length > 0 ? (
        <ChartContainer
          config={chartConfig}
          className="mt-3 h-60 min-w-0 w-full aspect-auto sm:h-72"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 10, left: 0, right: 12, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id={`${gradientId}-new`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={enrollmentColors.newEnrollments[theme]}
                  stopOpacity={0.28}
                />
                <stop
                  offset="100%"
                  stopColor={enrollmentColors.newEnrollments[theme]}
                  stopOpacity={0.02}
                />
              </linearGradient>
              <linearGradient
                id={`${gradientId}-completed`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={enrollmentColors.completedEnrollments[theme]}
                  stopOpacity={0.18}
                />
                <stop
                  offset="100%"
                  stopColor={enrollmentColors.completedEnrollments[theme]}
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="4 4" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={16}
            />
            <YAxis
              width={42}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, "auto"]}
              tickFormatter={(value: number) =>
                numberFormatter.format(value)
              }
            />
            <ChartTooltip
              cursor={{
                stroke: "var(--primary)",
                strokeDasharray: "4 4",
                strokeOpacity: 0.3,
              }}
              content={<ChartTooltipContent />}
            />
            <Area
              key={`${period}-new`}
              type="monotone"
              dataKey="newEnrollments"
              stroke={enrollmentColors.newEnrollments[theme]}
              strokeWidth={2.25}
              fill={`url(#${gradientId}-new)`}
              isAnimationActive={!shouldReduceMotion}
              animationDuration={700}
              animationEasing="ease-out"
              activeDot={{ r: 4, stroke: "var(--background)" }}
            />
            <Area
              key={`${period}-completed`}
              type="monotone"
              dataKey="completedEnrollments"
              stroke={enrollmentColors.completedEnrollments[theme]}
              strokeWidth={2}
              fill={`url(#${gradientId}-completed)`}
              isAnimationActive={!shouldReduceMotion}
              animationDuration={700}
              animationEasing="ease-out"
              activeDot={{ r: 4, stroke: "var(--background)" }}
            />
          </AreaChart>
        </ChartContainer>
      ) : (
        <div className="flex h-60 items-center justify-center text-sm text-brand-text-muted">
          No enrollment data is available for this period.
        </div>
      )}
    </AdminDashboardCard>
  );
}
