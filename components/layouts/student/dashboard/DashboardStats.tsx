"use client";

import Link from "next/link";

import {
  BookOpen,
  CircleCheck,
  Clock3,
  Award,
  ArrowUpRight,
} from "lucide-react";

import DashboardCard from "./DashboardCard";
import { DashboardStatsData } from "@/features/student/types/dashboard.types";


interface DashboardStatsProps {
  stats: DashboardStatsData;
}

export default function DashboardStats({
  stats,
}: DashboardStatsProps) {
  const completionRate =
    stats.enrolledCourses > 0
      ? Math.round(
          (stats.completedCourses /
            stats.enrolledCourses) *
            100,
        )
      : 0;

  const cards = [
    {
      label: "Enrolled courses",
      value: stats.enrolledCourses,
      description: `${stats.inProgressCourses} currently in progress`,
      icon: BookOpen,
      href: "/student/my-learning",
      color: "text-primary bg-primary/10",
    },
    {
      label: "Completed courses",
      value: stats.completedCourses,
      description: `${completionRate}% completion rate`,
      icon: CircleCheck,
      href: "/student/my-learning",
      color: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
    },
    {
      label: "Learning hours",
      value: `${stats.learningHours.toFixed(1)}h`,
      description: "Total learning time",
      icon: Clock3,
      href: "/student/my-learning",
      color: "text-violet-600 bg-violet-500/10 dark:text-violet-400",
    },
    {
      label: "Certificates",
      value: stats.certificates,
      description: "Certificates earned",
      icon: Award,
      href: "/student/certificates",
      color: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <DashboardCard
            key={card.label}
            delay={index * 0.07}
            className="group"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-brand-text-muted">
                {card.label}
              </p>

              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${card.color}`}
              >
                <Icon size={20} strokeWidth={1.8} />
              </span>
            </div>

            <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums text-brand-text">
              {card.value}
            </p>

            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="text-xs text-brand-text-muted">
                {card.description}
              </p>

              <Link
                href={card.href}
                aria-label={`View ${card.label}`}
                className="
                  flex size-7 shrink-0 items-center
                  justify-center rounded-md
                  text-brand-text-muted
                  transition-colors
                  hover:bg-brand-soft hover:text-primary
                "
              >
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </DashboardCard>
        );
      })}
    </div>
  );
}