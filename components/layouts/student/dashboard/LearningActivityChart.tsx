"use client";

import { useId, useState } from "react";
import { useReducedMotion } from "motion/react";

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

import { cn } from "@/lib/utils";

import DashboardCard from "./DashboardCard";
import { DashboardPeriod, StudentDashboardData } from "@/features/student/types/dashboard.types";


interface LearningActivityChartProps {
  activity: StudentDashboardData["learningActivity"];
}

const chartConfig = {
  hours: {
    label: "Learning hours",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export default function LearningActivityChart({
  activity,
}: LearningActivityChartProps) {
  const [period, setPeriod] =
    useState<DashboardPeriod>("weekly");

  const shouldReduceMotion = useReducedMotion();

  const gradientId = useId().replace(/:/g, "");

  const chartData = activity[period];

  const totalHours = chartData.reduce(
    (total, item) => total + item.hours,
    0,
  );

  return (
    <DashboardCard
      delay={0.15}
      className="xl:col-span-2"
    >
      {/* Chart Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-brand-text sm:text-lg">
            Learning activity
          </h2>

          <p className="text-xs text-brand-text-muted sm:text-sm">
            Track your time spent learning.
          </p>
        </div>

        {/* Period Controls */}
        <div className="flex items-center gap-1 rounded-lg border border-brand-border bg-brand-page-secondary p-1">
          {(["weekly", "monthly"] as const).map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPeriod(item)}
                aria-pressed={period === item}
                className={cn(
                  "cursor-pointer rounded-md px-3 py-1.5",
                  "text-xs font-medium capitalize",
                  "transition-colors duration-200",

                  period === item
                    ? "bg-card text-primary shadow-sm"
                    : "text-brand-text-muted hover:text-brand-text",
                )}
              >
                {item}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Total Learning Hours */}
      <div className="mb-5 mt-6">
        <p className="text-3xl font-bold tracking-tight tabular-nums text-brand-text">
          {totalHours.toFixed(1)}

          <span className="ml-1.5 text-sm font-medium text-brand-text-muted">
            hours
          </span>
        </p>

        <p className="mt-1 text-xs text-brand-text-muted">
          {period === "weekly"
            ? "Learning time this week"
            : "Learning time this month"}
        </p>
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <ChartContainer
          config={chartConfig}
          className="h-60 w-full aspect-auto sm:h-72"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 10,
              left: 0,
              right: 12,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient
                id={gradientId}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--color-hours)"
                  stopOpacity={0.3}
                />

                <stop
                  offset="100%"
                  stopColor="var(--color-hours)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              strokeDasharray="4 4"
            />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              fontSize={12}
            />

            <YAxis
              width={36}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, "auto"]}
              tickFormatter={(value) => `${value}h`}
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
              key={period}
              type="monotone"
              dataKey="hours"
              stroke="var(--color-hours)"
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              isAnimationActive={!shouldReduceMotion}
              animationDuration={900}
              animationEasing="ease-out"
              activeDot={{
                r: 5,
                strokeWidth: 2,
                stroke: "var(--background)",
              }}
            />
          </AreaChart>
        </ChartContainer>
      ) : (
        <div className="flex h-60 items-center justify-center text-sm text-brand-text-muted">
          No learning activity available yet.
        </div>
      )}
    </DashboardCard>
  );
}