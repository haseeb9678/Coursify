"use client";

import { useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Clock3,
  Globe2,
  Mail,
  MonitorSmartphone,
  RefreshCw,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import AdminConfirmDialog from "@/components/layouts/admin/shared/AdminConfirmDialog";
import AdminEmptyState from "@/components/layouts/admin/shared/AdminEmptyState";
import AdminErrorState from "@/components/layouts/admin/shared/AdminErrorState";
import AdminStatusBadge from "@/components/layouts/admin/shared/AdminStatusBadge";
import AdminUserAvatar from "@/components/layouts/admin/shared/AdminUserAvatar";
import {
  ADMIN_SESSIONS_PAGE_SIZE,
} from "@/features/admin/constants/users.constants";
import { useAdminRevokeUserSessions } from "@/features/admin/hooks/use-admin-revoke-user-sessions";
import { useAdminUser } from "@/features/admin/hooks/use-admin-user";
import { useAdminUserSessions } from "@/features/admin/hooks/use-admin-user-sessions";
import type {
  AdminUser,
  AdminUserSession,
} from "@/features/admin/types/users.types";
import {
  getGraphQLErrorCode,
  getGraphQLErrorMessage,
} from "@/lib/graphql/error";
import { formatManagementDate } from "@/features/admin/utils/management.utils";

type SessionAction = AdminUserSession | "all" | null;
type UserDetailsTab = "details" | "sessions";

interface UserDetailsSheetProps {
  user: AdminUser | null;
  isCurrentUser: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserDetailsSheet({
  user,
  isCurrentUser,
  onOpenChange,
}: UserDetailsSheetProps) {
  const [activeTab, setActiveTab] = useState<UserDetailsTab>("details");
  const [sessionsPage, setSessionsPage] = useState(1);
  const [sessionAction, setSessionAction] = useState<SessionAction>(null);
  const userId = user?.id ?? null;
  const detailsQuery = useAdminUser(userId, userId !== null);
  const sessionsQuery = useAdminUserSessions(
    userId,
    sessionsPage,
    userId !== null && activeTab === "sessions",
  );
  const revokeSessions = useAdminRevokeUserSessions();
  const details = detailsQuery.data;
  const sessions = sessionsQuery.data ?? [];
  const isSessionsPlaceholder = sessionsQuery.isPlaceholderData;

  const handleRevokeSessions = () => {
    if (!userId || isCurrentUser || !sessionAction) return;

    revokeSessions.mutate(
      sessionAction === "all"
        ? { userId }
        : { userId, sessionId: sessionAction.id },
    );
    setSessionAction(null);
  };

  return (
    <Sheet open={user !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b border-brand-border pr-14">
          <SheetTitle>User details</SheetTitle>
          <SheetDescription>
            Live account and active-session information.
          </SheetDescription>
        </SheetHeader>
        {user && (
          <div className="space-y-5 p-5">
            <div className="flex items-center gap-4">
              <AdminUserAvatar
                name={details?.name ?? user.name}
                avatar={details ? details.avatar : user.avatar}
                size="lg"
              />
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-brand-text">
                  {details?.name ?? user.name}
                </h3>
                <p className="truncate text-xs text-brand-text-muted">
                  {details?.email ?? user.email}
                </p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-primary">
                  {(details?.role ?? user.role).toLowerCase()} account
                </p>
              </div>
            </div>

            <div
              role="group"
              aria-label="User information sections"
              className="flex border-b border-brand-border"
            >
              <button
                type="button"
                aria-pressed={activeTab === "details"}
                className={`border-b-2 px-3 py-2 text-xs font-medium ${
                  activeTab === "details"
                    ? "border-primary text-primary"
                    : "border-transparent text-brand-text-muted"
                }`}
                onClick={() => setActiveTab("details")}
              >
                Details
              </button>
              <button
                type="button"
                aria-pressed={activeTab === "sessions"}
                className={`border-b-2 px-3 py-2 text-xs font-medium ${
                  activeTab === "sessions"
                    ? "border-primary text-primary"
                    : "border-transparent text-brand-text-muted"
                }`}
                onClick={() => {
                  setSessionsPage(1);
                  setActiveTab("sessions");
                }}
              >
                Sessions
              </button>
            </div>

            {activeTab === "details" ? (
              <DetailsPanel
                user={details}
                isPending={detailsQuery.isPending}
                error={detailsQuery.error}
                onRetry={() => void detailsQuery.refetch()}
              />
            ) : (
              <section
                aria-label="Active sessions"
                className="space-y-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-brand-text-muted">
                    Active sessions only. Token credentials are never shown.
                  </p>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={
                      isCurrentUser ||
                      sessions.length === 0 ||
                      sessionsQuery.isError ||
                      isSessionsPlaceholder ||
                      sessionsQuery.isFetching ||
                      revokeSessions.isPending
                    }
                    onClick={() => setSessionAction("all")}
                  >
                    Revoke all
                  </Button>
                </div>
                {isCurrentUser && (
                  <p className="rounded-lg bg-muted px-3 py-2 text-xs text-brand-text-muted">
                    Session revocation is disabled for your own account here to
                    avoid ending your active session.
                  </p>
                )}
                {sessionsQuery.isError && sessions.length === 0 ? (
                  <div className="space-y-3">
                    <AdminErrorState
                      title="Sessions could not be loaded"
                      description={getGraphQLErrorMessage(sessionsQuery.error)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void sessionsQuery.refetch()}
                    >
                      Retry sessions
                    </Button>
                  </div>
                ) : sessionsQuery.isPending && sessions.length === 0 ? (
                  <div
                    role="status"
                    aria-label="Loading active sessions"
                    className="space-y-3"
                  >
                    {Array.from({ length: 3 }, (_, index) => (
                      <Skeleton
                        key={index}
                        className="h-28 rounded-xl border border-brand-border bg-card"
                      />
                    ))}
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="space-y-3">
                    <AdminEmptyState
                      title={
                        sessionsPage > 1
                          ? "No more active sessions"
                          : "No active sessions"
                      }
                      description={
                        sessionsPage > 1
                          ? "There are no sessions on this page."
                          : "This account has no sessions that can currently be revoked."
                      }
                    />
                    {sessionsPage > 1 && (
                      <div className="flex justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={sessionsQuery.isFetching}
                          onClick={() =>
                            setSessionsPage((page) => Math.max(1, page - 1))
                          }
                        >
                          Previous session page
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {sessionsQuery.isError && (
                      <p role="alert" className="text-xs text-destructive">
                        {getGraphQLErrorMessage(sessionsQuery.error)}
                      </p>
                    )}
                    {isSessionsPlaceholder && (
                      <p role="status" className="text-xs text-brand-text-muted">
                        Loading the requested session page…
                      </p>
                    )}
                    <div
                      aria-busy={isSessionsPlaceholder}
                      className={`space-y-3 ${
                        isSessionsPlaceholder ? "opacity-60" : ""
                      }`}
                    >
                      {sessions.map((session) => (
                        <SessionCard
                          key={session.id}
                          session={session}
                          isDisabled={
                            isCurrentUser ||
                            sessionsQuery.isError ||
                            isSessionsPlaceholder ||
                            sessionsQuery.isFetching ||
                            revokeSessions.isPending
                          }
                          onRevoke={() => setSessionAction(session)}
                        />
                      ))}
                    </div>
                    {sessions.length === ADMIN_SESSIONS_PAGE_SIZE && (
                      <div className="flex items-center justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={sessionsPage <= 1 || sessionsQuery.isFetching}
                          onClick={() =>
                            setSessionsPage((page) => Math.max(1, page - 1))
                          }
                        >
                          Previous
                        </Button>
                        <span className="text-xs text-brand-text-muted">
                          Session page {sessionsPage}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={
                            sessions.length < ADMIN_SESSIONS_PAGE_SIZE ||
                            sessionsQuery.isFetching
                          }
                          onClick={() => setSessionsPage((page) => page + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </section>
            )}
          </div>
        )}
      </SheetContent>
      <AdminConfirmDialog
        open={sessionAction !== null}
        onOpenChange={(open) => {
          if (!open) setSessionAction(null);
        }}
        title={
          sessionAction === "all"
            ? "Revoke all active sessions?"
            : "Revoke this session?"
        }
        description={
          sessionAction === "all"
            ? `This will sign ${user?.name ?? "this user"} out on all active devices.`
            : `This will sign ${user?.name ?? "this user"} out of the selected device.`
        }
        confirmLabel="Revoke session"
        isDestructive
        isDisabled={revokeSessions.isPending}
        onConfirm={handleRevokeSessions}
      />
    </Sheet>
  );
}

function DetailsPanel({
  user,
  isPending,
  error,
  onRetry,
}: {
  user: AdminUser | undefined;
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
}) {
  if (isPending && !user) {
    return (
      <div role="status" aria-label="Loading user details" className="space-y-4">
        <Skeleton className="h-16 rounded-xl" />
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-14 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!user) {
    const notFound = getGraphQLErrorCode(error) === "NOT_FOUND";
    return (
      <div className="space-y-3">
        <AdminErrorState
          title={notFound ? "User not found" : "User details unavailable"}
          description={
            notFound
              ? "This account may have been removed or is no longer available."
              : getGraphQLErrorMessage(error)
          }
        />
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Retry details
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <AdminStatusBadge status={user.status} />
        <AdminStatusBadge
          status={user.isEmailVerified ? "VERIFIED" : "UNVERIFIED"}
        />
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
          value={
            user.lastLoginAt
              ? formatManagementDate(user.lastLoginAt)
              : "Never logged in"
          }
        />
        <Detail
          icon={ShieldCheck}
          label="Account status"
          value={user.status.toLowerCase()}
        />
        <Detail
          icon={RefreshCw}
          label="Last updated"
          value={formatManagementDate(user.updatedAt)}
        />
      </section>
    </div>
  );
}

function SessionCard({
  session,
  isDisabled,
  onRevoke,
}: {
  session: AdminUserSession;
  isDisabled: boolean;
  onRevoke: () => void;
}) {
  return (
    <article className="space-y-3 rounded-xl border border-brand-border bg-card p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <MonitorSmartphone
            size={16}
            aria-hidden="true"
            className="shrink-0 text-brand-text-muted"
          />
          <p
            className="truncate text-xs font-medium text-brand-text"
            title={session.userAgent ?? undefined}
          >
            {session.userAgent || "Unknown browser or device"}
          </p>
        </div>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={isDisabled}
          onClick={onRevoke}
        >
          Revoke
        </Button>
      </div>
      <div className="grid gap-2 text-[11px] text-brand-text-muted sm:grid-cols-2">
        <SessionDetail
          icon={CalendarDays}
          label="Created"
          value={formatSessionDate(session.createdAt)}
        />
        <SessionDetail
          icon={Clock3}
          label="Expires"
          value={formatSessionDate(session.expiresAt)}
        />
        <SessionDetail
          icon={RefreshCw}
          label="Last updated"
          value={formatSessionDate(session.updatedAt)}
        />
        {session.ipAddress && (
          <SessionDetail
            icon={Globe2}
            label="IP address"
            value={session.ipAddress}
          />
        )}
      </div>
    </article>
  );
}

function SessionDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <p className="flex min-w-0 items-start gap-1.5">
      <Icon size={13} aria-hidden="true" className="mt-0.5 shrink-0" />
      <span className="min-w-0 break-words">
        <span className="font-medium text-brand-text">{label}: </span>
        {value}
      </span>
    </p>
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
      <Icon
        size={16}
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-brand-text-muted"
      />
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-brand-text-muted">{label}</p>
        <p className="mt-0.5 break-words text-xs font-medium capitalize text-brand-text">
          {value}
        </p>
      </div>
    </div>
  );
}

function formatSessionDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
