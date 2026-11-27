"use client";

import { BookOpen, CheckCircle2, CircleAlert, Clock3, ShoppingBag } from "lucide-react";
import AdminStatsGrid from "@/components/layouts/admin/shared/AdminStatsGrid";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";
import { CommerceMessage } from "./CommerceUi";
import { commerceMoney } from "./commerce-format";
import { useStudentCommerceStats } from "./student-queries";

interface Props {
  kind: "courses" | "purchases" | "payments";
  query: ReturnType<typeof useStudentCommerceStats>;
}

export default function StudentCommerceStats({ kind, query }: Props) {
  if (query.isPending) {
    return <div className="grid gap-3 sm:grid-cols-3" role="status" aria-label="Loading totals">
      {[0, 1, 2].map((index) => <Skeleton key={index} className="h-32 rounded-xl" />)}
    </div>;
  }
  if (query.isError || !query.data) {
    return <CommerceMessage title="Totals unavailable" message={getGraphQLErrorMessage(query.error)}
      actions={<Button variant="outline" busy={query.isFetching} onClick={() => void query.refetch()}>Retry totals</Button>} />;
  }

  const data = query.data;
  if (kind === "courses") {
    return <AdminStatsGrid columns={3} stats={[
      { label: "Total enrolled courses", value: data.enrollments.total, description: "All enrollments", icon: BookOpen },
      { label: "Active courses", value: data.enrollments.active, description: "Active enrollments", icon: BookOpen, tone: "primary" },
      { label: "Completed courses", value: data.enrollments.completed, description: "Recorded completions", icon: CheckCircle2, tone: "green" },
    ]} />;
  }
  if (kind === "purchases") {
    const totals = data.orders.reduce((all, entry) => ({
      total: all.total + entry.total, paid: all.paid + entry.paid, pending: all.pending + entry.pending,
    }), { total: 0, paid: 0, pending: 0 });
    return <div className="space-y-3">
      <AdminStatsGrid columns={3} stats={[
        { label: "Total orders", value: totals.total, description: "All course orders", icon: ShoppingBag },
        { label: "Successful purchases", value: totals.paid, description: "Orders with a confirmed payment", icon: CheckCircle2, tone: "green" },
        { label: "Pending orders", value: totals.pending, description: "Awaiting payment confirmation", icon: Clock3, tone: "amber" },
      ]} />
      <CurrencyTotals label="Total paid before refunds" rows={data.orders.filter((order) => order.paid > 0)
        .map((order) => ({ ...order, minorUnits: order.totalPaidMinorUnits }))} />
    </div>;
  }

  const totals = data.payments.counts.reduce((all, entry) => ({
    successful: all.successful + entry.successful, pending: all.pending + entry.pending, failed: all.failed + entry.failed,
  }), { successful: 0, pending: 0, failed: 0 });
  return <div className="space-y-3">
    <AdminStatsGrid columns={3} stats={[
      { label: "Successful payments", value: totals.successful, description: "Confirmed payments", icon: CheckCircle2, tone: "green" },
      { label: "Pending payments", value: totals.pending, description: "Pending and processing attempts", icon: Clock3, tone: "amber" },
      { label: "Failed attempts", value: totals.failed, description: "Payments recorded as failed", icon: CircleAlert, tone: "red" },
    ]} />
    <CurrencyTotals label="Refunded amount" rows={data.payments.totals
      .map((entry) => ({ ...entry, minorUnits: entry.refundedMinorUnits }))} />
  </div>;
}

function CurrencyTotals({ label, rows }: {
  label: string;
  rows: { isTestMode: boolean; currency: string; minorUnits: string }[];
}) {
  return <section className="space-y-2 rounded-xl border border-brand-border bg-card p-4">
    <h2 className="text-sm font-semibold text-brand-text">{label}</h2>
    {rows.length ? <dl className="flex flex-wrap gap-x-8 gap-y-3">
      {rows.map((row) => <div key={`${row.isTestMode}-${row.currency}`} className="min-w-28">
        <dt className="text-xs text-brand-text-muted">{row.isTestMode ? "Stripe Sandbox" : "Live"} ? {row.currency}</dt>
        <dd className="font-semibold tabular-nums text-brand-text">{commerceMoney(row.minorUnits, row.currency)}</dd>
      </div>)}
    </dl> : <p className="text-sm text-brand-text-muted">No confirmed payments yet.</p>}
  </section>;
}
