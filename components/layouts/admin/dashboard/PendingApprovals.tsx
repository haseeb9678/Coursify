"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BadgeAlert,
  BookOpenCheck,
  UserRoundCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type {
  PendingApproval,
  PendingApprovalType,
} from "@/features/admin/types/dashboard.types";

import AdminDashboardCard from "./AdminDashboardCard";

interface PendingApprovalsProps {
  approvals: PendingApproval[];
}

const approvalIcons = {
  instructor_application: UserRoundCheck,
  course_publication: BookOpenCheck,
  flagged_review: BadgeAlert,
  other: BadgeAlert,
} satisfies Record<PendingApprovalType, typeof BadgeAlert>;

function getImplementedDestination(
  href?: string | null,
): string | null {
  if (href === "/admin/dashboard" || href === "/courses") {
    return href;
  }
  return null;
}

export default function PendingApprovals({
  approvals,
}: PendingApprovalsProps) {
  const pendingItems = approvals.filter(
    (approval) =>
      Number.isFinite(approval.pendingCount) && approval.pendingCount > 0,
  );

  return (
    <AdminDashboardCard delay={0.3}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-brand-text sm:text-lg">
            Pending approvals
          </h2>
          <p className="mt-1 text-xs text-brand-text-muted sm:text-sm">
            Items awaiting administrative review.
          </p>
        </div>
        {pendingItems.length > 0 && (
          <Badge
            variant="outline"
            className="shrink-0 border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400"
          >
            {pendingItems.reduce(
              (total, approval) => total + approval.pendingCount,
              0,
            )}{" "}
            pending
          </Badge>
        )}
      </div>

      {pendingItems.length > 0 ? (
        <ul className="mt-4 divide-y divide-brand-border/70">
          {pendingItems.map((approval) => {
            const Icon = approvalIcons[approval.type];
            const destination = getImplementedDestination(approval.href);

            return (
              <li
                key={approval.id}
                className="flex items-center gap-3 py-3 first:pt-1 last:pb-1"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-primary">
                  <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-text">
                    {approval.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-brand-text-muted">
                    {approval.description}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="shrink-0 border-brand-border bg-brand-page-secondary tabular-nums text-brand-text"
                >
                  {approval.pendingCount}
                </Badge>
                {destination && (
                  <Link
                    href={destination}
                    aria-label={`Open ${approval.title}`}
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-brand-text-muted transition-colors hover:bg-brand-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <ArrowUpRight size={16} />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex min-h-40 items-center justify-center text-center text-sm text-brand-text-muted">
          There are no pending approvals.
        </div>
      )}
    </AdminDashboardCard>
  );
}
