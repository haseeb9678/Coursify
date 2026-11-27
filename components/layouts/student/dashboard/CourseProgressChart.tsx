"use client";


import { useAccessibleMotion } from "@/features/accessibility/hooks/use-accessible-motion";
import { Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import DashboardCard from "./DashboardCard";
import type { EnrollmentStats } from "@/features/commerce/commerce.types";
import { DashboardStatsData } from "@/features/student/types/dashboard.types";


interface CourseProgressChartProps {
  stats?: DashboardStatsData;
  enrollmentStats?: EnrollmentStats;
}

const chartConfig = {
  count: {
    label: "Courses",
  },

  completed: {
    label: "Completed",
    color: "var(--primary)",
  },

  inProgress: {
    label: "In progress",
    color: "#60a5fa",
  },

  notStarted: {
    label: "Not started",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig;

export default function CourseProgressChart({
  stats,
  enrollmentStats,
}: CourseProgressChartProps) {
  const shouldReduceMotion = useAccessibleMotion();

  const total = stats?.enrolledCourses ?? enrollmentStats?.total;
  const completed = stats?.completedCourses ?? enrollmentStats?.completed ?? 0;
  const active = stats?.inProgressCourses ?? enrollmentStats?.active ?? 0;
  const remaining = Math.max(0, (total ?? 0) - completed - active);

  const chartData = [
    {
      status: "completed",
      label: "Completed",
      count: completed,
      fill: "var(--color-completed)",
      color: "var(--primary)",
    },
    {
      status: "inProgress",
      label: stats ? "In progress" : "Active enrollment",
      count: active,
      fill: "var(--color-inProgress)",
      color: "#60a5fa",
    },
    {
      status: "notStarted",
      label: stats ? "Not started" : "Inactive enrollment",
      count: remaining,
      fill: "var(--color-notStarted)",
      color: "var(--muted-foreground)",
    },
  ];

  return (
    <DashboardCard delay={0.2}>
      <h2 className="text-lg font-semibold text-brand-text">
        Course progress
      </h2>

      <p className="mt-1 text-sm text-brand-text-muted">
        {stats ? "Your learning distribution." : "Enrollment status. Lesson progress tracking is unavailable."}
      </p>

      {total ? (
        <div className="relative mx-auto mt-3 max-w-64">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full"
          >
            <PieChart accessibilityLayer>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    nameKey="label"
                  />
                }
              />

              <Pie
                data={chartData.filter(
                  (item) => item.count > 0,
                )}
                dataKey="count"
                nameKey="label"
                innerRadius="72%"
                outerRadius="92%"
                paddingAngle={4}
                strokeWidth={0}
                cornerRadius={5}
                isAnimationActive={!shouldReduceMotion}
                animationDuration={900}
              />
            </PieChart>
          </ChartContainer>

          {/* Center Label */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular-nums text-brand-text">
              {total}
            </span>

            <span className="text-xs text-brand-text-muted">
              Total courses
            </span>
          </div>
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center text-sm text-brand-text-muted">
          {total === undefined ? "Enrollment totals unavailable." : "No enrolled courses yet."}
        </div>
      )}

      {/* Custom Legend */}
      <div className="space-y-3">
        {total !== undefined && chartData.map((item) => (
          <div
            key={item.status}
            className="flex items-center gap-2.5"
          >
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />

            <span className="flex-1 text-sm text-brand-text-muted">
              {item.label}
            </span>

            <span className="text-sm font-semibold tabular-nums text-brand-text">
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}