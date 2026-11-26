import type { AdminStat } from "./AdminStatCard";
import AdminStatCard from "./AdminStatCard";

export default function AdminStatsGrid({ stats }: { stats: AdminStat[] }) {
  return (
    <section
      aria-label="Management statistics"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {stats.map((stat) => (
        <AdminStatCard key={stat.label} stat={stat} />
      ))}
    </section>
  );
}
