"use client";

import { Badge } from "@/components/ui/badge";
import type {
  EnrollmentStatus,
  RecentEnrollment as RecentEnrollmentData,
} from "@/features/admin/types/dashboard.types";

import AdminDashboardCard from "./AdminDashboardCard";

interface RecentEnrollmentsProps {
  enrollments: RecentEnrollmentData[];
}

const statusPresentation: Record<
  EnrollmentStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Active",
    className:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  completed: {
    label: "Completed",
    className:
      "border-primary/20 bg-primary/10 text-primary",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "border-brand-border bg-brand-page-secondary text-brand-text-muted",
  },
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function formatEnrollmentDate(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default function RecentEnrollments({
  enrollments,
}: RecentEnrollmentsProps) {
  return (
    <AdminDashboardCard className="xl:col-span-2" delay={0.28}>
      <div>
        <h2 className="text-base font-semibold text-brand-text sm:text-lg">
          Recent enrollments
        </h2>
        <p className="mt-1 text-xs text-brand-text-muted sm:text-sm">
          Latest student course activity.
        </p>
      </div>

      {enrollments.length > 0 ? (
        <div className="-mx-4 mt-4 overflow-x-auto sm:-mx-5">
          <table className="w-full min-w-[600px] border-collapse text-left text-sm">
            <caption className="sr-only">
              Recent student course enrollments
            </caption>
            <thead>
              <tr className="border-y border-brand-border bg-brand-page-secondary/60 text-xs text-brand-text-muted">
                <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                  Student
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Course
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Enrolled
                </th>
                <th scope="col" className="px-4 py-3 font-medium sm:pr-5">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/70">
              {enrollments.map((enrollment) => {
                const status = statusPresentation[enrollment.status];
                const initials = getInitials(enrollment.studentName);

                return (
                  <tr
                    key={enrollment.id}
                    className="transition-colors hover:bg-brand-page-secondary/50"
                  >
                    <td className="max-w-52 px-4 py-3 sm:px-5">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          aria-hidden="true"
                          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary/10 text-[10px] font-semibold text-primary"
                        >
                          {initials || "?"}
                        </span>
                        <span
                          title={enrollment.studentName}
                          className="truncate font-medium text-brand-text"
                        >
                          {enrollment.studentName || "Unnamed student"}
                        </span>
                      </div>
                    </td>
                    <td
                      title={enrollment.courseName}
                      className="max-w-64 truncate px-4 py-3 text-brand-text-muted"
                    >
                      {enrollment.courseName || "Course unavailable"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-brand-text-muted">
                      {formatEnrollmentDate(enrollment.enrolledAt)}
                    </td>
                    <td className="px-4 py-3 sm:pr-5">
                      <Badge
                        variant="outline"
                        className={status.className}
                      >
                        {status.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex min-h-40 items-center justify-center text-center text-sm text-brand-text-muted">
          No recent enrollments are available.
        </div>
      )}
    </AdminDashboardCard>
  );
}
