"use client";

import { Tabs } from "@base-ui/react/tabs";
import { Activity, ArrowUpRight, BookOpen, CheckCircle2, ChevronRight, CircleAlert, ClipboardList, Clock3, Eye, FileText, Globe, GraduationCap, Grid2X2, Layers3, List, MessageSquareText, Pencil, Plus, Send, Settings2, Target, UsersRound } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import AdminEmptyState from "@/components/layouts/admin/shared/AdminEmptyState";
import AdminPageHeader from "@/components/layouts/admin/shared/AdminPageHeader";
import AdminFilterSelect from "@/components/layouts/admin/shared/AdminFilterSelect";
import AdminSearchInput from "@/components/layouts/admin/shared/AdminSearchInput";
import { AdminTableActionContent, AdminTableActionTrigger } from "@/components/layouts/admin/shared/AdminTableActionMenu";
import AdminTablePagination from "@/components/layouts/admin/shared/AdminTablePagination";
import type { AdminTableColumn } from "@/components/layouts/admin/shared/AdminDataTable";
import CourseLifecycleDialog, { type PendingCourseAction } from "@/components/layouts/admin/courses/CourseLifecycleDialog";
import CourseStatusBadge from "@/components/layouts/admin/courses/CourseStatusBadge";
import { InstructorCourseCardsSkeleton, InstructorCourseOverviewSkeleton, InstructorTableSkeleton } from "@/components/layouts/instructor/InstructorPageSkeletons";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useAccessibleMotion } from "@/features/accessibility/hooks/use-accessible-motion";
import { useAdminCourse, useAdminCourses, useCourseCategoryOptions } from "@/features/admin/hooks/use-admin-learning";
import { useDebouncedValue } from "@/features/admin/hooks/use-debounced-value";
import type { AdminCourse, CourseStatus } from "@/features/admin/types/learning.types";
import { canEditCourse, formatCoursePrice, formatLearningDuration, getCourseActionCopy, getCourseAdminActions } from "@/features/admin/utils/learning.utils";
import { commerceDate, safeMaterialUrl, statusLabel } from "@/features/commerce/commerce-format";
import InstructorCourseOutline from "./InstructorCourseOutline";
import { InstructorAnalyticsPanel, InstructorReviewsPanel, InstructorStudentsPanel } from "./InstructorReporting";
import { InstructorFilterBar, InstructorPage, panelClass, QueryPanel, useInstructorQuery, usePageControls, WorkspaceLink, WorkspaceTable } from "./InstructorUI";
import { instructorApi } from "./instructor.api";

const statuses: CourseStatus[] = ["DRAFT", "PENDING_REVIEW", "APPROVED", "REJECTED", "PUBLISHED", "ARCHIVED"];
const sortOptions = [
  { field: "UPDATED_AT", direction: "DESC", label: "Recently updated" },
  { field: "CREATED_AT", direction: "DESC", label: "Newest courses" },
  { field: "TITLE", direction: "ASC", label: "Title A–Z" },
  { field: "PRICE", direction: "DESC", label: "Highest price" },
] as const;

const coursePath = (id: string) => `/instructor/courses/${id}`;
const publicPath = (course: AdminCourse) => `/courses/${course.slug}`;
const price = (course: AdminCourse) => course.pricing.type === "FREE" ? "Free"
  : formatCoursePrice(course.pricing.discountedPriceMinorUnits ?? course.pricing.priceMinorUnits, course.pricing.currency);

function CourseImage({ course }: { course: AdminCourse }) {
  const source = safeMaterialUrl(course.thumbnailDataUrl);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  return source && source !== failedSource ? <Image src={source} alt="" width={600} height={338} unoptimized className="aspect-video w-full rounded-xl object-cover" onError={() => setFailedSource(source)} />
    : <div className="grid aspect-video w-full place-items-center rounded-xl bg-brand-soft text-primary"><BookOpen size={32} aria-hidden="true" /></div>;
}

function lifecycleActions(course: AdminCourse) {
  return getCourseAdminActions(course).filter((action) => action !== "publish" && action !== "featured" &&
    (action !== "restore" || (course.status === "ARCHIVED" && !course.enrollmentCount) || course.status === "REJECTED"));
}

function CardLinks({ course }: { course: AdminCourse }) {
  return <div className="mt-auto flex flex-wrap gap-2 border-t border-brand-border pt-3">
    <WorkspaceLink href={coursePath(course.id)} size="sm">Details</WorkspaceLink>
    <WorkspaceLink href={`${coursePath(course.id)}/curriculum`} size="sm">Curriculum</WorkspaceLink>
    {course.status === "PUBLISHED" && <WorkspaceLink href={publicPath(course)} size="sm">Public page</WorkspaceLink>}
  </div>;
}

