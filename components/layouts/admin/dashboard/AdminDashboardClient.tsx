"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { AdminDashboardData } from "@/features/admin/types/dashboard.types";
import { sampleAdminDashboardData } from "@/features/admin/data/dashboard.data";

import AdminDashboardSkeleton from "./AdminDashboardSkeleton";
import AdminDashboardWelcome from "./AdminDashboardWelcome";
import AdminDashboardStats from "./AdminDashboardStats";
import EnrollmentAnalyticsChart from "./EnrollmentAnalyticsChart";
import RevenueAnalyticsChart from "./RevenueAnalyticsChart";
import UserDistributionChart from "./UserDistributionChart";
import CoursePerformanceChart from "./CoursePerformanceChart";
import RecentEnrollments from "./RecentEnrollments";
import RecentActivity from "./RecentActivity";
import PendingApprovals from "./PendingApprovals";
import AdminQuickActions from "./AdminQuickActions";

export interface AdminDashboardClientProps {
  data?: AdminDashboardData | null;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export default function AdminDashboardClient({
  data,
  isLoading = false,
  isError = false,
  onRetry,
}: AdminDashboardClientProps) {
  const isUserLoading = useAuthStore((state) => state.isLoading);

  if (isUserLoading || isLoading) {
    return <AdminDashboardSkeleton />;
  }

  if (isError) {
    return (
      <section
        role="alert"
        className="mx-auto flex min-h-96 w-full max-w-450 flex-col items-center justify-center gap-3 px-4 py-10 text-center"
      >
        <span className="flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <AlertCircle size={22} aria-hidden="true" />
        </span>
        <h1 className="text-lg font-semibold text-brand-text">
          Dashboard data could not be loaded
        </h1>
        <p className="max-w-md text-sm text-brand-text-muted">
          Please try again. Sample analytics are not shown when a data error
          occurs.
        </p>
        {onRetry && (
          <Button
            type="button"
            onClick={onRetry}
            className="mt-1 gap-2"
          >
            <RefreshCw size={15} aria-hidden="true" />
            Try again
          </Button>
        )}
      </section>
    );
  }

  const dashboard = data ?? sampleAdminDashboardData;
  const isDemo = data == null;

  return (
    <section className="mx-auto w-full max-w-450 space-y-5 overflow-x-hidden px-4 py-6 sm:px-6 lg:space-y-6 lg:px-8 lg:py-8">
      <AdminDashboardWelcome isDemo={isDemo} />

      <AdminDashboardStats
        stats={dashboard.stats}
        currency={dashboard.currency}
      />

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-3">
        <EnrollmentAnalyticsChart
          analytics={dashboard.enrollmentAnalytics}
        />
        <UserDistributionChart users={dashboard.userDistribution} />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        <RevenueAnalyticsChart
          analytics={dashboard.revenueAnalytics}
          currency={dashboard.currency}
        />
        <CoursePerformanceChart
          courses={dashboard.coursePerformance}
        />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-3">
        <RecentEnrollments
          enrollments={dashboard.recentEnrollments}
        />
        <PendingApprovals approvals={dashboard.pendingApprovals} />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        <RecentActivity activities={dashboard.recentActivity} />
        <AdminQuickActions />
      </div>
    </section>
  );
}
