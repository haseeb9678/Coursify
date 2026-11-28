"use client";

import { BookOpen, CheckCircle2, Clock3, Download, GraduationCap, MessageSquare, Plus, Users } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import AdminDashboardCard from "@/components/layouts/admin/dashboard/AdminDashboardCard";
import AdminPageHeader from "@/components/layouts/admin/shared/AdminPageHeader";
import AdminFilterSelect from "@/components/layouts/admin/shared/AdminFilterSelect";
import AdminSearchInput from "@/components/layouts/admin/shared/AdminSearchInput";
import AdminStatsGrid from "@/components/layouts/admin/shared/AdminStatsGrid";
import AdminUserAvatar from "@/components/layouts/admin/shared/AdminUserAvatar";
import type { AdminTableColumn } from "@/components/layouts/admin/shared/AdminDataTable";
import InstructorDashboardSkeleton from "@/components/layouts/instructor/dashboard/InstructorDashboardSkeleton";
import { InstructorTableSkeleton } from "@/components/layouts/instructor/InstructorPageSkeletons";
import CourseStatusBadge from "@/components/layouts/admin/courses/CourseStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminCourses } from "@/features/admin/hooks/use-admin-learning";
import { useDebouncedValue } from "@/features/admin/hooks/use-debounced-value";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { commerceDate, commerceMoney, safeMaterialUrl, statusLabel } from "@/features/commerce/commerce-format";
import { downloadPreview } from "@/features/courses/materials/preview-files";
import { instructorApi, type Analytics, type Enrollment, type Review, type Sale } from "./instructor.api";
import {
  CourseFilter, InstructorFilterBar, InstructorPage, panelClass, QueryPanel, ReportRange, useInstructorQuery,
  usePageControls, WorkspaceLink, WorkspaceTable,
} from "./InstructorUI";

const TrendChart = dynamic(() => import("./InstructorTrendChart"), {
  loading: () => <Skeleton className="h-64 w-full" />,
});
const enrollmentsSeries = {
  enrollments: { label: "Enrollments", color: "var(--primary)" },
  newStudents: { label: "First-time students", color: "var(--chart-2)" },
};
const salesSeries = {
  gross: { label: "Gross", color: "var(--primary)" },
  net: { label: "Net after refunds and disputes", color: "var(--chart-2)" },
};

const percent = (value: number | null) => value === null ? "—" : `${value.toFixed(1)}%`;
const count = (value: number) => value.toLocaleString();
const firstPage = { page: 1, limit: 5 };
const dateSortOptions = [{ value: "false", label: "Newest first" }, { value: "true", label: "Oldest first" }];

