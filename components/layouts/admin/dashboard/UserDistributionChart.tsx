"use client";


import { useAccessibleMotion } from "@/features/accessibility/hooks/use-accessible-motion";
import { useTheme } from "next-themes";
import { Cell, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
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

type ChartTheme = keyof (typeof roleColors)["STUDENT"];

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

function isAdminUserRole(value: unknown): value is AdminUserRole {
  return value === "STUDENT" || value === "INSTRUCTOR" || value === "ADMIN";
}

function isDistributionPoint(
  value: unknown,
): value is { role: AdminUserRole; count: number } {
  return (
    typeof value === "object" &&
    value !== null &&
    "role" in value &&
    isAdminUserRole(value.role) &&
    "count" in value &&
    typeof value.count === "number" &&
    Number.isFinite(value.count)
  );
}

interface DistributionTooltipProps {
  active?: boolean;
  payload?: Array<{ payload?: unknown }>;
  totalUsers: number;
  theme: ChartTheme;
}

function DistributionTooltip({
  active,
  payload,
  totalUsers,
  theme,
}: DistributionTooltipProps) {
  const point = payload?.[0]?.payload;
  if (!active || !isDistributionPoint(point)) return null;

  const percentage =
    totalUsers > 0 ? (point.count / totalUsers) * 100 : 0;

  return (
    <div className="min-w-44 rounded-xl border border-brand-border bg-card/95 p-3.5 text-brand-text shadow-xl ring-1 ring-black/5 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="size-3 shrink-0 rounded-full ring-2 ring-background"
          style={{ backgroundColor: roleColors[point.role][theme] }}
        />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">
          {roleLabels[point.role]}
        </span>
        <span className="rounded-full bg-brand-page-secondary px-2 py-0.5 text-[11px] font-medium tabular-nums text-brand-text-muted">
          {percentage.toFixed(1)}%
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-5 border-t border-brand-border/80 pt-2.5 text-xs">
        <span className="text-brand-text-muted">Accounts</span>
        <span className="font-semibold tabular-nums text-brand-text">
          {formatCount(point.count)}
        </span>
      </div>
    </div>
  );
}

export default function UserDistributionChart({
  users,
}: UserDistributionChartProps) {
  const shouldReduceMotion = useAccessibleMotion();
  const { resolvedTheme } = useTheme();
  const theme: ChartTheme =
    resolvedTheme === "dark" ? "dark" : "light";
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
                wrapperStyle={{ outline: "none", zIndex: 50 }}
                content={
                  <DistributionTooltip
                    totalUsers={totalUsers}
                    theme={theme}
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
                stroke="var(--card)"
                strokeWidth={3}
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
