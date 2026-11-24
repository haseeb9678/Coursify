"use client";

import { useEffect, useState } from "react";

import DashboardWelcome from "./DashboardWelcome";
import DashboardStats from "./DashboardStats";
import LearningActivityChart from "./LearningActivityChart";
import CourseProgressChart from "./CourseProgressChart";
import WeeklyGoalCard from "./WeeklyGoalCard";
import ContinueLearning from "./ContinueLearning";
import RecentActivity from "./RecentActivity";
import DashboardSkeleton from "./DashboardSkeleton";

import type { StudentDashboardData } from "@/features/student/types/dashboard.types";
import { sampleDashboardData } from "@/features/student/data/dashboard.data";

interface StudentDashboardClientProps {
  data?: StudentDashboardData | null;
}

export default function StudentDashboardClient({
  data,
}: StudentDashboardClientProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Temporary loading simulation until API integration.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  // Use sample data until the backend is integrated.
  const dashboard = data ?? sampleDashboardData;

  const isDemo = data == null;

  // Display dashboard skeleton while loading.
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <section
      className="
        mx-auto w-full max-w-450
        space-y-5 px-4 py-6
        sm:px-6
        lg:space-y-6 lg:px-8 lg:py-8
      "
    >
      {/* =====================================
          WELCOME BANNER
      ====================================== */}

      <DashboardWelcome
        studentName={dashboard.student.name}
      />

      {/* =====================================
          STATISTICS OVERVIEW
      ====================================== */}

      <DashboardStats stats={dashboard.stats} />

      {/* =====================================
          MAIN ANALYTICS
      ====================================== */}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <LearningActivityChart
          activity={dashboard.learningActivity}
        />

        <CourseProgressChart
          stats={dashboard.stats}
        />
      </div>

      {/* =====================================
          LEARNING PROGRESS
      ====================================== */}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ContinueLearning
          courses={dashboard.continueLearning}
        />

        <WeeklyGoalCard
          goal={dashboard.weeklyGoal}
        />
      </div>

      {/* =====================================
          RECENT STUDENT ACTIVITY
      ====================================== */}

      <div className="grid grid-cols-1 gap-4">
        <RecentActivity
          activities={dashboard.recentActivity}
          isDemo={isDemo}
        />
      </div>
    </section>
  );
}