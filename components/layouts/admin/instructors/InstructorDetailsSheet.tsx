"use client";

import { useState } from "react";
import {
  Award,
  BarChart3,
  BookOpen,
  DollarSign,
  FileText,
  Star,
  UsersRound,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import AdminStatusBadge from "@/components/layouts/admin/shared/AdminStatusBadge";
import AdminUserAvatar from "@/components/layouts/admin/shared/AdminUserAvatar";
import type { AdminInstructor } from "@/features/admin/types/management.types";
import { formatManagementDate } from "@/features/admin/utils/management.utils";

export type InstructorDetailsTab =
  | "overview"
  | "courses"
  | "performance"
  | "reviews"
  | "earnings"
  | "application";

interface InstructorDetailsSheetProps {
  instructor: AdminInstructor | null;
  initialTab: InstructorDetailsTab;
  onOpenChange: (open: boolean) => void;
}

const tabs: { id: InstructorDetailsTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "courses", label: "Courses" },
  { id: "performance", label: "Performance" },
  { id: "reviews", label: "Reviews" },
  { id: "earnings", label: "Earnings" },
  { id: "application", label: "Application" },
];

export default function InstructorDetailsSheet({
  instructor,
  initialTab,
  onOpenChange,
}: InstructorDetailsSheetProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <Sheet open={instructor !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="border-b border-brand-border pr-14">
          <SheetTitle>Instructor profile</SheetTitle>
          <SheetDescription>Teaching and application details from demo data.</SheetDescription>
        </SheetHeader>
        {instructor && (
          <div className="space-y-5 p-5">
            <div className="flex items-center gap-3">
              <AdminUserAvatar name={instructor.name} avatar={instructor.avatar} size="lg" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-brand-text">{instructor.name}</h3>
                <p className="truncate text-xs text-brand-text-muted">{instructor.email}</p>
                <p className="mt-1 text-[10px] text-brand-text-muted">{instructor.specialization}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <AdminStatusBadge status={instructor.approvalStatus} />
              <AdminStatusBadge status={instructor.status} />
            </div>

            <div
              role="tablist"
              aria-label="Instructor detail sections"
              className="flex gap-1 overflow-x-auto border-b border-brand-border"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  id={`instructor-details-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls="instructor-details-panel"
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
              id="instructor-details-panel"
              role="tabpanel"
              aria-labelledby={`instructor-details-tab-${activeTab}`}
              className="min-h-64"
            >
              {activeTab === "overview" && <Overview instructor={instructor} />}
              {activeTab === "courses" && <Courses instructor={instructor} />}
              {activeTab === "performance" && <Performance instructor={instructor} />}
              {activeTab === "reviews" && <Reviews instructor={instructor} />}
              {activeTab === "earnings" && <Earnings instructor={instructor} />}
              {activeTab === "application" && <Application instructor={instructor} />}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Overview({ instructor }: { instructor: AdminInstructor }) {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-brand-text-muted">{instructor.bio}</p>
      <div className="grid grid-cols-2 gap-3">
        <Metric icon={BookOpen} label="Published courses" value={instructor.courses.length} />
        <Metric icon={UsersRound} label="Students taught" value={instructor.studentsTaught.toLocaleString()} />
        <Metric icon={Star} label="Average rating" value={instructor.averageRating?.toFixed(1) ?? "Not rated"} />
        <Metric icon={Award} label="Reviews" value={instructor.reviewCount.toLocaleString()} />
      </div>
      <p className="text-xs text-brand-text-muted">
        Instructor since {formatManagementDate(instructor.applicationSubmittedAt)} (demo application date).
      </p>
    </div>
  );
}

function Courses({ instructor }: { instructor: AdminInstructor }) {
  return instructor.courses.length === 0 ? (
    <EmptyPanel text="No courses are associated with this demo instructor." />
  ) : (
    <div className="space-y-2">
      {instructor.courses.map((course, index) => (
        <div key={course} className="flex items-center gap-3 rounded-xl border border-brand-border bg-background p-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen size={17} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-brand-text">{course}</p>
            <p className="mt-1 text-[10px] text-brand-text-muted">
              {index === 0 ? "Published" : "In development"} · demonstration record
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Performance({ instructor }: { instructor: AdminInstructor }) {
  return (
    <div className="space-y-3">
      <Metric icon={UsersRound} label="Students reached" value={instructor.studentsTaught.toLocaleString()} />
      <Metric icon={BookOpen} label="Courses" value={instructor.courses.length} />
      <Metric icon={Star} label="Learner rating" value={instructor.averageRating?.toFixed(1) ?? "Not rated"} />
      <div className="rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs leading-relaxed text-brand-text-muted">
        Performance values are illustrative sample data and are not connected to course analytics.
      </div>
    </div>
  );
}

function Reviews({ instructor }: { instructor: AdminInstructor }) {
  if (instructor.reviewCount === 0) {
    return <EmptyPanel text="This instructor does not have a rated review sample." />;
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-xl border border-brand-border bg-background p-4">
        <Star size={20} aria-hidden="true" className="fill-amber-400 text-amber-400" />
        <div>
          <p className="text-lg font-bold text-brand-text">{instructor.averageRating?.toFixed(1)} / 5</p>
          <p className="text-[11px] text-brand-text-muted">
            Based on {instructor.reviewCount.toLocaleString()} demo reviews
          </p>
        </div>
      </div>
      <div className="rounded-xl border border-brand-border bg-background p-3 text-xs text-brand-text-muted">
        Individual review moderation is not implemented in this demo.
      </div>
    </div>
  );
}

function Earnings({ instructor }: { instructor: AdminInstructor }) {
  return (
    <div className="space-y-3">
      <Metric
        icon={DollarSign}
        label="Illustrative lifetime earnings"
        value={new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(instructor.totalEarnings)}
      />
      <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
        Demonstration only. No payment, balance, or financial action is connected to this value.
      </p>
    </div>
  );
}

function Application({ instructor }: { instructor: AdminInstructor }) {
  return (
    <div className="space-y-3">
      <Metric icon={FileText} label="Submitted" value={formatManagementDate(instructor.applicationSubmittedAt)} />
      <Metric icon={Award} label="Specialization" value={instructor.specialization} />
      {instructor.rejectionReason && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3">
          <p className="text-[10px] font-semibold text-destructive">Previous demo rejection reason</p>
          <p className="mt-1 text-xs text-brand-text">{instructor.rejectionReason}</p>
        </div>
      )}
      <p className="text-xs text-brand-text-muted">
        Identity verification and application documents are not integrated.
      </p>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-brand-border bg-background p-3">
      <Icon size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-brand-text-muted" />
      <div>
        <p className="text-[10px] text-brand-text-muted">{label}</p>
        <p className="mt-1 text-xs font-semibold text-brand-text">{value}</p>
      </div>
    </div>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-brand-border text-center text-xs text-brand-text-muted">
      <BarChart3 size={19} aria-hidden="true" />
      {text}
    </div>
  );
}
