"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState, type ComponentProps, type ReactNode } from "react";
import AdminDataTable, { type AdminTableColumn } from "@/components/layouts/admin/shared/AdminDataTable";
import AdminErrorState from "@/components/layouts/admin/shared/AdminErrorState";
import AdminFilterSelect from "@/components/layouts/admin/shared/AdminFilterSelect";
import { InstructorRowsSkeleton } from "@/components/layouts/instructor/InstructorPageSkeletons";
import { Button } from "@/components/ui/button";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";
import { instructorKey, useCourseWorkspace } from "./course-workspace";
import type { Page } from "./instructor.api";

export const panelClass = "min-w-0 space-y-4 rounded-xl border border-brand-border bg-card p-4 sm:p-5";
type ButtonProps = ComponentProps<typeof Button>;

export function InstructorPage({ children }: { children: ReactNode }) {
  return <main className="mx-auto w-full max-w-450 min-w-0 space-y-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>;
}

export function InstructorFilterBar({ children, search, actions }: { children: ReactNode; search?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-xl border border-brand-border bg-card p-3 sm:p-4 lg:flex-row lg:flex-wrap lg:items-center">
      {search && <div className="lg:max-w-sm lg:flex-[1_0_12rem]">{search}</div>}
      <div className="flex min-w-0 flex-wrap items-center gap-2">{children}</div>
      {actions && <div className="lg:ml-auto">{actions}</div>}
    </div>
  );
}

export function WorkspaceLink({ href, children, variant = "outline", size }: {
  href: string; children: ReactNode; variant?: ButtonProps["variant"]; size?: ButtonProps["size"];
}) {
  return <Button nativeButton={false} render={<Link href={href} />} variant={variant} size={size}>{children}</Button>;
}

export function useInstructorQuery<T>(key: readonly unknown[], queryFn: () => Promise<T>) {
  const { userId } = useCourseWorkspace();
  return useQuery({ queryKey: instructorKey(userId, ...key), queryFn, enabled: Boolean(userId), retry: false });
}

export function QueryPanel<T>({ query, children, fallback = <InstructorRowsSkeleton /> }: {
  query: { isPending: boolean; isError: boolean; isFetching: boolean; error: unknown; data?: T; refetch: () => Promise<unknown> };
  children: (data: T) => ReactNode;
  fallback?: ReactNode;
}) {
  if (query.isPending) return <>{fallback}</>;
  if (query.isError || query.data === undefined) return <div className="space-y-2">
    <AdminErrorState title="Unable to load data" description={getGraphQLErrorMessage(query.error)} />
    <Button type="button" variant="outline" busy={query.isFetching} onClick={() => void query.refetch()}>Try again</Button>
  </div>;
  return <>{children(query.data)}</>;
}

export function usePageControls() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  return { pagination: { page, limit }, setPage, setLimit: (next: number) => { setLimit(next); setPage(1); } };
}

export function WorkspaceTable<T extends { id: string }>({ result, columns, controls, empty }: {
  result: Page<T>; columns: AdminTableColumn<T>[]; controls: ReturnType<typeof usePageControls>; empty: string;
}) {
  const [visible, setVisible] = useState(() => columns.map(({ id }) => id));
  return <AdminDataTable rows={result.items} columns={columns} getRowId={({ id }) => id}
    pagination={result.meta} onPageChange={controls.setPage} onPageSizeChange={controls.setLimit}
    sorting={null} onSort={() => {}} selectedIds={new Set()} onToggleRows={() => {}} showSelection={false}
    visibleColumnIds={visible} onVisibleColumnsChange={setVisible} emptyTitle={empty} />;
}

export function CourseFilter({ courseId, courses, onChange }: {
  courseId: string; courses?: { id: string; title: string }[]; onChange: (id: string) => void;
}) {
  return <AdminFilterSelect label="Course" searchable value={courseId} onChange={onChange}
    options={[{ value: "", label: "All courses" }, ...(courses ?? []).map(({ id, title }) => ({ value: id, label: title }))]} />;
}

export function ReportRange({ days, onChange }: { days: number; onChange: (days: number) => void }) {
  return <AdminFilterSelect label="Reporting period" value={String(days)} onChange={(value) => onChange(Number(value))}
    options={[7, 30, 90, 365].map((days) => ({ value: String(days), label: `Last ${days} days` }))} />;
}
