"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

export default function InstructorTrendChart({ data, series, format }: {
  data: { period: string; [name: string]: string | number }[];
  series: ChartConfig;
  format?: (value: number) => string;
}) {
  if (!data.length) return <p className="grid min-h-40 place-content-center text-sm text-brand-text-muted">No records in this period.</p>;
  return <ChartContainer config={series} className="h-64 w-full">
    <LineChart data={data} accessibilityLayer margin={{ left: 6, right: 16, top: 8 }}>
      <CartesianGrid vertical={false} />
      <XAxis dataKey="period" tickFormatter={(value: string) => value.slice(5)} tickLine={false} axisLine={false} />
      <YAxis tickLine={false} axisLine={false} allowDecimals={false} tickFormatter={format} />
      <ChartTooltip content={<ChartTooltipContent formatter={format ? (value, name) => (
        <span className="flex w-full justify-between gap-4"><span>{series[String(name)]?.label ?? name}</span>{format(Number(value))}</span>
      ) : undefined} />} />
      <ChartLegend content={<ChartLegendContent />} />
      {Object.keys(series).map((key) => <Line key={key} type="monotone" dataKey={key} stroke={`var(--color-${key})`}
        strokeWidth={2} dot={data.length === 1} isAnimationActive={false} />)}
    </LineChart>
  </ChartContainer>;
}