export function InstructorCourses({ drafts = false, initialSearch = "" }: { drafts?: boolean; initialSearch?: string }) {
  const controls = usePageControls();
  const [search, setSearch] = useState(initialSearch);
  const [categoryId, setCategory] = useState("");
  const [status, setStatus] = useState<CourseStatus | "">("");
  const [sort, setSort] = useState(0);
  const [grid, setGrid] = useState(true);
  const settled = useDebouncedValue(search);
  const categories = useCourseCategoryOptions();
  const query = useAdminCourses(controls.pagination, {
    search: settled.trim() || undefined, categoryId: categoryId || undefined, status: drafts ? "DRAFT" : status || undefined,
  }, { field: sortOptions[sort].field, direction: sortOptions[sort].direction });
  const columns: AdminTableColumn<AdminCourse>[] = [
    { id: "title", header: "Course", cell: (course) => <div className="flex min-w-56 items-center gap-3">
      <div className="w-16 shrink-0"><CourseImage course={course} /></div>
      <Link className="max-w-56 truncate font-semibold text-brand-text hover:text-primary hover:underline" href={coursePath(course.id)} title={course.title}>{course.title}</Link>
    </div> },
    { id: "category", header: "Category and level", cell: (course) => <>{course.categoryName}<br /><span className="text-xs text-brand-text-muted">{statusLabel(course.level)}</span></> },
    { id: "price", header: "Price", cell: price },
    { id: "status", header: "Status", cell: (course) => <CourseStatusBadge status={course.status} /> },
    { id: "curriculum", header: "Curriculum", cell: (course) => `${course.sectionCount} modules · ${course.lessonCount} lessons · ${formatLearningDuration(course.durationSeconds ?? 0)}` },
    { id: "students", header: "Enrollments", cell: (course) => course.enrollmentCount ?? 0 },
    { id: "updated", header: "Updated", cell: (course) => commerceDate(course.updatedAt) },
    { id: "actions", header: "Actions", className: "w-14 text-right", cell: (course) => <DropdownMenu>
      <AdminTableActionTrigger label={`Actions for ${course.title}`} />
      <AdminTableActionContent className="w-48">
        <DropdownMenuItem render={<Link href={coursePath(course.id)} />}><Eye aria-hidden="true" /> Details</DropdownMenuItem>
        <DropdownMenuItem render={<Link href={`${coursePath(course.id)}/curriculum`} />}><BookOpen aria-hidden="true" /> Curriculum</DropdownMenuItem>
        {course.status === "PUBLISHED" && <DropdownMenuItem render={<Link href={publicPath(course)} />}><Globe aria-hidden="true" /> Public page</DropdownMenuItem>}
      </AdminTableActionContent>
    </DropdownMenu> },
  ];
  return <InstructorPage>
    <AdminPageHeader title={drafts ? "Draft courses" : "My courses"} description="Manage the courses you teach and prepare new material for review."
      actions={<WorkspaceLink href="/instructor/courses/create" variant="default"><Plus aria-hidden="true" /> Create course</WorkspaceLink>} />
    <InstructorFilterBar
      search={<AdminSearchInput label="Search courses" placeholder="Search your courses" value={search} onChange={(value) => { setSearch(value); controls.setPage(1); }} />}
      actions={<div role="group" aria-label="Course view" className="flex w-fit gap-1 rounded-lg border border-brand-border bg-background p-0.5">
        <Button type="button" size="icon-sm" variant={grid ? "secondary" : "ghost"} aria-label="Grid view" aria-pressed={grid} onClick={() => setGrid(true)}><Grid2X2 aria-hidden="true" /></Button>
        <Button type="button" size="icon-sm" variant={!grid ? "secondary" : "ghost"} aria-label="List view" aria-pressed={!grid} onClick={() => setGrid(false)}><List aria-hidden="true" /></Button>
      </div>}
    >
      <AdminFilterSelect label="Category" searchable value={categoryId} onChange={(value) => { setCategory(value); controls.setPage(1); }}
        options={[{ value: "", label: "All categories" }, ...(categories.data ?? []).map(({ id, name }) => ({ value: id, label: name }))]} />
      {!drafts && <AdminFilterSelect label="Course status" value={status} onChange={(value) => { setStatus(value as CourseStatus | ""); controls.setPage(1); }}
        options={[{ value: "", label: "All statuses" }, ...statuses.map((value) => ({ value, label: statusLabel(value) }))]} />}
      <AdminFilterSelect label="Sort courses" value={String(sort)} onChange={(value) => { setSort(Number(value)); controls.setPage(1); }}
        options={sortOptions.map(({ label }, index) => ({ value: String(index), label }))} />
    </InstructorFilterBar>
    <QueryPanel query={query} fallback={grid ? <InstructorCourseCardsSkeleton /> : <InstructorTableSkeleton />}>{(data) => !grid ? <WorkspaceTable result={data} columns={columns} controls={controls} empty="No matching courses" /> : <>
      {data.items.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{data.items.map((course) => <article key={course.id} className="flex min-w-0 flex-col gap-3 rounded-xl border border-brand-border bg-card p-4">
        <CourseImage course={course} />
        <div className="flex flex-wrap items-center justify-between gap-2"><CourseStatusBadge status={course.status} /><strong>{price(course)}</strong></div>
        <h2 className="truncate text-base font-semibold text-brand-text"><Link href={coursePath(course.id)} title={course.title} className="hover:text-primary hover:underline">{course.title}</Link></h2>
        <p className="text-sm text-brand-text-muted">{course.categoryName} · {statusLabel(course.level)}</p>
        <p className="text-xs text-brand-text-muted">{course.sectionCount} modules · {course.lessonCount} lessons · {formatLearningDuration(course.durationSeconds ?? 0)}</p>
        <p className="text-xs text-brand-text-muted">{course.enrollmentCount ?? 0} enrollments · Updated {commerceDate(course.updatedAt)}</p>
        <CardLinks course={course} />
      </article>)}</div> : <div className="rounded-xl border border-brand-border bg-card"><AdminEmptyState title="No matching courses" description="Try adjusting your search or filters." /></div>}
      <div className="overflow-hidden rounded-xl border border-brand-border bg-card [&>div]:border-t-0">
        <AdminTablePagination meta={data.meta} onPageChange={controls.setPage} onPageSizeChange={controls.setLimit} />
      </div>
    </>}</QueryPanel>
  </InstructorPage>;
}

