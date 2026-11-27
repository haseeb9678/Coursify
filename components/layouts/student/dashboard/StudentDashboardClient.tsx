"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { commerceApi } from "@/features/commerce/commerce.api";
import { commerceKeys } from "@/features/commerce/commerce-cache";
import { CommerceMessage } from "@/features/commerce/CommerceUi";
import { useStudentCommerceStats, useStudentId } from "@/features/commerce/student-queries";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";
import type { RecentActivityItem, StudentDashboardData } from "@/features/student/types/dashboard.types";
import DashboardWelcome from "./DashboardWelcome";
import DashboardStats from "./DashboardStats";
import LearningActivityChart from "./LearningActivityChart";
import CourseProgressChart from "./CourseProgressChart";
import WeeklyGoalCard from "./WeeklyGoalCard";
import ContinueLearning from "./ContinueLearning";
import RecentActivity from "./RecentActivity";
import DashboardSkeleton from "./DashboardSkeleton";

interface StudentDashboardClientProps {
  data?: StudentDashboardData | null;
  isLoading?: boolean;
}

const recentPage = { page: 1, limit: 5 };

export default function StudentDashboardClient({ data, isLoading = false }: StudentDashboardClientProps) {
  const isUserLoading = useAuthStore((state) => state.isLoading);
  const userId = useStudentId();
  const stats = useStudentCommerceStats(userId);
  const recent = useQuery({
    queryKey: [...commerceKeys.scope("student", userId), "courses", recentPage, {}],
    queryFn: () => commerceApi.enrollments(false, recentPage, {}),
    enabled: !!userId && !data,
    retry: false,
  });

  if (isUserLoading || isLoading || !userId || (!data && (stats.isPending || recent.isPending))) {
    return <DashboardSkeleton />;
  }

  const enrollments = recent.data?.items ?? [];
  const activities: RecentActivityItem[] = enrollments.map((enrollment) => ({
    id: enrollment.id,
    type: "course_enrolled",
    title: enrollment.course.title,
    description: "Course enrollment confirmed",
    createdAt: enrollment.enrolledAt,
  }));

  return (
    <section className="mx-auto w-full max-w-450 space-y-5 px-4 py-6 sm:px-6 lg:space-y-6 lg:px-8 lg:py-8">
      <DashboardWelcome />
      {!data && (stats.isError || recent.isError) && (
        <CommerceMessage title="Some dashboard data is unavailable" message={getGraphQLErrorMessage(stats.error ?? recent.error)}
          actions={<Button variant="outline" busy={stats.isFetching || recent.isFetching}
            onClick={() => { void stats.refetch(); void recent.refetch(); }}>Try again</Button>} />
      )}
      <DashboardStats stats={data?.stats} enrollmentStats={stats.data?.enrollments} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <LearningActivityChart activity={data?.learningActivity} />
        <CourseProgressChart stats={data?.stats} enrollmentStats={stats.data?.enrollments} />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ContinueLearning courses={data?.continueLearning} enrollments={enrollments} />
        <WeeklyGoalCard goal={data?.weeklyGoal} />
      </div>
      <div className="grid grid-cols-1 gap-4">
        <RecentActivity activities={data?.recentActivity ?? activities} />
      </div>
    </section>
  );
}
