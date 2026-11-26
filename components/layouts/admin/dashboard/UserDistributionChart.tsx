"use client";

import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { Cell, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type {
  AdminUserRole,
  UserDistributionItem,
} from "@/features/admin/types/dashboard.types";

import AdminDashboardCard from "./AdminDashboardCard";

interface UserDistributionChartProps {
  users: UserDistributionItem[];
}

const roleColors = {
  STUDENT: {
    light: "#2563EB",
    dark: "#60A5FA",
  },
  INSTRUCTOR: {
    light: "#047857",
    dark: "#34D399",
  },
  ADMIN: {
    light: "#B45309",
    dark: "#FBBF24",
  },
} as const;

const roleLabels: Record<AdminUserRole, string> = {
  STUDENT: "Students",
  INSTRUCTOR: "Instructors",
  ADMIN: "Administrators",
};

const chartConfig = {
  STUDENT: {
    label: roleLabels.STUDENT,
    theme: roleColors.STUDENT,
  },
  INSTRUCTOR: {
    label: roleLabels.INSTRUCTOR,
    theme: roleColors.INSTRUCTOR,
  },
  ADMIN: {
    label: roleLabels.ADMIN,
    theme: roleColors.ADMIN,
  },
  count: {
    label: "Users",
  },
} satisfies ChartConfig;

function formatCount(count: number): string {
  return new Intl.NumberFormat().format(count);
}

export default function UserDistributionChart({
  users,
}: UserDistributionChartProps) {
  const shouldReduceMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";
  const data = users.map((item) => ({
    ...item,
    count:
      Number.isFinite(item.count) && item.count > 0
        ? item.count
        : 0,
    label: roleLabels[item.role],
    fill: roleColors[item.role][theme],
  }));
  const totalUsers = data.reduce((sum, item) => sum + item.count, 0);
  const chartData = data.filter((item) => item.count > 0);

  return (
    <AdminDashboardCard delay={0.16}>
      <div>
        <h2 className="text-base font-semibold text-brand-text sm:text-lg">
          User distribution
        </h2>
        <p className="mt-1 text-xs text-brand-text-muted sm:text-sm">
          Platform users by account role.
        </p>
      </div>

      {totalUsers > 0 ? (
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
                    nameKey="role"
                    formatter={(value) => formatCount(Number(value))}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="role"
                innerRadius="68%"
                outerRadius="91%"
                paddingAngle={3}
                strokeWidth={0}
                isAnimationActive={!shouldReduceMotion}
                animationDuration={650}
              >
                {chartData.map((item) => (
                  <Cell
                    key={item.role}
                    fill={roleColors[item.role][theme]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular-nums text-brand-text">
              {formatCount(totalUsers)}
            </span>
            <span className="text-xs text-brand-text-muted">
              Total users
            </span>
          </div>
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center text-center text-sm text-brand-text-muted">
          No user distribution data is available.
        </div>
      )}

      <div className="mt-4 space-y-3">
        {data.map((item) => {
          const percentage =
            totalUsers > 0
              ? Math.round((item.count / totalUsers) * 100)
              : 0;

          return (
            <div
              key={item.role}
              className="flex items-center gap-2.5"
            >
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: roleColors[item.role][theme],
                }}
              />
              <span className="min-w-0 flex-1 truncate text-sm text-brand-text-muted">
                {roleLabels[item.role]}
              </span>
              <span className="text-xs tabular-nums text-brand-text-muted">
                {percentage}%
              </span>
              <span className="w-14 text-right text-sm font-semibold tabular-nums text-brand-text">
                {formatCount(item.count)}
              </span>
            </div>
          );
        })}
      </div>
    </AdminDashboardCard>
  );
}