function PerformanceOverview({ data, dashboard }: { data: Analytics; dashboard?: boolean }) {
  const status = (key: string) => data.courseStatuses.find(({ label }) => label === key)?.count ?? 0;
  return <>
    {dashboard && <AdminStatsGrid stats={[
      { label: "Courses", value: count(data.totalCourses), description: "Courses you own", icon: BookOpen },
      { label: "Published", value: count(status("PUBLISHED")), description: "In the course catalog", icon: CheckCircle2, tone: "green" },
      { label: "Drafts", value: count(status("DRAFT")), description: "Open for editing", icon: BookOpen },
      { label: "Pending approval", value: count(status("PENDING_REVIEW")), description: "With the review team", icon: Clock3, tone: "amber" },
    ]} />}
    <AdminStatsGrid stats={[
      { label: "Enrollments", value: count(data.enrollments), description: "Created in the selected period", icon: GraduationCap },
      { label: "Unique students", value: count(data.students), description: "Distinct students enrolled in the period", icon: Users },
      { label: "Completion rate", value: percent(data.completionRate), description: `${count(data.completed)} completed enrollments from this period`, icon: CheckCircle2, tone: "green" },
      { label: "Discussion participants", value: count(data.discussionParticipants), description: "Distinct enrolled students who posted in the period", icon: MessageSquare },
    ]} />
    <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <AdminDashboardCard className="space-y-4">
        <h2 className="text-base font-semibold text-brand-text sm:text-lg">Enrollment growth</h2>
        <TrendChart data={data.trend} series={enrollmentsSeries} />
      </AdminDashboardCard>
      <AdminDashboardCard className="space-y-4">
        <h2 className="text-base font-semibold text-brand-text sm:text-lg">Course status</h2>
        <ul className="divide-y divide-brand-border">
          {data.courseStatuses.map(({ label, count: value }) => <li key={label} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <CourseStatusBadge status={label} /><span className="font-medium tabular-nums text-brand-text">{count(value)}</span>
          </li>)}
        </ul>
        {!data.totalCourses && <p className="text-sm text-brand-text-muted">Create a course to see its status here.</p>}
        <p className="border-t border-brand-border pt-3 text-sm text-brand-text-muted">
          {count(data.activeStudents)} students still active who enrolled in the last 30 days.
        </p>
      </AdminDashboardCard>
    </div>
    <AdminDashboardCard className="space-y-4">
      <h2 className="text-base font-semibold text-brand-text sm:text-lg">Course performance</h2>
      {data.courses.length ? <div className="divide-y divide-brand-border">{data.courses.map((course) => {
        const thumbnail = safeMaterialUrl(course.thumbnailUrl);
        return <div key={course.id} className="flex flex-wrap items-center gap-3 py-3">
          {thumbnail ? <Image src={thumbnail} alt="" width={64} height={40} unoptimized className="h-10 w-16 rounded-lg object-cover" />
            : <span className="grid h-10 w-16 place-items-center rounded-lg bg-brand-soft text-primary"><BookOpen size={18} aria-hidden="true" /></span>}
          <Link href={`/instructor/courses/${course.id}`} className="min-w-32 flex-1 text-sm font-medium text-brand-text hover:underline">{course.title}</Link>
          <CourseStatusBadge status={course.status} />
          <span className="text-sm text-brand-text-muted">{count(course.enrollments)} enrolled · {percent(course.completionRate)} completed</span>
        </div>;
      })}</div> : <p className="text-sm text-brand-text-muted">There are no courses to report.</p>}
    </AdminDashboardCard>
  </>;
}

function Person({ item }: { item: Enrollment }) {
  return <Link className="inline-flex items-center gap-2 whitespace-nowrap font-medium text-brand-text hover:underline" href={`/instructor/students/${item.studentId}`}>
    <span aria-hidden="true"><AdminUserAvatar name={item.studentName} avatar={safeMaterialUrl(item.avatar)} size="sm" /></span>
    {item.studentName}
  </Link>;
}

export function InstructorDashboard() {
  const user = useAuthStore((state) => state.user);
  const [days, setDays] = useState(30);
  const analytics = useInstructorQuery(["analytics", days], () => instructorApi.analytics(days));
  const enrollments = useInstructorQuery(["recent-enrollments"], () => instructorApi.enrollments(firstPage, {}));
  const reviews = useInstructorQuery(["recent-review-feedback"], () => instructorApi.reviews(firstPage, {}));
  return <InstructorPage>
    <section className="relative isolate overflow-hidden rounded-2xl border border-primary/15 bg-linear-to-br from-primary/10 via-brand-soft/40 to-card p-5 sm:p-7">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 z-[-1] size-64 rounded-full bg-primary/10 blur-3xl" />
      <AdminPageHeader title={`Welcome, ${user?.name ?? "instructor"}`} description="Manage your courses and see how your students are doing."
        actions={<>
          <WorkspaceLink href="/instructor/courses/create" variant="default"><Plus aria-hidden="true" /> Create course</WorkspaceLink>
          <WorkspaceLink href="/instructor/courses">My courses</WorkspaceLink>
        </>} />
    </section>
    <InstructorFilterBar><ReportRange days={days} onChange={setDays} /></InstructorFilterBar>
    <QueryPanel query={analytics} fallback={<InstructorDashboardSkeleton overviewOnly />}>{(data) => <PerformanceOverview data={data} dashboard />}</QueryPanel>
    <div className="grid gap-4 xl:grid-cols-2">
      <AdminDashboardCard className="space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-semibold text-brand-text sm:text-lg">Recent enrollments</h2>
          <WorkspaceLink href="/instructor/students" size="sm">All students</WorkspaceLink>
        </header>
        <QueryPanel query={enrollments}>{({ items }) => items.length ? <ul className="divide-y divide-brand-border">
          {items.map((item) => <li key={item.id} className="space-y-1 py-3 text-sm">
            <Person item={item} />
            <p className="text-brand-text-muted">{item.courseTitle} · {commerceDate(item.enrolledAt)} · {statusLabel(item.status)}</p>
          </li>)}
        </ul> : <p className="text-sm text-brand-text-muted">Your courses have no enrollments yet.</p>}</QueryPanel>
      </AdminDashboardCard>
      <AdminDashboardCard className="space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-semibold text-brand-text sm:text-lg">Recent activity</h2>
          <WorkspaceLink href="/instructor/reviews" size="sm">Review feedback</WorkspaceLink>
        </header>
        <QueryPanel query={reviews}>{({ items }) => {
          const activity = [
            ...items.map((review) => ({ id: review.id, at: review.createdAt, label: `${review.courseTitle} · ${statusLabel(review.decision)}` })),
            ...(analytics.data?.courses ?? []).flatMap((course) => course.publishedAt
              ? [{ id: course.id, at: course.publishedAt, label: `${course.title} published` }] : []),
            ...(enrollments.data?.items ?? []).flatMap((item) => item.completedAt
              ? [{ id: item.id, at: item.completedAt, label: `${item.studentName} completed ${item.courseTitle}` }] : []),
          ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6);
          return activity.length ? <ul className="divide-y divide-brand-border">{activity.map((item) => <li key={item.id} className="py-3 text-sm">
            <p className="font-medium">{item.label}</p><p className="text-xs text-brand-text-muted">{commerceDate(item.at)}</p>
          </li>)}</ul> : <p className="text-sm text-brand-text-muted">Publication, review, and completion activity will appear here.</p>;
        }}</QueryPanel>
      </AdminDashboardCard>
    </div>
  </InstructorPage>;
}