const courseTabs = [
  { label: "Overview", value: "overview", icon: BookOpen },
  { label: "Curriculum", value: "curriculum", icon: Layers3 },
  { label: "Students", value: "students", icon: UsersRound },
  { label: "Analytics", value: "analytics", icon: Activity },
  { label: "Reviews", value: "reviews", icon: MessageSquareText },
  { label: "Settings", value: "settings", icon: Settings2 },
] as const;

type CourseTab = typeof courseTabs[number]["value"];

function CourseReadiness({ courseId }: { courseId: string }) {
  const query = useInstructorQuery(["course-readiness", courseId], () => instructorApi.readiness(courseId));
  return <section className={panelClass}>
    <h2 className="flex items-center gap-2 font-semibold text-brand-text"><ClipboardList size={17} className="text-primary" aria-hidden="true" />Review requirements</h2>
    <QueryPanel query={query}>{(issues) => issues.length ? (
      <ul className="space-y-2">
        {issues.map((issue, index) => <li key={index} className="flex gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-brand-text">
          <CircleAlert size={16} className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden="true" />
          <span className="min-w-0 wrap-break-word">{issue}</span>
        </li>)}
      </ul>
    ) : <p className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-brand-text">
      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />All submission requirements are met.
    </p>}</QueryPanel>
  </section>;
}

