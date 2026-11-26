import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface AdminStat {
  label: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  tone?: "primary" | "green" | "amber" | "red" | "violet";
}

const toneClasses: Record<NonNullable<AdminStat["tone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  green: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  red: "bg-destructive/10 text-destructive",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

export default function AdminStatCard({ stat }: { stat: AdminStat }) {
  const Icon = stat.icon;
  const tone = stat.tone ?? "primary";

  return (
    <Card className="min-w-0 border border-brand-border bg-card shadow-sm">
      <CardContent className="flex items-start justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-brand-text-muted">
            {stat.label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-brand-text tabular-nums">
            {stat.value}
          </p>
          <p className="mt-1 text-xs text-brand-text-muted">{stat.description}</p>
        </div>
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
          <Icon size={19} aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}
