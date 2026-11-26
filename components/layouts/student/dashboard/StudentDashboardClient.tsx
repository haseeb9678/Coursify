"use client";

import DashboardWelcome from "./DashboardWelcome";
import DashboardStats from "./DashboardStats";
import LearningActivityChart from "./LearningActivityChart";
import CourseProgressChart from "./CourseProgressChart";
import WeeklyGoalCard from "./WeeklyGoalCard";
import ContinueLearning from "./ContinueLearning";
import RecentActivity from "./RecentActivity";
import DashboardSkeleton from "./DashboardSkeleton";

import { useAuthStore } from "@/features/auth/store/auth.store";

import type { StudentDashboardData } from "@/features/student/types/dashboard.types";
import { sampleDashboardData } from "@/features/student/data/dashboard.data";

interface StudentDashboardClientProps {
  data?: StudentDashboardData | null;
  isLoading?: boolean;
}

export default function StudentDashboardClient({
  data,
  isLoading = false,
}: StudentDashboardClientProps) {
  // Authentication state
  const isUserLoading = useAuthStore(
    (state) => state.isLoading,
  );

  // Display skeleton while user or dashboard data is loading.
  if (isUserLoading || isLoading) {
    return <DashboardSkeleton />;
  }

  // Use sample data until backend integration.
  const dashboard = data ?? sampleDashboardData;
  const isDemo = data == null;

  return (
    <section
      className="
        mx-auto w-full max-w-450
        space-y-5 px-4 py-6
        sm:px-6
        lg:space-y-6 lg:px-8 lg:py-8
      "
    >
      {/* Welcome Banner */}
      <DashboardWelcome />

      {/* Statistics Overview */}
      <DashboardStats stats={dashboard.stats} />

      {/* Main Analytics */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <LearningActivityChart
          activity={dashboard.learningActivity}
        />

        <CourseProgressChart
          stats={dashboard.stats}
        />
      </div>

      {/* Learning Progress */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ContinueLearning
          courses={dashboard.continueLearning}
        />

        <WeeklyGoalCard
          goal={dashboard.weeklyGoal}
        />
      </div>

      {/* Recent Student Activity */}
      <div className="grid grid-cols-1 gap-4">
        <RecentActivity
          activities={dashboard.recentActivity}
          isDemo={isDemo}
        />
      </div>
    </section>
  );
}