"use client";

import { useState } from "react";
import { Activity, Award, BookOpen, ChartNoAxesColumnIncreasing, Clock3 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import AdminStatusBadge from "@/components/layouts/admin/shared/AdminStatusBadge";
import AdminUserAvatar from "@/components/layouts/admin/shared/AdminUserAvatar";
import type { AdminStudent } from "@/features/admin/types/management.types";
import { formatManagementDate } from "@/features/admin/utils/management.utils";

export type StudentDetailsTab =
  | "overview"
  | "enrollments"
  | "progress"
  | "certificates"
  | "activity";

interface StudentDetailsSheetProps {
  student: AdminStudent | null;
  initialTab: StudentDetailsTab;
  onOpenChange: (open: boolean) => void;
}

const tabs: { id: StudentDetailsTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "enrollments", label: "Enrollments" },
  { id: "progress", label: "Progress" },
  { id: "certificates", label: "Certificates" },
  { id: "activity", label: "Activity" },
];

export default function StudentDetailsSheet({
  student,
  initialTab,
  onOpenChange,
}: StudentDetailsSheetProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <Sheet open={student !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="border-b border-brand-border pr-14">
          <SheetTitle>Student profile</SheetTitle>
          <SheetDescription>Learning activity in the local demo dataset.</SheetDescription>
        </SheetHeader>
        {student && (
          <div className="space-y-5 p-5">
            <div className="flex items-center gap-3">
              <AdminUserAvatar name={student.name} avatar={student.avatar} size="lg" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-brand-text">{student.name}</h3>
                <p className="truncate text-xs text-brand-text-muted">{student.email}</p>
              </div>
              <AdminStatusBadge status={student.status} />
            </div>

            <div
              role="tablist"
              aria-label="Student detail sections"
              className="flex gap-1 overflow-x-auto border-b border-brand-border"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  id={`student-details-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls="student-details-panel"
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 border-b-2 px-2.5 py-2 text-[11px] font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-brand-text-muted hover:text-brand-text"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div
              id="student-details-panel"
              role="tabpanel"
              aria-labelledby={`student-details-tab-${activeTab}`}
              className="min-h-64"
            >
              {activeTab === "overview" && <Overview student={student} />}
              {activeTab === "enrollments" && <Enrollments student={student} />}
              {activeTab === "progress" && <Progress student={student} />}
              {activeTab === "certificates" && <Certificates student={student} />}
              {activeTab === "activity" && <ActivityLog student={student} />}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Overview({ student }: { student: AdminStudent }) {
  const completed = student.enrollments.filter((item) => item.status === "COMPLETED").length;
  const inProgress = student.enrollments.length - completed;
  const metrics = [
    { label: "Enrolled", value: student.enrollments.length },
    { label: "Completed", value: completed },
    { label: "In progress", value: inProgress },
    { label: "Certificates", value: student.certificates.length },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-brand-border bg-background p-3">
            <p className="text-[10px] text-brand-text-muted">{metric.label}</p>
            <p className="mt-1 text-lg font-bold text-brand-text">{metric.value}</p>
          </div>
        ))}
      </div>
      <LearningProgress value={student.averageProgress} />
      <p className="text-xs text-brand-text-muted">
        Account created {formatManagementDate(student.createdAt)}. This learning record is demo data.
      </p>
    </div>
  );
}

function Enrollments({ student }: { student: AdminStudent }) {
  if (student.enrollments.length === 0) {
    return <EmptyPanel text="No course enrollments are recorded for this demo student." />;
  }
  return (
    <div className="space-y-2">
      {student.enrollments.map((enrollment) => (
        <div key={enrollment.courseId} className="rounded-xl border border-brand-border bg-background p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-brand-text">{enrollment.courseName}</p>
              <p className="mt-1 text-[10px] text-brand-text-muted">
                Enrolled {formatManagementDate(enrollment.enrolledAt)}
              </p>
            </div>
            <AdminStatusBadge status={enrollment.status} />
          </div>
          <LearningProgress value={enrollment.progress} />
        </div>
      ))}
    </div>
  );
}

function Progress({ student }: { student: AdminStudent }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
        <p className="text-xs text-brand-text-muted">Average learning progress</p>
        <p className="mt-1 text-3xl font-bold text-brand-text">{student.averageProgress}%</p>
        <LearningProgress value={student.averageProgress} />
      </div>
      <div className="space-y-3">
        {student.enrollments.map((enrollment) => (
          <div key={enrollment.courseId}>
            <div className="mb-1 flex justify-between gap-2 text-[11px]">
              <span className="truncate text-brand-text">{enrollment.courseName}</span>
              <span className="font-semibold tabular-nums text-brand-text">{enrollment.progress}%</span>
            </div>
            <LearningProgress value={enrollment.progress} />
          </div>
        ))}
        {student.enrollments.length === 0 && <EmptyPanel text="Progress will appear when demo courses are assigned." />}
      </div>
    </div>
  );
}

function Certificates({ student }: { student: AdminStudent }) {
  return student.certificates.length === 0 ? (
    <EmptyPanel text="No certificates have been earned in this demo dataset." />
  ) : (
    <ul className="space-y-2">
      {student.certificates.map((certificate) => (
        <li key={certificate} className="flex items-center gap-3 rounded-xl border border-brand-border bg-background p-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Award size={17} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold text-brand-text">{certificate}</p>
            <p className="mt-1 text-[10px] text-brand-text-muted">Demo certificate record</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ActivityLog({ student }: { student: AdminStudent }) {
  return (
    <div className="space-y-3">
      <ActivityItem
        icon={Activity}
        title="Last learning activity"
        detail={formatManagementDate(student.lastActivityAt)}
      />
      <ActivityItem
        icon={Clock3}
        title="Last account login"
        detail={formatManagementDate(student.lastLoginAt)}
      />
      {student.enrollments.slice(0, 4).map((enrollment) => (
        <ActivityItem
          key={enrollment.courseId}
          icon={BookOpen}
          title={enrollment.status === "COMPLETED" ? "Course completed" : "Course enrollment"}
          detail={enrollment.courseName}
        />
      ))}
    </div>
  );
}

function ActivityItem({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof Activity;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-brand-border bg-background p-3">
      <Icon size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />
      <div>
        <p className="text-xs font-semibold text-brand-text">{title}</p>
        <p className="mt-1 text-[11px] text-brand-text-muted">{detail}</p>
      </div>
    </div>
  );
}

function LearningProgress({ value }: { value: number }) {
  return (
    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-[width]"
        style={{ width: `${value}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Learning progress ${value}%`}
      />
    </div>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-brand-border text-center text-xs text-brand-text-muted">
      <ChartNoAxesColumnIncreasing size={19} aria-hidden="true" />
      {text}
    </div>
  );
}
