"use client";

import {
  BadgeCheck,
  ShieldAlert,
  UserCheck,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AdminStatsGrid from "@/components/layouts/admin/shared/AdminStatsGrid";
import type { AdminStat } from "@/components/layouts/admin/shared/AdminStatCard";
import type { AdminUserStats } from "@/features/admin/types/users.types";

interface UsersStatsProps {
  stats: AdminUserStats | undefined;
  isPending: boolean;
  error?: string;
  onRetry: () => void;
}

export default function UsersStats({
  stats,
  isPending,
  error,
  onRetry,
}: UsersStatsProps) {
  if (!stats && isPending) {
    return (
      <section
        role="status"
        aria-label="Loading user statistics"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton
            key={index}
            className="h-28 rounded-xl border border-brand-border bg-card"
          />
        ))}
        <span className="sr-only">Loading user statistics</span>
      </section>
    );
  }

  if (!stats) {
    return (
      <div
        role="alert"
        className="flex flex-col gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-sm text-brand-text">
          User statistics could not be loaded. {error}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Retry statistics
        </Button>
      </div>
    );
  }

  const statistics: AdminStat[] = [
    {
      label: "Total users",
      value: stats.totalUsers.toLocaleString(),
      description: "All registered accounts",
      icon: UsersRound,
      tone: "primary",
    },
    {
      label: "Active users",
      value: stats.activeUsers.toLocaleString(),
      description: "Accounts able to sign in",
      icon: UserCheck,
      tone: "green",
    },
    {
      label: "Suspended users",
      value: stats.suspendedUsers.toLocaleString(),
      description: "Access currently suspended",
      icon: ShieldAlert,
      tone: "red",
    },
    {
      label: "Verified users",
      value: stats.verifiedUsers.toLocaleString(),
      description: "Email address verified",
      icon: BadgeCheck,
      tone: "violet",
    },
  ];

  return (
    <div className="space-y-3">
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-xs text-brand-text">{error}</p>
          <Button type="button" variant="ghost" size="sm" onClick={onRetry}>
            Retry statistics
          </Button>
        </div>
      )}
      <AdminStatsGrid stats={statistics} />
    </div>
  );
}
