"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import AdminDataTable, { type AdminTableColumn } from "@/components/layouts/admin/shared/AdminDataTable";
import AdminFilterSelect from "@/components/layouts/admin/shared/AdminFilterSelect";
import AdminPageHeader from "@/components/layouts/admin/shared/AdminPageHeader";
import { AdminTableActionContent, AdminTableActionTrigger } from "@/components/layouts/admin/shared/AdminTableActionMenu";
import AdminTableToolbar from "@/components/layouts/admin/shared/AdminTableToolbar";
import { useDebouncedValue } from "@/features/admin/hooks/use-debounced-value";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";
import { commerceApi } from "./commerce.api";
import { commerceKeys } from "./commerce-cache";
import { commerceDate, commerceMoney, paymentReference, statusLabel } from "./commerce-format";
import { PaymentRecord, StudentOrderActions } from "./CommerceRecords";
import { CommerceLoading, CommerceMessage, CommerceStatus } from "./CommerceUi";
import StudentCommerceStats from "./StudentCommerceStats";
import { useStudentCommerceStats, useStudentId } from "./student-queries";
import { orderStatuses, paymentStatuses, type CommerceFilter, type CommercePage, type Order, type Pagination, type Payment } from "./commerce.types";

const noSelection = new Set<string>();
const noop = () => {};
const defaultFilters = { search: "", status: "all", from: "", to: "" };

