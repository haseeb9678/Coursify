import type { AdminStat } from "./AdminStatCard";
import AdminStatCard from "./AdminStatCard";

export default function AdminStatsGrid({
  stats,
  columns = 4,
}: {
  stats: AdminStat[];
  columns?: 3 | 4 | 5;
}) {
  return (
    <section
      aria-label="Management statistics"
      className={
        columns === 5
          ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
          : columns === 3
            ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            : "grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      }
    >
      {stats.map((stat) => (
        <AdminStatCard key={stat.label} stat={stat} />
      ))}
    </section>
  );
}