export function InstructorAnalyticsPanel({ courseId: fixedCourse }: { courseId?: string }) {
  const [courseId, setCourseId] = useState("");
  const [days, setDays] = useState(30);
  const course = fixedCourse ?? (courseId || undefined);
  const courses = useAdminCourses({ page: 1, limit: 100 });
  const query = useInstructorQuery(["analytics", days, course], () => instructorApi.analytics(days, course));
  return <div className="space-y-4">
    <InstructorFilterBar>
      {!fixedCourse && <CourseFilter courseId={courseId} courses={courses.data?.items} onChange={setCourseId} />}
      <ReportRange days={days} onChange={setDays} />
    </InstructorFilterBar>
    <QueryPanel query={query} fallback={<InstructorDashboardSkeleton overviewOnly showCourseStats={false} />}>{(data) => <PerformanceOverview data={data} />}</QueryPanel>
    <p className="text-xs text-brand-text-muted">Completion compares completed enrollments with active and completed enrollments from the selected period. First-time counts use each student’s earliest enrollment in the report’s course scope.</p>
  </div>;
}

const studentColumns: AdminTableColumn<Enrollment>[] = [
  { id: "student", header: "Student", cell: (item) => <Person item={item} /> },
  { id: "course", header: "Course", cell: (item) => <Link href={`/instructor/courses/${item.courseId}`} className="hover:underline">{item.courseTitle}</Link> },
  { id: "enrolled", header: "Enrolled", cell: (item) => commerceDate(item.enrolledAt) },
  { id: "lessons", header: "Course lessons", cell: (item) => item.lessonCount },
  { id: "status", header: "Status", cell: (item) => <Badge variant="outline">{statusLabel(item.status)}</Badge> },
  { id: "completed", header: "Completed", cell: (item) => item.completedAt ? commerceDate(item.completedAt) : "—" },
];