function CourseWorkspaceHero({ course, onSubmit }: { course: AdminCourse; onSubmit: () => void }) {
  const path = coursePath(course.id);
  const canSubmit = lifecycleActions(course).includes("submit");
  const metrics = [
    { label: "Modules", value: course.sectionCount ?? 0, icon: Layers3 },
    { label: "Lessons", value: course.lessonCount ?? 0, icon: FileText },
    { label: "Total duration", value: formatLearningDuration(course.durationSeconds ?? 0), icon: Clock3 },
    { label: "Enrollments", value: course.enrollmentCount ?? 0, icon: UsersRound },
  ];

  return <section className="overflow-hidden rounded-2xl border border-brand-border bg-card shadow-sm">
    <div className="grid items-center gap-5 bg-linear-to-br from-primary/10 via-brand-soft/30 to-card p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(12rem,26%)] lg:gap-7">
      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <CourseStatusBadge status={course.status} />
          {course.categoryName && <span className="rounded-full border border-brand-border bg-card/80 px-2.5 py-1 text-xs font-medium text-brand-text">{course.categoryName}</span>}
        </div>
        <div className="space-y-2">
          <h1 className="wrap-break-word text-2xl font-bold tracking-tight text-brand-text sm:text-3xl xl:text-4xl">{course.title}</h1>
          {course.shortDescription && <p className="max-w-2xl wrap-break-word text-sm leading-relaxed text-brand-text-muted">{course.shortDescription}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canSubmit && <Button type="button" onClick={onSubmit}><Send aria-hidden="true" />Submit for review</Button>}
          <WorkspaceLink href={`${path}/curriculum`} variant={canSubmit ? "outline" : "default"}><Layers3 aria-hidden="true" />Manage curriculum</WorkspaceLink>
          {canEditCourse(course.status) && <WorkspaceLink href={`${path}/edit`}><Pencil aria-hidden="true" />Edit course</WorkspaceLink>}
          <WorkspaceLink href={`${path}/students`}><UsersRound aria-hidden="true" />View students</WorkspaceLink>
          {course.status === "PUBLISHED" && <WorkspaceLink href={publicPath(course)}><ArrowUpRight aria-hidden="true" />Preview public page</WorkspaceLink>}
        </div>
      </div>
      <div className="w-full max-w-sm justify-self-start rounded-2xl border border-brand-border bg-card p-1.5 shadow-sm lg:justify-self-end">
        <CourseImage course={course} />
      </div>
    </div>
    <dl className="grid grid-cols-2 gap-px border-t border-brand-border bg-brand-border md:grid-cols-4">
      {metrics.map(({ label, value, icon: Icon }) => <div key={label} className="flex min-w-0 items-center gap-2.5 bg-card p-3 sm:gap-3 sm:px-5 sm:py-4">
        <span className="hidden size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-primary sm:grid"><Icon size={16} aria-hidden="true" /></span>
        <div className="min-w-0">
          <dt className="text-xs text-brand-text-muted">{label}</dt>
          <dd className="wrap-break-word font-semibold tabular-nums text-brand-text">{value.toLocaleString()}</dd>
        </div>
      </div>)}
    </dl>
  </section>;
}

function CourseOverview({ course }: { course: AdminCourse }) {
  const content = [
    { label: "Learning outcomes", entries: course.learningOutcomes, icon: Target },
    { label: "Requirements", entries: course.requirements, icon: ClipboardList },
    { label: "Target audience", entries: course.targetAudience, icon: GraduationCap },
  ];
  const details = [
    { label: "Difficulty", value: statusLabel(course.level) },
    { label: "Language", value: course.language },
    { label: "Price", value: price(course) },
    { label: "Last updated", value: commerceDate(course.updatedAt) },
  ];

  return <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
    <div className="min-w-0 space-y-4">
      <section className={panelClass}>
        <h2 className="text-lg font-semibold tracking-tight text-brand-text">About this course</h2>
        <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed text-brand-text-muted">{course.description || "Add a description before submitting this course."}</p>
      </section>
      {content.filter(({ entries }) => entries.length > 0).map(({ label, entries, icon: Icon }) => <section key={label} className={panelClass}>
        <h2 className="flex items-center gap-2 font-semibold text-brand-text"><Icon size={17} aria-hidden="true" className="text-primary" />{label}</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {entries.map((entry, index) => <li key={index} className="flex items-start gap-1.5 rounded-lg bg-brand-page-secondary p-3 text-sm text-brand-text">
            <ChevronRight size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />
            <span className="min-w-0 wrap-break-word">{entry}</span>
          </li>)}
        </ul>
      </section>)}
    </div>
    <div className="min-w-0 space-y-4">
      <section className={panelClass}>
        <h2 className="text-lg font-semibold tracking-tight text-brand-text">Course details</h2>
        <dl className="divide-y divide-brand-border">
          {details.map(({ label, value }) => <div key={label} className="flex justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0">
            <dt className="shrink-0 text-brand-text-muted">{label}</dt>
            <dd className="min-w-0 wrap-break-word text-right font-medium text-brand-text">{value}</dd>
          </div>)}
        </dl>
      </section>
      {canEditCourse(course.status) && <CourseReadiness courseId={course.id} />}
    </div>
  </div>;
}

