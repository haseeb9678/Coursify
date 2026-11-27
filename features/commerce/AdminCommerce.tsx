"use client";

import { useState, type ReactNode } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { BookOpen, CircleDollarSign, Clock, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import AdminDataTable, { type AdminTableColumn } from "@/components/layouts/admin/shared/AdminDataTable";
import AdminFilterSelect from "@/components/layouts/admin/shared/AdminFilterSelect";
import AdminPageHeader from "@/components/layouts/admin/shared/AdminPageHeader";
import AdminStatsGrid from "@/components/layouts/admin/shared/AdminStatsGrid";
import AdminTableToolbar from "@/components/layouts/admin/shared/AdminTableToolbar";
import { useAdminTableState } from "@/features/admin/hooks/use-admin-table-state";
import { downloadCsv } from "@/features/admin/utils/management.utils";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";
import { commerceApi } from "./commerce.api";
import { commerceKeys } from "./commerce-cache";
import { commerceDate, commerceMoney, statusLabel } from "./commerce-format";
import { EnrollmentRecord, OrderRecord, PaymentRecord, RecordFields, WebhookRecordDetails } from "./CommerceRecords";
import { CommerceLoading, CommerceMessage, CommerceStatus } from "./CommerceUi";
import {
  enrollmentSources, enrollmentStatuses, orderStatuses, paymentStatuses, webhookStatuses,
  type CommerceFilter, type CommercePage, type Enrollment, type Order, type Pagination, type Payment, type WebhookRecord,
} from "./commerce.types";

type AdminCommerceKind = "enrollments" | "orders" | "payments" | "webhooks";
interface RecordSpec<T> {
  kind: AdminCommerceKind;
  title: string;
  description: string;
  statuses: readonly string[];
  columns: AdminTableColumn<T>[];
  records: (pagination: Pagination, filter: CommerceFilter) => Promise<CommercePage<T>>;
  detail?: (id: string) => Promise<T>;
  renderDetail: (record: T) => ReactNode;
  csv?: (record: T) => readonly string[];
}

const money = (amount: number, currency: string) => commerceMoney(amount, currency);
const mode = (isTestMode: boolean) => isTestMode ? "Sandbox" : "Live";
const enrollmentSpec: RecordSpec<Enrollment> = {
  kind: "enrollments", title: "Enrollments", description: "Review student access and enrollment history.",
  statuses: enrollmentStatuses, records: (page, filter) => commerceApi.enrollments(true, page, filter),
  detail: (id) => commerceApi.enrollment(true, id),
  renderDetail: (enrollment) => <EnrollmentRecord enrollment={enrollment} />,
  csv: (row) => [row.user?.name ?? "", row.user?.email ?? "", row.course.title, row.source, row.status, row.enrolledAt, row.order?.orderNumber ?? ""],
  columns: [
    { id: "student", header: "Student", cell: (row) => <>{row.user?.name}<p className="text-brand-text-muted">{row.user?.email}</p></> },
    { id: "course", header: "Course", cell: (row) => row.course.title },
    { id: "source", header: "Source", cell: (row) => statusLabel(row.source) },
    { id: "status", header: "Status", cell: (row) => <CommerceStatus value={row.status} /> },
    { id: "date", header: "Enrolled", sortValue: (row) => row.enrolledAt, cell: (row) => commerceDate(row.enrolledAt) },
    { id: "order", header: "Related order", cell: (row) => row.order?.orderNumber ?? "?" },
  ],
};

const orderSpec: RecordSpec<Order> = {
  kind: "orders", title: "Orders", description: "Review checkout history and the prices recorded at purchase.",
  statuses: orderStatuses, records: (page, filter) => commerceApi.orders(true, page, filter),
  detail: (id) => commerceApi.order(true, id), renderDetail: (order) => <OrderRecord order={order} />,
  columns: [
    { id: "order", header: "Order number", cell: (row) => row.orderNumber },
    { id: "student", header: "Student", cell: (row) => row.user?.name },
    { id: "course", header: "Course", cell: (row) => row.courseTitleSnapshot },
    { id: "subtotal", header: "Original", cell: (row) => money(row.subtotalMinorUnits, row.currency) },
    { id: "discount", header: "Discount", cell: (row) => money(row.discountMinorUnits, row.currency) },
    { id: "total", header: "Total", cell: (row) => money(row.totalMinorUnits, row.currency) },
    { id: "status", header: "Order status", cell: (row) => <CommerceStatus value={row.status} /> },
    { id: "payment", header: "Payment status", cell: (row) => <CommerceStatus value={row.payments[0]?.status} /> },
    { id: "environment", header: "Environment", cell: (row) => mode(row.isTestMode) },
    { id: "date", header: "Created", sortValue: (row) => row.createdAt, cell: (row) => commerceDate(row.createdAt) },
    { id: "paid", header: "Paid", cell: (row) => commerceDate(row.paidAt) },
  ],
};

const paymentSpec: RecordSpec<Payment> = {
  kind: "payments", title: "Transactions", description: "Review Stripe attempts, refunds, and disputes.",
  statuses: paymentStatuses, records: (page, filter) => commerceApi.payments(true, page, filter),
  detail: (id) => commerceApi.payment(true, id), renderDetail: (payment) => <PaymentRecord payment={payment} />,
  columns: [
    { id: "order", header: "Order number", cell: (row) => row.order?.orderNumber },
    { id: "student", header: "Student", cell: (row) => row.order?.user?.name },
    { id: "course", header: "Course", cell: (row) => row.order?.courseTitleSnapshot },
    { id: "provider", header: "Provider", cell: (row) => statusLabel(row.provider) },
    { id: "status", header: "Status", cell: (row) => <CommerceStatus value={row.status} /> },
    { id: "amount", header: "Amount", cell: (row) => money(row.amountMinorUnits, row.currency) },
    { id: "refund", header: "Refunded", cell: (row) => money(row.refundedMinorUnits, row.currency) },
    { id: "environment", header: "Environment", cell: (row) => mode(row.isTestMode) },
    { id: "date", header: "Created", sortValue: (row) => row.createdAt, cell: (row) => commerceDate(row.createdAt) },
    { id: "paid", header: "Paid", cell: (row) => commerceDate(row.paidAt) },
    { id: "review", header: "Reconciliation", cell: (row) => statusLabel(row.reconciliationReason) },
    { id: "paymentId", header: "Payment ID", cell: (row) => row.id },
    { id: "session", header: "Stripe session", cell: (row) => <span className="break-all">{row.stripeCheckoutSessionId ?? "?"}</span> },
    { id: "intent", header: "Stripe intent", cell: (row) => <span className="break-all">{row.stripePaymentIntentId ?? "?"}</span> },
  ],
};

const webhookSpec: RecordSpec<WebhookRecord> = {
  kind: "webhooks", title: "Stripe webhooks", description: "Monitor verified Stripe deliveries and retry status.",
  statuses: webhookStatuses, records: commerceApi.webhooks, renderDetail: (event) => <WebhookRecordDetails event={event} />,
  columns: [
    { id: "event", header: "Event ID", cell: (row) => row.stripeEventId },
    { id: "type", header: "Event type", cell: (row) => row.eventType },
    { id: "status", header: "Status", cell: (row) => <CommerceStatus value={row.status} /> },
    { id: "attempts", header: "Attempts", cell: (row) => row.attempts },
    { id: "environment", header: "Environment", cell: (row) => mode(row.isTestMode) },
    { id: "date", header: "Received", sortValue: (row) => row.receivedAt, cell: (row) => commerceDate(row.receivedAt) },
    { id: "processed", header: "Processed", cell: (row) => commerceDate(row.processedAt) },
    { id: "error", header: "Last error", cell: (row) => statusLabel(row.lastError) },
  ],
};

export default function AdminCommerce({ kind }: { kind: AdminCommerceKind }) {
  if (kind === "enrollments") return <ResourceTable spec={enrollmentSpec} />;
  if (kind === "orders") return <ResourceTable spec={orderSpec} />;
  if (kind === "payments") return <ResourceTable spec={paymentSpec} />;
  return <ResourceTable spec={webhookSpec} />;
}

function filterDate(value: string, endOfDay = false): string | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`);
  return Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
}

const initialFilters = { search: "", status: "all", source: "all", from: "", to: "" };
const csvHeaders = ["Student", "Email", "Course", "Source", "Status", "Enrolled", "Order"];
function csvValue(value: string): string {
  return /^[ \t\r\n]*[=+@-]/.test(value) ? "'" + value : value;
}

function ResourceTable<T extends { id: string }>({ spec }: { spec: RecordSpec<T> }) {
  const table = useAdminTableState();
  const userId = useAuthStore((state) => state.user?.id);
  const [filters, setFilters] = useState(initialFilters);
  const [selected, setSelected] = useState<T | null>(null);
  const [visible, setVisible] = useState(() => spec.columns.filter((column) => !["paymentId", "session", "intent"].includes(column.id)).map((column) => column.id));
  const scope = commerceKeys.scope("admin", userId);
  const pagination = { page: table.page, limit: table.pageSize };
  const filter: CommerceFilter = {
    search: filters.search.trim() || undefined,
    status: filters.status !== "all" ? filters.status : undefined,
    source: filters.source !== "all" ? filters.source : undefined,
    from: filterDate(filters.from),
    to: filterDate(filters.to, true),
    oldestFirst: table.sorting?.direction === "asc",
  };

  const records = useQuery({
    queryKey: [...scope, spec.kind, pagination, filter],
    queryFn: () => spec.records(pagination, filter), enabled: !!userId, placeholderData: keepPreviousData, retry: false,
  });
  const detail = useQuery({
    queryKey: [...scope, spec.kind, "detail", selected?.id],
    queryFn: () => selected && spec.detail ? spec.detail(selected.id) : Promise.resolve(selected),
    enabled: !!userId && !!selected && !!spec.detail, retry: false,
  });

  const rows = records.data?.items ?? [];
  const columns: AdminTableColumn<T>[] = [...spec.columns, {
    id: "actions", header: "Actions", hideable: false, cell: (row) =>
      <Button type="button" size="sm" variant="outline" onClick={() => setSelected(row)}>Details</Button>,
  }];

  function updateFilters(next: typeof initialFilters) {
    setFilters(next);
    table.setPage(1);
    table.clearSelection();
  }

  const options = (values: readonly string[], all: string) => [
    { value: "all", label: all }, ...values.map((value) => ({ value, label: statusLabel(value) })),
  ];

  return (
    <section className="mx-auto max-w-450 space-y-5 px-4 py-6 md:px-7">
      <AdminPageHeader title={spec.title} description={spec.description} />
      {spec.kind !== "webhooks" && <ManagementStats kind={spec.kind} />}
      <AdminTableToolbar
        search={filters.search} searchLabel={`Search ${spec.title.toLowerCase()}`} searchPlaceholder="Search records..."
        onSearchChange={(search) => updateFilters({ ...filters, search })}
        onClear={() => updateFilters(initialFilters)}
        filtersActive={!!(filters.search || filters.status !== "all" || filters.source !== "all" || filters.from || filters.to)}
        filters={<>
          <AdminFilterSelect label="Status" value={filters.status} options={options(spec.statuses, "All statuses")}
            onChange={(status) => updateFilters({ ...filters, status })} />
          {spec.kind === "enrollments" && <AdminFilterSelect label="Enrollment source" value={filters.source} options={options(enrollmentSources, "All sources")}
            onChange={(source) => updateFilters({ ...filters, source })} />}
          <Input className="h-10 w-auto" aria-label="From date" type="date" value={filters.from}
            onChange={(event) => updateFilters({ ...filters, from: event.target.value })} />
          <Input className="h-10 w-auto" aria-label="To date" type="date" value={filters.to}
            onChange={(event) => updateFilters({ ...filters, to: event.target.value })} />
        </>}
        actions={!spec.csv ? undefined : <Button type="button" variant="outline" disabled={!rows.length || records.isFetching} onClick={() => {
          if (!spec.csv) return;
          const exported = table.selectedIds.size ? rows.filter((row) => table.selectedIds.has(row.id)) : rows;
          downloadCsv("coursify-enrollments", csvHeaders, exported.map((row) => spec.csv?.(row).map(csvValue) ?? []));
        }}>Export CSV</Button>}
      />
      <div className="flex justify-end">
        <Button type="button" variant="outline" busy={records.isFetching}
          onClick={() => void records.refetch()}>Refresh</Button>
      </div>
      <AdminDataTable
        rows={rows} columns={columns} getRowId={(row) => row.id}
        pagination={records.data?.meta ?? { page: table.page, limit: table.pageSize, total: 0, totalPages: 0, hasNext: false, hasPrevious: false }}
        onPageChange={(page) => { table.clearSelection(); table.setPage(page); }} onPageSizeChange={table.setPageSize}
        sorting={table.sorting} onSort={table.toggleSorting} selectedIds={table.selectedIds} onToggleRows={table.toggleRows}
        visibleColumnIds={visible} onVisibleColumnsChange={setVisible} isSelectionDisabled={!spec.csv}
        isLoading={records.isPending} isPlaceholderData={records.isPlaceholderData}
        error={records.isError ? getGraphQLErrorMessage(records.error) : null}
      />
      <Sheet open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader><SheetTitle>{spec.title} details</SheetTitle><SheetDescription>Recorded status and related information.</SheetDescription></SheetHeader>
          <div className="p-5">
            {selected && (spec.detail
              ? detail.isPending ? <CommerceLoading /> : detail.isError || !detail.data
                ? <CommerceMessage title="Unable to load details" message={getGraphQLErrorMessage(detail.error)} />
                : spec.renderDetail(detail.data)
              : spec.renderDetail(selected))}
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}

function ManagementStats({ kind }: { kind: Exclude<AdminCommerceKind, "webhooks"> }) {
  const userId = useAuthStore((state) => state.user?.id);
  const key = [...commerceKeys.scope("admin", userId), kind, "stats"];
  const result = useQuery({
    queryKey: key, enabled: !!userId, retry: false,
    queryFn: async () => {
      if (kind === "enrollments") return { kind, data: await commerceApi.enrollmentStats() };
      if (kind === "orders") return { kind, data: await commerceApi.orderStats() };
      return { kind, data: await commerceApi.paymentStats() };
    },
  });
  if (result.isPending) return <CommerceLoading label="Loading statistics" />;
  if (result.isError || !result.data) return <CommerceMessage title="Statistics unavailable" message={getGraphQLErrorMessage(result.error)} />;
  const stats = result.data;
  if (stats.kind === "enrollments") return <AdminStatsGrid stats={[
    { label: "Total enrollments", value: stats.data.total, description: "All enrollment sources", icon: BookOpen },
    { label: "Active", value: stats.data.active, description: "Active student enrollments", icon: BookOpen, tone: "green" },
    { label: "Free", value: stats.data.free, description: "Free course enrollments", icon: BookOpen },
    { label: "Paid", value: stats.data.paid, description: "Paid course enrollments", icon: CircleDollarSign },
    { label: "Completed", value: stats.data.completed, description: "Completed courses", icon: BookOpen },
    { label: "Revoked", value: stats.data.revoked, description: "Revoked enrollments", icon: BookOpen, tone: "red" },
  ]} />;
  if (stats.kind === "orders") return <AdminStatsGrid stats={stats.data.length
    ? stats.data.flatMap((row) => [
      { label: `${mode(row.isTestMode)} orders`, value: row.total, description: "All orders", icon: ReceiptText },
      { label: `${mode(row.isTestMode)} paid orders`, value: row.paid, description: "Orders with verified payment", icon: CircleDollarSign },
      { label: `${mode(row.isTestMode)} pending orders`, value: row.pending, description: "Awaiting payment verification", icon: Clock },
    ]) : [{ label: "Sandbox orders", value: 0, description: "No recorded orders", icon: ReceiptText }]} />;
  return (
    <div className="space-y-4">
      <AdminStatsGrid stats={stats.data.counts.length ? stats.data.counts.flatMap((count) => [
        { label: `${mode(count.isTestMode)} successful payments`, value: count.successful, description: "Captured payments", icon: CircleDollarSign },
        { label: `${mode(count.isTestMode)} pending payments`, value: count.pending, description: "Unconfirmed attempts", icon: Clock },
        { label: `${mode(count.isTestMode)} failed attempts`, value: count.failed, description: "Terminal payment failures", icon: ReceiptText },
      ]) : [{ label: "Sandbox payments", value: 0, description: "No recorded payment attempts", icon: CircleDollarSign }]} />
      {stats.data.totals.map((row) => (
        <section key={`${row.isTestMode}-${row.currency}`} className="space-y-3 rounded-xl border border-brand-border bg-card p-4">
          <h2 className="text-sm font-semibold text-brand-text">{mode(row.isTestMode)} ? {row.currency}</h2>
          <RecordFields fields={[
            ["Gross captured", commerceMoney(row.grossMinorUnits, row.currency)],
            ["Successfully refunded", commerceMoney(row.refundedMinorUnits, row.currency)],
            ["Net collected before fees", commerceMoney(row.netMinorUnits, row.currency)],
          ]} />
        </section>
      ))}
    </div>
  );
}
