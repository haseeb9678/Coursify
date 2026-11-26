"use client";

import {
  BadgeCheck,
  CalendarDays,
  Clock3,
  Mail,
  ShieldCheck,
  type LucideIcon,
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
import type { AdminUser } from "@/features/admin/types/management.types";
import { formatManagementDate } from "@/features/admin/utils/management.utils";

interface UserDetailsSheetProps {
  user: AdminUser | null;
  onOpenChange: (open: boolean) => void;
}

export default function UserDetailsSheet({
  user,
  onOpenChange,
}: UserDetailsSheetProps) {
  return (
    <Sheet open={user !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b border-brand-border pr-14">
          <SheetTitle>User details</SheetTitle>
          <SheetDescription>
            Account information from the local demo dataset.
          </SheetDescription>
        </SheetHeader>
        {user && (
          <div className="space-y-6 p-5">
            <div className="flex items-center gap-4">
              <AdminUserAvatar name={user.name} avatar={user.avatar} size="lg" />
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-brand-text">
                  {user.name}
                </h3>
                <p className="truncate text-xs text-brand-text-muted">{user.email}</p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-primary">
                  {user.role.toLowerCase()} account
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <AdminStatusBadge status={user.status} />
              <AdminStatusBadge status={user.isEmailVerified ? "VERIFIED" : "UNVERIFIED"} />
            </div>

            <section className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-brand-text-muted">
                Account information
              </h4>
              <Detail icon={Mail} label="Email address" value={user.email} />
              <Detail
                icon={BadgeCheck}
                label="Email verification"
                value={user.isEmailVerified ? "Verified" : "Not verified"}
              />
              <Detail
                icon={CalendarDays}
                label="Registered"
                value={formatManagementDate(user.createdAt)}
              />
              <Detail
                icon={Clock3}
                label="Last login"
                value={formatManagementDate(user.lastLoginAt)}
              />
              <Detail
                icon={ShieldCheck}
                label="Account status"
                value={user.status.toLowerCase()}
              />
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-brand-border bg-background p-3">
      <Icon size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-brand-text-muted" />
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-brand-text-muted">{label}</p>
        <p className="mt-0.5 break-words text-xs font-medium capitalize text-brand-text">
          {value}
        </p>
      </div>
    </div>
  );
}