function boundary(value: string, throughDay = false): string | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T${throughDay ? "23:59:59.999" : "00:00:00.000"}`);
  return Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
}

interface LedgerProps<T> {
  userId: string;
  kind: "purchases" | "payments";
  title: string;
  description: string;
  statuses: readonly string[];
  columns: AdminTableColumn<T>[];
  fetchRecords: (pagination: Pagination, filter: CommerceFilter) => Promise<CommercePage<T>>;
}

function StudentLedger<T extends { id: string }>({
  userId, kind, title, description, statuses, columns, fetchRecords,
}: LedgerProps<T>) {
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [oldestFirst, setOldestFirst] = useState(false);
  const [visible, setVisible] = useState(() => columns.map(({ id }) => id));
  const search = useDebouncedValue(filters.search.trim());
  const stats = useStudentCommerceStats(userId);
  const pagination = { page, limit };
  const filter = {
    search: search || undefined, status: filters.status === "all" ? undefined : filters.status,
    from: boundary(filters.from), to: boundary(filters.to, true), oldestFirst,
  };
  const records = useQuery({
    queryKey: [...commerceKeys.scope("student", userId), kind === "purchases" ? "history" : "payments", pagination, filter],
    queryFn: () => fetchRecords(pagination, filter), placeholderData: keepPreviousData, retry: false,
  });
  const filtered = !!(filters.search.trim() || filters.from || filters.to || filters.status !== "all");
  const rows = records.data?.items ?? [];

  function changeFilters(next: typeof defaultFilters) {
    setFilters(next);
    setPage(1);
  }

  return <main className="mx-auto w-full max-w-450 space-y-5 p-4 sm:p-6 lg:p-8">
    <AdminPageHeader title={title} description={description} />
    <StudentCommerceStats kind={kind} query={stats} />
    <AdminTableToolbar search={filters.search} searchLabel={`Search ${title.toLowerCase()}`}
      searchPlaceholder="Search by course or order number"
      onSearchChange={(search) => changeFilters({ ...filters, search })} onClear={() => changeFilters(defaultFilters)}
      filtersActive={filtered}
      filters={<>
        <AdminFilterSelect label={kind === "purchases" ? "Order status" : "Payment status"} value={filters.status}
          options={[{ label: "All statuses", value: "all" }, ...statuses.map((value) => ({ label: statusLabel(value), value }))]}
          onChange={(status) => changeFilters({ ...filters, status })} />
        <Input className="h-10 w-auto max-w-full" type="date" aria-label="From date" value={filters.from} max={filters.to || undefined}
          onChange={(event) => changeFilters({ ...filters, from: event.target.value })} />
        <Input className="h-10 w-auto max-w-full" type="date" aria-label="To date" value={filters.to} min={filters.from || undefined}
          onChange={(event) => changeFilters({ ...filters, to: event.target.value })} />
      </>}
      actions={<Button variant="outline" busy={records.isFetching} onClick={() => { void records.refetch(); void stats.refetch(); }}>
        {records.isError ? "Try again" : "Refresh"}
      </Button>} />
    <AdminDataTable rows={rows} columns={columns} getRowId={(row) => row.id} showSelection={false}
      pagination={records.data?.meta ?? { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrevious: false }}
      onPageChange={setPage} onPageSizeChange={(value) => { setLimit(value); setPage(1); }}
      sorting={{ column: "date", direction: oldestFirst ? "asc" : "desc" }}
      onSort={() => { setOldestFirst(!oldestFirst); setPage(1); }}
      selectedIds={noSelection} onToggleRows={noop}
      visibleColumnIds={visible} onVisibleColumnsChange={setVisible}
      isLoading={records.isPending} isPlaceholderData={records.isFetching && !records.isPending}
      isPaginationDisabled={records.isFetching || records.isError}
      error={records.isError ? getGraphQLErrorMessage(records.error) : null}
      emptyTitle={filtered ? "No matching records" : kind === "purchases" ? "No orders yet" : "No payment attempts yet"}
      emptyDescription={filtered ? "Try adjusting the selected filters." :
        kind === "purchases" ? "Course orders will appear here after checkout is started." : "Payments and refunds will appear here when you purchase a course."}
    />
  </main>;
}

const orderColumns: AdminTableColumn<Order>[] = [
  { id: "reference", header: "Order number", cell: (row) => row.orderNumber, className: "font-mono text-xs" },
  { id: "course", header: "Course", cell: (row) => row.courseTitleSnapshot, className: "min-w-44" },
  { id: "date", header: "Order date", sortValue: (row) => row.createdAt, cell: (row) => commerceDate(row.createdAt) },
  { id: "original", header: "Original amount", cell: (row) => commerceMoney(row.subtotalMinorUnits, row.currency) },
  { id: "discount", header: "Discount", cell: (row) => commerceMoney(row.discountMinorUnits, row.currency) },
  { id: "total", header: "Final amount", cell: (row) => commerceMoney(row.totalMinorUnits, row.currency) },
  { id: "order-status", header: "Order status", cell: (row) => <CommerceStatus value={row.status} /> },
  { id: "payment-status", header: "Payment status", cell: (row) => <CommerceStatus value={row.paymentStatus ?? row.payments[0]?.status} /> },
  { id: "environment", header: "Environment", cell: (row) => <EnvironmentBadge sandbox={row.isTestMode} /> },
  { id: "actions", header: "Actions", hideable: false, className: "w-14 text-right", cell: (row) => <StudentOrderActions order={row} inTable /> },
];

export function StudentPurchaseHistory() {
  const userId = useStudentId();
  return userId ? <StudentLedger key={userId} userId={userId} kind="purchases"
    title="Purchase History" description="View and manage your course purchases and order history."
    statuses={orderStatuses} columns={orderColumns} fetchRecords={(page, filter) => commerceApi.orders(false, page, filter)} />
    : <div className="p-6"><CommerceLoading /></div>;
}

export function StudentPaymentHistory() {
  const userId = useStudentId();
  return userId ? <PaymentHistory key={userId} userId={userId} /> : <div className="p-6"><CommerceLoading /></div>;
}

function PaymentHistory({ userId }: { userId: string }) {
  const [selectedId, setSelectedId] = useState<string>();
  const detail = useQuery({
    queryKey: [...commerceKeys.scope("student", userId), "payment", selectedId],
    queryFn: () => commerceApi.payment(false, selectedId ?? ""),
    enabled: !!selectedId,
    retry: false,
  });
  const columns: AdminTableColumn<Payment>[] = [
    { id: "reference", header: "Transaction reference", cell: (row) => paymentReference(row.id), className: "font-mono text-xs" },
    { id: "order", header: "Order number", cell: (row) => row.order?.orderNumber ?? "?" },
    { id: "course", header: "Course", cell: (row) => row.order?.courseTitleSnapshot ?? "?", className: "min-w-44" },
    { id: "provider", header: "Payment method", cell: (row) => `${statusLabel(row.provider)} card` },
    { id: "amount", header: "Amount", cell: (row) => commerceMoney(row.amountMinorUnits, row.currency) },
    { id: "status", header: "Payment status", cell: (row) => <CommerceStatus value={row.status} /> },
    { id: "paid", header: "Payment date", cell: (row) => commerceDate(row.paidAt) },
    { id: "date", header: "Attempt date", sortValue: (row) => row.createdAt, cell: (row) => commerceDate(row.createdAt) },
    { id: "environment", header: "Environment", cell: (row) => <EnvironmentBadge sandbox={row.isTestMode} /> },
    { id: "actions", header: "Actions", hideable: false, className: "w-14 text-right", cell: (row) =>
      <DropdownMenu>
        <AdminTableActionTrigger label={`Actions for payment ${paymentReference(row.id)}`} />
        <AdminTableActionContent className="w-48">
          <DropdownMenuItem onClick={() => setSelectedId(row.id)}>
            <Eye aria-hidden="true" />
            View payment details
          </DropdownMenuItem>
        </AdminTableActionContent>
      </DropdownMenu> },
  ];

  return <>
    <StudentLedger userId={userId} kind="payments" title="Payment History"
      description="Review your payment transactions, payment statuses, and refunds."
      statuses={paymentStatuses} columns={columns} fetchRecords={(page, filter) => commerceApi.payments(false, page, filter)} />
    <Sheet open={!!selectedId} onOpenChange={(open) => { if (!open) setSelectedId(undefined); }}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Payment details</SheetTitle>
          <SheetDescription>Review this payment attempt and any recorded refunds.</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6 sm:px-6">
          {detail.isPending ? <CommerceLoading label="Loading payment details" />
            : detail.isError || !detail.data ? <CommerceMessage title="Unable to load payment details"
              message={getGraphQLErrorMessage(detail.error)}
              actions={<Button variant="outline" busy={detail.isFetching} onClick={() => void detail.refetch()}>Try again</Button>} />
            : <PaymentRecord student payment={detail.data} />}
        </div>
      </SheetContent>
    </Sheet>
  </>;
}

function EnvironmentBadge({ sandbox }: { sandbox: boolean }) {
  return <Badge variant="outline">{sandbox ? "Stripe Sandbox" : "Live"}</Badge>;
}