function CourseSettings({ course, onAction }: {
  course: AdminCourse;
  onAction: (action: PendingCourseAction["action"]) => void;
}) {
  const actions = lifecycleActions(course);

  return <div className="space-y-4">
    <section className={panelClass}>
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-brand-text"><Globe size={18} className="text-primary" aria-hidden="true" />Publication settings</h2>
        <CourseStatusBadge status={course.status} />
      </header>
      <p className="text-sm leading-relaxed text-brand-text-muted">The review team approves and publishes courses. Course content and curriculum are editable in draft or after rejection.</p>
      {course.status === "PUBLISHED" && <p className="rounded-lg border border-brand-border bg-brand-page-secondary p-3 text-sm text-brand-text-muted">Archiving removes the public listing. Enrolled learners retain access.</p>}
    </section>
    {actions.length > 0 && <section className={panelClass}>
      <h2 className="font-semibold text-brand-text">Course actions</h2>
      <ul className="divide-y divide-brand-border">
        {actions.map((action) => {
          const { label, description } = getCourseActionCopy(action, course);
          return <li key={action} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <p className="min-w-0 flex-1 basis-44 wrap-break-word text-sm text-brand-text-muted">{description}</p>
            <Button type="button" variant={action === "delete" ? "destructive" : "outline"} onClick={() => onAction(action)}>{label}</Button>
          </li>;
        })}
      </ul>
    </section>}
  </div>;
}

function CourseReport({ tab, title, description, children }: { tab: CourseTab; title: string; description: string; children: ReactNode }) {
  const Icon = courseTabs.find(({ value }) => value === tab)!.icon;
  return <section className="space-y-4">
    <header className="flex items-center gap-3 rounded-2xl border border-brand-border bg-linear-to-r from-primary/5 to-card p-4 sm:p-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-primary"><Icon size={19} aria-hidden="true" /></span>
      <div className="min-w-0">
        <h2 className="text-lg font-semibold tracking-tight text-brand-text sm:text-xl">{title}</h2>
        <p className="mt-0.5 text-sm text-brand-text-muted">{description}</p>
      </div>
    </header>
    {children}
  </section>;
}

export function InstructorCourseDetails({ courseId, initialTab }: { courseId: string; initialTab?: string }) {
  const router = useRouter();
  const reduceMotion = useAccessibleMotion();
  const query = useAdminCourse(courseId);
  const [pending, setPending] = useState<PendingCourseAction | null>(null);
  const defaultTab = courseTabs.find(({ value }) => value === initialTab)?.value ?? "overview";

  return <InstructorPage>
    <QueryPanel query={query} fallback={<InstructorCourseOverviewSkeleton />}>{(course) => {
      const showAction = (action: PendingCourseAction["action"]) => setPending({ course, action });
      const panels: Record<CourseTab, ReactNode> = {
        overview: <CourseOverview course={course} />,
        curriculum: <InstructorCourseOutline courseId={course.id} />,
        students: <CourseReport tab="students" title="Course enrollments" description="Find students and review enrollment and completion status for this course."><InstructorStudentsPanel courseId={course.id} /></CourseReport>,
        analytics: <CourseReport tab="analytics" title="Course analytics" description="Explore enrollment growth, course completion, and participation over time."><InstructorAnalyticsPanel courseId={course.id} /></CourseReport>,
        reviews: <CourseReport tab="reviews" title="Review feedback" description="See publication decisions and revision feedback from the course review team."><InstructorReviewsPanel courseId={course.id} /></CourseReport>,
        settings: <CourseSettings course={course} onAction={showAction} />,
      };

      return <div className="space-y-5 sm:space-y-6">
        <CourseWorkspaceHero course={course} onSubmit={() => showAction("submit")} />
        <Tabs.Root defaultValue={defaultTab} className="min-w-0 space-y-5 sm:space-y-6">
          <Tabs.List aria-label="Course management" className="grid grid-cols-3 gap-1 rounded-xl border border-brand-border bg-card p-1.5 sm:grid-cols-6">
            {courseTabs.map(({ label, value, icon: Icon }) => <Tabs.Tab key={value} value={value}
              className="flex min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-transparent px-1.5 py-2 text-xs font-medium text-brand-text-muted transition-colors hover:bg-brand-page-secondary hover:text-brand-text focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none data-active:border-primary/15 data-active:bg-primary/10 data-active:text-primary md:gap-1.5 lg:flex-row lg:px-2.5 lg:py-2.5 lg:text-sm">
              <Icon aria-hidden="true" size={16} className="shrink-0" />{label}
            </Tabs.Tab>)}
          </Tabs.List>
          {courseTabs.map(({ value }) => <Tabs.Panel key={value} value={value} className="min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <motion.div initial={reduceMotion ? false : { opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.2 }}>
              {panels[value]}
            </motion.div>
          </Tabs.Panel>)}
        </Tabs.Root>
        <CourseLifecycleDialog pending={pending} onClose={() => setPending(null)} onComplete={({ action }) => { if (action === "delete") router.replace("/instructor/courses"); }} />
      </div>;
    }}</QueryPanel>
  </InstructorPage>;
}