function exportEnrollments(items: Enrollment[]) {
  const quote = (value: string) => {
    const safe = /^\s*[=+\-@]/.test(value) ? `'${value}` : value;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  const rows = items.map((item) => [item.studentName, item.courseTitle, item.enrolledAt, item.status, item.completedAt ?? "", String(item.lessonCount)]
    .map(quote).join(","));
  const url = URL.createObjectURL(new Blob([["Student,Course,Enrolled,Status,Completed,Course lessons", ...rows].join("\r\n")], { type: "text/csv;charset=utf-8" }));
  try { downloadPreview(url, "enrollments.csv"); } finally { window.setTimeout(() => URL.revokeObjectURL(url), 1_000); }
}

export function InstructorStudentsPanel({ courseId: fixedCourse, studentId }: { courseId?: string; studentId?: string }) {
  const controls = usePageControls();
  const [courseId, setCourse] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [oldestFirst, setOldest] = useState(false);
  const settledSearch = useDebouncedValue(search);
  const courses = useAdminCourses({ page: 1, limit: 100 });
  const filter = { courseId: fixedCourse ?? (courseId || undefined), search: settledSearch || undefined,
    status: status || undefined, from: from || undefined, to: to || undefined, oldestFirst };
  const query = useInstructorQuery(["students", controls.pagination, filter, studentId], () => studentId
    ? instructorApi.student(controls.pagination, studentId) : instructorApi.enrollments(controls.pagination, filter));
  return <div className="space-y-4">
    {!studentId && <InstructorFilterBar search={<AdminSearchInput label="Search enrollments" placeholder="Search student or course" value={search} onChange={(value) => { setSearch(value); controls.setPage(1); }} />}>
      {!fixedCourse && <CourseFilter courseId={courseId} courses={courses.data?.items} onChange={(value) => { setCourse(value); controls.setPage(1); }} />}
      <AdminFilterSelect label="Enrollment status" value={status} onChange={(value) => { setStatus(value); controls.setPage(1); }}
        options={[{ value: "", label: "Every status" }, ...["ACTIVE", "COMPLETED", "CANCELLED", "REVOKED"].map((value) => ({ value, label: statusLabel(value) }))]} />
      <label className="flex items-center gap-1.5 text-xs text-brand-text-muted">From <Input type="date" className="h-10 w-auto border-brand-border bg-background" value={from} onChange={(event) => { setFrom(event.target.value); controls.setPage(1); }} /></label>
      <label className="flex items-center gap-1.5 text-xs text-brand-text-muted">Through <Input type="date" className="h-10 w-auto border-brand-border bg-background" value={to} min={from || undefined} onChange={(event) => { setTo(event.target.value); controls.setPage(1); }} /></label>
      <AdminFilterSelect label="Enrollment sort order" value={String(oldestFirst)} options={dateSortOptions}
        onChange={(value) => { setOldest(value === "true"); controls.setPage(1); }} />
    </InstructorFilterBar>}
    <QueryPanel query={query} fallback={<InstructorTableSkeleton />}>{(result) => <>
      {studentId && result.items[0] && <div className={panelClass}><Person item={result.items[0]} />
        <p className="text-sm text-brand-text-muted">{result.meta.total} enrollments in courses you teach</p></div>}
      {result.items.length > 0 && <div className="flex justify-end"><Button type="button" variant="outline" onClick={() => exportEnrollments(result.items)}>
        <Download aria-hidden="true" /> Export this page
      </Button></div>}
      <WorkspaceTable result={result} columns={studentColumns} controls={controls} empty="No matching enrollments" />
    </>}</QueryPanel>
    <p className="text-xs text-brand-text-muted">Course completion is recorded at the enrollment level. Lesson completion and last learning activity are unavailable.</p>
  </div>;
}

const reviewColumns: AdminTableColumn<Review>[] = [
  { id: "course", header: "Course", cell: (item) => <Link href={`/instructor/courses/${item.courseId}`} className="font-medium hover:underline">{item.courseTitle}</Link> },
  { id: "decision", header: "Decision", cell: (item) => <Badge variant="outline">{statusLabel(item.decision)}</Badge> },
  { id: "feedback", header: "Feedback", cell: (item) => <p className="max-w-xl whitespace-pre-wrap wrap-break-word">{item.feedback || "—"}</p> },
  { id: "date", header: "Date", cell: (item) => commerceDate(item.createdAt) },
];

export function InstructorReviewsPanel({ courseId: fixedCourse }: { courseId?: string }) {
  const controls = usePageControls();
  const [search, setSearch] = useState("");
  const [courseId, setCourse] = useState("");
  const [decision, setDecision] = useState("");
  const [oldestFirst, setOldest] = useState(false);
  const settledSearch = useDebouncedValue(search);
  const courses = useAdminCourses({ page: 1, limit: 100 });
  const filter = { courseId: fixedCourse ?? (courseId || undefined), search: settledSearch || undefined, decision: decision || undefined, oldestFirst };
  const query = useInstructorQuery(["reviews", controls.pagination, filter], () => instructorApi.reviews(controls.pagination, filter));
  return <div className="space-y-4">
    <InstructorFilterBar search={<AdminSearchInput label="Search review feedback" placeholder="Search course or feedback" value={search} onChange={(value) => { setSearch(value); controls.setPage(1); }} />}>
      {!fixedCourse && <CourseFilter courseId={courseId} courses={courses.data?.items} onChange={(value) => { setCourse(value); controls.setPage(1); }} />}
      <AdminFilterSelect label="Review decision" value={decision} onChange={(value) => { setDecision(value); controls.setPage(1); }}
        options={[{ value: "", label: "All decisions" }, ...["APPROVED", "REJECTED", "CHANGES_REQUESTED"].map((value) => ({ value, label: statusLabel(value) }))]} />
      <AdminFilterSelect label="Review sort order" value={String(oldestFirst)} options={dateSortOptions}
        onChange={(value) => { setOldest(value === "true"); controls.setPage(1); }} />
    </InstructorFilterBar>
    <QueryPanel query={query} fallback={<InstructorTableSkeleton />}>{(result) => <WorkspaceTable result={result} columns={reviewColumns} controls={controls} empty="No matching review feedback" />}</QueryPanel>
  </div>;
}

const salesColumns: AdminTableColumn<Sale>[] = [
  { id: "course", header: "Course and order", cell: (sale) => <><p>{sale.courseTitle}</p><p className="text-xs text-brand-text-muted">{sale.orderNumber}</p></> },
  { id: "paid", header: "Paid", cell: (sale) => commerceDate(sale.paidAt) },
  { id: "mode", header: "Mode", cell: (sale) => <Badge variant="outline">{sale.isTestMode ? "Sandbox" : "Live"}</Badge> },
  ...(["gross", "refunded", "disputed", "net"] as const).map((field) => ({ id: field, header: statusLabel(field), cell: (sale: Sale) => commerceMoney(sale[field], sale.currency) })),
];

export function InstructorSales() {
  const controls = usePageControls();
  const [days, setDays] = useState(30);
  const [courseId, setCourse] = useState("");
  const courses = useAdminCourses({ page: 1, limit: 100 });
  const query = useInstructorQuery(["sales", days, courseId, controls.pagination], () => instructorApi.sales(controls.pagination, days, courseId || undefined));
  return <InstructorPage>
    <AdminPageHeader title="Course sales" description="Verified course transactions by currency and payment mode. The panel reports course sales, and instructor payouts are unavailable." />
    <InstructorFilterBar>
      <CourseFilter courseId={courseId} courses={courses.data?.items} onChange={(value) => { setCourse(value); controls.setPage(1); }} />
      <ReportRange days={days} onChange={(value) => { setDays(value); controls.setPage(1); }} />
    </InstructorFilterBar>
    <QueryPanel query={query} fallback={<><Skeleton className="h-72 rounded-2xl lg:w-1/2" /><InstructorTableSkeleton /></>}>{(result) => <>
      <div className="grid gap-4 lg:grid-cols-2">
        {result.totals.map((money) => {
          const trend = result.trend.filter(({ currency, isTestMode }) => currency === money.currency && isTestMode === money.isTestMode);
          return <AdminDashboardCard className="space-y-4" key={`${money.currency}-${money.isTestMode}`}>
            <h2 className="text-base font-semibold text-brand-text sm:text-lg">{money.currency} · {money.isTestMode ? "Sandbox sales" : "Live sales"}</h2>
            <p className="text-sm text-brand-text-muted">{count(money.orders)} verified orders</p>
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {(["gross", "refunded", "disputed", "net"] as const).map((field) => <div key={field} className="min-w-0 rounded-lg border border-brand-border bg-brand-page-secondary px-3 py-2">
                <dt className="text-xs text-brand-text-muted">{statusLabel(field)}</dt><dd className="wrap-break-word font-semibold tabular-nums text-brand-text">{commerceMoney(money[field], money.currency)}</dd>
              </div>)}
            </dl>
            <TrendChart data={trend.map((item) => ({ period: item.period, gross: Number(item.gross), net: Number(item.net) }))}
              series={salesSeries} format={(value) => commerceMoney(value, money.currency)} />
          </AdminDashboardCard>;
        })}
      </div>
      <WorkspaceTable result={result} columns={salesColumns} controls={controls} empty="No verified course sales in this period" />
    </>}</QueryPanel>
    <p className="text-xs text-brand-text-muted">Net deducts successful refunds and open or lost disputes up to the remainder of the original payment. Sandbox amounts represent test transactions.</p>
  </InstructorPage>;
}
