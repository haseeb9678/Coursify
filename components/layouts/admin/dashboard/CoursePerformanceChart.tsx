"use client";

import { useReducedMotion } from "motion/react";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import type { CoursePerformanceItem } from "@/features/admin/types/dashboard.types";
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";

import AdminDashboardCard from "./AdminDashboardCard";

interface CoursePerformanceChartProps {
  courses: CoursePerformanceItem[];
}

interface CourseTooltipProps {
  active?: boolean;
  payload?: Array<{ payload?: unknown }>;
}

const chartConfig = {
  enrollmentCount: {
    label: "Enrollments",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

function isCoursePerformanceItem(
  value: unknown,
): value is CoursePerformanceItem {
  return (
    typeof value === "object" &&
    value !== null &&
    "courseId" in value &&
    typeof value.courseId === "string" &&
    "courseName" in value &&
    typeof value.courseName === "string" &&
    "enrollmentCount" in value &&
    typeof value.enrollmentCount === "number"
  );
}

function CourseTooltip({ active, payload }: CourseTooltipProps) {
  const course = payload?.[0]?.payload;
  if (!active || !isCoursePerformanceItem(course)) return null;

  return (
    <div className="grid min-w-48 gap-1.5 rounded-lg border border-brand-border bg-background px-3 py-2.5 text-xs shadow-xl">
      <p className="font-semibold text-brand-text">{course.courseName}</p>
      <p className="text-brand-text-muted">
        {new Intl.NumberFormat().format(course.enrollmentCount)} enrollments
      </p>
      {course.completionRate != null &&
        Number.isFinite(course.completionRate) && (
          <p className="text-brand-text-muted">
            Completion rate: {course.completionRate}%
          </p>
        )}
      {course.averageRating != null &&
        Number.isFinite(course.averageRating) && (
          <p className="text-brand-text-muted">
            Average rating: {course.averageRating.toFixed(1)} / 5
          </p>
        )}
    </div>
  );
}

function shortenCourseName(name: string): string {
  return name.length > 20 ? `${name.slice(0, 18)}…` : name;
}

export default function CoursePerformanceChart({
  courses,
}: CoursePerformanceChartProps) {
  const shouldReduceMotion = useReducedMotion();
  const chartData = courses.filter(
    (course) =>
      Number.isFinite(course.enrollmentCount) &&
      course.enrollmentCount >= 0,
  );

  return (
    <AdminDashboardCard delay={0.22}>
      <div>
        <h2 className="text-base font-semibold text-brand-text sm:text-lg">
          Course performance
        </h2>
        <p className="mt-1 text-xs text-brand-text-muted sm:text-sm">
          Top courses by total enrollments.
        </p>
      </div>

      {chartData.length > 0 ? (
        <ChartContainer
          config={chartConfig}
          className="mt-5 h-64 min-w-0 w-full aspect-auto sm:h-72"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 12, bottom: 4, left: 2 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="4 4" />
            <XAxis
              type="number"
              dataKey="enrollmentCount"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: number) =>
                new Intl.NumberFormat().format(value)
              }
            />
            <YAxis
              type="category"
              dataKey="courseName"
              width={126}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
              tickFormatter={shortenCourseName}
            />
            <Tooltip
              cursor={{ fill: "var(--brand-soft)", opacity: 0.5 }}
              content={<CourseTooltip />}
            />
            <Bar
              dataKey="enrollmentCount"
              fill="var(--color-enrollmentCount)"
              radius={[0, 5, 5, 0]}
              maxBarSize={24}
              isAnimationActive={!shouldReduceMotion}
              animationDuration={650}
            />
          </BarChart>
        </ChartContainer>
      ) : (
        <div className="flex h-64 items-center justify-center text-center text-sm text-brand-text-muted">
          No course performance data is available.
        </div>
      )}
    </AdminDashboardCard>
  );
}
