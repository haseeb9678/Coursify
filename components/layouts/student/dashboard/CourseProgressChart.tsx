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
import { DashboardStatsData } from "@/features/student/types/dashboard.types";


interface CourseProgressChartProps {
  stats: DashboardStatsData;
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
}: CourseProgressChartProps) {
  const shouldReduceMotion = useAccessibleMotion();

  const notStarted = Math.max(
    0,
    stats.enrolledCourses -
      stats.completedCourses -
      stats.inProgressCourses,
  );

  const chartData = [
    {
      status: "completed",
      label: "Completed",
      count: stats.completedCourses,
      fill: "var(--color-completed)",
      color: "var(--primary)",
    },
    {
      status: "inProgress",
      label: "In progress",
      count: stats.inProgressCourses,
      fill: "var(--color-inProgress)",
      color: "#60a5fa",
    },
    {
      status: "notStarted",
      label: "Not started",
      count: notStarted,
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
        Your learning distribution.
      </p>

      {stats.enrolledCourses > 0 ? (
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
                    nameKey="status"
                  />
                }
              />

              <Pie
                data={chartData.filter(
                  (item) => item.count > 0,
                )}
                dataKey="count"
                nameKey="status"
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
              {stats.enrolledCourses}
            </span>

            <span className="text-xs text-brand-text-muted">
              Total courses
            </span>
          </div>
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center text-sm text-brand-text-muted">
          No enrolled courses yet.
        </div>
      )}

      {/* Custom Legend */}
      <div className="space-y-3">
        {chartData.map((item) => (
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