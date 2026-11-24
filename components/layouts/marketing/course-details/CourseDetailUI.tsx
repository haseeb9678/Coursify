import type { ReactNode } from "react";

interface DetailItemProps {
  icon: ReactNode;
  label: string;
  value: string;
}

export function QuickInfo({ icon, label, value }: DetailItemProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>

      <div>
        <p className="text-[10px] text-brand-text-muted">{label}</p>
        <p className="text-xs font-bold text-brand-text">{value}</p>
      </div>
    </div>
  );
}

export function IncludedItem({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 text-xs text-brand-text-muted">
      <span className="shrink-0 text-primary">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

export function StatCard({ icon, label, value }: DetailItemProps) {
  return (
    <div className="rounded-xl border border-brand-border bg-card p-3 sm:p-4">
      <span className="mb-3 flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>

      <p className="text-[10px] text-brand-text-muted">{label}</p>

      <p className="mt-1 truncate text-sm font-extrabold text-brand-text">
        {value}
      </p>
    </div>
  );
}

export function InstructorStat({
  icon,
  value,
}: {
  icon: ReactNode;
  value: string;
}) {
  return (
    <span className="flex items-center gap-1.5 text-[10px] font-bold text-brand-text">
      {icon}
      {value}
    </span>
  );
}