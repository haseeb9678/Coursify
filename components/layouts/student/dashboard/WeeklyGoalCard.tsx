"use client";

import { useAccessibleMotion } from "@/features/accessibility/hooks/use-accessible-motion";
import { motion } from "motion/react";
import { Flame, Trophy } from "lucide-react";

import DashboardCard from "./DashboardCard";
import { StudentDashboardData } from "@/features/student/types/dashboard.types";


interface WeeklyGoalCardProps {
  goal?: StudentDashboardData["weeklyGoal"];
}

export default function WeeklyGoalCard({
  goal,
}: WeeklyGoalCardProps) {
  const shouldReduceMotion = useAccessibleMotion();

  const hasGoal = !!goal && goal.targetHours > 0;

  const progress = hasGoal
    ? Math.min(
        100,
        Math.round(
          (goal.completedHours / goal.targetHours) * 100,
        ),
      )
    : 0;

  const remainingHours = Math.max(
    0,
    (goal?.targetHours ?? 0) - (goal?.completedHours ?? 0),
  );

  return (
    <DashboardCard delay={0.25}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-brand-text">
            Weekly learning goal
          </h2>

          <p className="mt-1 text-sm text-brand-text-muted">
            Consistency creates success.
          </p>
        </div>

        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Trophy size={21} />
        </span>
      </div>

      <div className="flex flex-col items-center py-6">
        <div
          className="relative size-44"
          role="img"
          aria-label={goal ? `${progress}% of weekly goal achieved` : "Weekly goal tracking unavailable"}
        >
          <svg
            viewBox="0 0 120 120"
            className="size-full -rotate-90"
            aria-hidden="true"
          >
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="currentColor"
              strokeWidth="7"
              className="text-primary/10"
            />

            {goal && <motion.circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="currentColor"
              strokeWidth="7"
              strokeLinecap="round"
              className="text-primary"
              initial={{
                pathLength: shouldReduceMotion
                  ? progress / 100
                  : 0,
              }}
              animate={{
                pathLength: progress / 100,
              }}
              transition={{
                duration: shouldReduceMotion ? 0 : 1,
                ease: "easeOut",
              }}
            />}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular-nums text-brand-text">
              {goal ? `${progress}%` : "?"}
            </span>

            <span className="text-xs text-brand-text-muted">
              Goal achieved
            </span>
          </div>
        </div>

        <p className="mt-3 text-sm font-semibold text-brand-text">
          {goal ? `${goal.completedHours} / ${goal.targetHours} hours` : "Weekly goal tracking unavailable"}
        </p>

        <p className="mt-1 text-center text-xs text-brand-text-muted">
          {!goal ? null : !hasGoal
            ? "No weekly goal configured yet."
            : remainingHours > 0
              ? `${remainingHours.toFixed(1)} hours remaining to reach your goal.`
              : "Congratulations! Goal achieved."}
        </p>
      </div>

      <div className="flex items-center gap-3 border-t border-brand-border pt-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
          <Flame size={23} />
        </span>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-text">
            {goal ? `${goal.streakDays}-day learning streak` : "Learning streak unavailable"}
          </p>

          <p className="mt-1 text-xs text-brand-text-muted">
            {!goal ? null : goal.streakDays > 0
              ? "Keep the momentum going!"
              : "Start learning to build your streak."}
          </p>
        </div>
      </div>
    </DashboardCard>
  );
}