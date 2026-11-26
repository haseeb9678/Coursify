"use client";

import { useAccessibleMotion } from "@/features/accessibility/hooks/use-accessible-motion";
import { useId, useState } from "react";

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
  RevenueAnalytics,
} from "@/features/admin/types/dashboard.types";

import AdminDashboardCard from "./AdminDashboardCard";

interface RevenueAnalyticsChartProps {
  analytics: RevenueAnalytics;
  currency: {
    code: string;
    locale: string;
  };
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--primary)",
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

function formatCurrency(
  value: number,
  currency: RevenueAnalyticsChartProps["currency"],
  compact = false,
): string {
  if (!Number.isFinite(value)) return "—";

  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
    maximumFractionDigits: 0,
    ...(compact ? { notation: "compact" as const } : {}),
  }).format(value);
}

export default function RevenueAnalyticsChart({
  analytics,
  currency,
}: RevenueAnalyticsChartProps) {
  const [period, setPeriod] = useState<AdminDashboardPeriod>("monthly");
  const shouldReduceMotion = useAccessibleMotion();
  const gradientId = useId().replace(/:/g, "");
  const chartData = Array.isArray(analytics[period])
    ? analytics[period].filter((point) =>
        Number.isFinite(point.revenue),
      )
    : [];
  const totalRevenue = chartData.reduce(
    (total, point) => total + point.revenue,
    0,
  );
  const growth = analytics.growthPercent[period];
  const isGrowthAvailable =
    growth !== null && Number.isFinite(growth);

  return (
    <AdminDashboardCard delay={0.2}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-brand-text sm:text-lg">
            Revenue analytics
          </h2>
          <p className="mt-1 text-xs text-brand-text-muted sm:text-sm">
            Revenue trends for the selected period.
          </p>
        </div>

        <div
          role="group"
          aria-label="Revenue chart period"
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

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-bold tracking-tight tabular-nums text-brand-text">
            {formatCurrency(totalRevenue, currency)}
          </p>
          <p className="mt-1 text-xs text-brand-text-muted">
            Revenue this {period.replace("ly", "")}
          </p>
        </div>

        <p
          className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
            !isGrowthAvailable
              ? "bg-brand-soft text-brand-text-muted"
              : growth >= 0
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-red-500/10 text-red-700 dark:text-red-400"
          }`}
        >
          {isGrowthAvailable
            ? `${growth > 0 ? "+" : ""}${growth.toFixed(1)}% growth`
            : "Growth unavailable"}
        </p>
      </div>

      {chartData.length > 0 ? (
        <ChartContainer
          config={chartConfig}
          className="mt-3 h-60 min-w-0 w-full aspect-auto sm:h-72"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 10, left: 4, right: 12, bottom: 0 }}
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
                  stopColor="var(--color-revenue)"
                  stopOpacity={0.28}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-revenue)"
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
              width={72}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, "auto"]}
              tickFormatter={(value: number) =>
                formatCurrency(value, currency, true)
              }
            />
            <ChartTooltip
              cursor={{
                stroke: "var(--primary)",
                strokeDasharray: "4 4",
                strokeOpacity: 0.3,
              }}
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    formatCurrency(Number(value), currency)
                  }
                />
              }
            />
            <Area
              key={period}
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-revenue)"
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              isAnimationActive={!shouldReduceMotion}
              animationDuration={750}
              animationEasing="ease-out"
              activeDot={{ r: 4, stroke: "var(--background)" }}
            />
          </AreaChart>
        </ChartContainer>
      ) : (
        <div className="flex h-60 items-center justify-center text-sm text-brand-text-muted">
          No revenue data is available for this period.
        </div>
      )}
    </AdminDashboardCard>
  );
}
