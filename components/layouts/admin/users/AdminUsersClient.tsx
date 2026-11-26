"use client";

import { useEffect, useMemo, useState } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminConfirmDialog from "@/components/layouts/admin/shared/AdminConfirmDialog";
import AdminDataTable, {
  type AdminTableColumn,
} from "@/components/layouts/admin/shared/AdminDataTable";
import AdminExportButton, {
  type AdminExportMode,
} from "@/components/layouts/admin/shared/AdminExportButton";
import AdminFilterSelect from "@/components/layouts/admin/shared/AdminFilterSelect";
import AdminPageHeader from "@/components/layouts/admin/shared/AdminPageHeader";
import AdminStatusBadge from "@/components/layouts/admin/shared/AdminStatusBadge";
import AdminTableToolbar from "@/components/layouts/admin/shared/AdminTableToolbar";
import AdminUserAvatar from "@/components/layouts/admin/shared/AdminUserAvatar";
import UserActions from "./UserActions";
import UserDetailsSheet from "./UserDetailsSheet";
import UserEditorDialog from "./UserEditorDialog";
import UsersStats from "./UsersStats";
import { useAdminCreateUser } from "@/features/admin/hooks/use-admin-create-user";
import { useAdminTableState } from "@/features/admin/hooks/use-admin-table-state";
import { useAdminUpdateUser } from "@/features/admin/hooks/use-admin-update-user";
import { useAdminUpdateUserRole } from "@/features/admin/hooks/use-admin-update-user-role";
import { useAdminUpdateUserStatus } from "@/features/admin/hooks/use-admin-update-user-status";
import { useAdminUserStats } from "@/features/admin/hooks/use-admin-user-stats";
import { useAdminUsers } from "@/features/admin/hooks/use-admin-users";
import { useDebouncedValue } from "@/features/admin/hooks/use-debounced-value";
import { ADMIN_PAGE_SIZES } from "@/features/admin/types/management.types";
import type {
  AdminAssignableRole,
  AdminCreateUserInput,
  AdminUpdateUserInput,
  AdminUser,
  AdminUsersFilters,
  AdminUsersVariables,
} from "@/features/admin/types/users.types";
import type {
  UserRole,
  UserStatus,
} from "@/features/auth/types/auth.types";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  downloadCsv,
  formatManagementDate,
} from "@/features/admin/utils/management.utils";
import {
  getAdminDateRange,
  getAdminSortField,
} from "@/features/admin/utils/users.utils";
import {
  getGraphQLErrorMessage,
} from "@/lib/graphql/error";

type DateFilter = "ALL" | "30_DAYS" | "12_MONTHS";
type VerificationFilter = "ALL" | "VERIFIED" | "UNVERIFIED";
type UsersPageFilters = {
  search: string;
  role: UserRole | "ALL";
  status: UserStatus | "ALL";
  verification: VerificationFilter;
  registeredWithin: DateFilter;
  lastLoginWithin: DateFilter;
};
type UserEditorSubmission = AdminCreateUserInput | AdminUpdateUserInput;
type PendingUserAction =
  | { kind: "status"; user: AdminUser; status: UserStatus }
  | { kind: "role"; user: AdminUser }
  | null;

function isCurrentUserAccount(
  user: AdminUser,
  currentUserId: string | null,
) {
  return currentUserId !== null && currentUserId === user.id;
}

const initialFilters: UsersPageFilters = {
  search: "",
  role: "ALL",
  status: "ALL",
  verification: "ALL",
  registeredWithin: "ALL",
  lastLoginWithin: "ALL",
};

const initialVisibleColumns = [
  "identity",
  "role",
  "status",
  "verification",
  "createdAt",
  "lastLoginAt",
  "actions",
];

const emptyPagination = {
  page: 1,
  limit: ADMIN_PAGE_SIZES[0],
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrevious: false,
} as const;

function isUserRole(value: string): value is UserRole {
  return value === "STUDENT" || value === "INSTRUCTOR" || value === "ADMIN";
}

function isUserStatus(value: string): value is UserStatus {
  return value === "ACTIVE" || value === "INACTIVE" || value === "SUSPENDED";
}

function isDateFilter(value: string): value is DateFilter {
  return value === "ALL" || value === "30_DAYS" || value === "12_MONTHS";
}

function isVerificationFilter(value: string): value is VerificationFilter {
  return value === "ALL" || value === "VERIFIED" || value === "UNVERIFIED";
}

export default function AdminUsersClient() {
  const currentUserId = useAuthStore((state) => state.user?.id ?? null);
  const table = useAdminTableState();
  const { page: currentPage, setPage, clearSelection } = table;
  const [filters, setFilters] = useState(initialFilters);
  const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);
  const [detailsUser, setDetailsUser] = useState<AdminUser | null>(null);
  const [editorUser, setEditorUser] = useState<AdminUser | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingUserAction>(null);
  const [roleTarget, setRoleTarget] = useState<AdminAssignableRole>("STUDENT");

  const debouncedSearch = useDebouncedValue(filters.search.trim());
  const variables = useMemo<AdminUsersVariables>(() => {
    const filter: AdminUsersFilters = {};
    if (debouncedSearch) filter.search = debouncedSearch;
    if (filters.role !== "ALL") filter.role = filters.role;
    if (filters.status !== "ALL") filter.status = filters.status;
    if (filters.verification !== "ALL") {
      filter.isEmailVerified = filters.verification === "VERIFIED";
    }

    const createdRange = getAdminDateRange(filters.registeredWithin);
    if (createdRange.from) filter.createdFrom = createdRange.from;
    if (createdRange.to) filter.createdTo = createdRange.to;

    const lastLoginRange = getAdminDateRange(filters.lastLoginWithin);
    if (lastLoginRange.from) filter.lastLoginFrom = lastLoginRange.from;
    if (lastLoginRange.to) filter.lastLoginTo = lastLoginRange.to;

    const sortField = table.sorting
      ? getAdminSortField(table.sorting.column)
      : undefined;

    return {
      pagination: { page: table.page, limit: table.pageSize },
      ...(Object.keys(filter).length > 0 ? { filter } : {}),
      ...(sortField && table.sorting
        ? {
            sort: {
              field: sortField,
              direction:
                table.sorting.direction === "asc" ? "ASC" as const : "DESC" as const,
            },
          }
        : {}),
    };
  }, [
    debouncedSearch,
    filters.lastLoginWithin,
    filters.registeredWithin,
    filters.role,
    filters.status,
    filters.verification,
    table.page,
    table.pageSize,
    table.sorting,
  ]);
  const usersQuery = useAdminUsers(variables);
  const statsQuery = useAdminUserStats();
  const createUser = useAdminCreateUser();
  const updateUser = useAdminUpdateUser();
  const updateUserStatus = useAdminUpdateUserStatus();
  const updateUserRole = useAdminUpdateUserRole();
  const pageUsers = usersQuery.data?.items ?? [];
  const pagination = usersQuery.data?.meta ?? {
    ...emptyPagination,
    page: table.page,
    limit: table.pageSize,
  };
  const isStalePage =
    usersQuery.isPlaceholderData ||
    filters.search.trim() !== debouncedSearch;
  const isMutationPending =
    createUser.isPending ||
    updateUser.isPending ||
    updateUserStatus.isPending ||
    updateUserRole.isPending;
  const isTableInteractionDisabled =
    isStalePage || usersQuery.isFetching || isMutationPending;
  const usersTotalPages = usersQuery.data?.meta.totalPages;
  const isPlaceholderData = usersQuery.isPlaceholderData;

  useEffect(() => {
    if (usersTotalPages === undefined || isPlaceholderData) return;

    const nextPage =
      usersTotalPages === 0 ? 1 : Math.min(currentPage, usersTotalPages);
    if (nextPage !== currentPage) {
      clearSelection();
      setPage(nextPage);
    }
  }, [
    clearSelection,
    currentPage,
    isPlaceholderData,
    setPage,
    usersTotalPages,
  ]);

  const columns = useMemo<AdminTableColumn<AdminUser>[]>(() => [
    {
      id: "identity",
      header: "User",
      sortValue: (user) => user.name,
      cell: (user) => (
        <div className="flex min-w-48 items-center gap-3">
          <AdminUserAvatar name={user.name} avatar={user.avatar} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-brand-text">{user.name}</p>
            <p className="mt-0.5 truncate text-[11px] text-brand-text-muted">
              {user.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "role",
      header: "Role",
      sortValue: (user) => user.role,
      cell: (user) => (
        <span className="font-medium capitalize">{user.role.toLowerCase()}</span>
      ),
    },
    {
      id: "status",
      header: "Account status",
      sortValue: (user) => user.status,
      cell: (user) => <AdminStatusBadge status={user.status} />,
    },
    {
      id: "verification",
      header: "Email",
      sortValue: (user) => Number(user.isEmailVerified),
      cell: (user) => (
        <AdminStatusBadge
          status={user.isEmailVerified ? "VERIFIED" : "UNVERIFIED"}
        />
      ),
    },
    {
      id: "createdAt",
      header: "Registered",
      sortValue: (user) => user.createdAt,
      cell: (user) => (
        <span className="whitespace-nowrap text-brand-text-muted">
          {formatManagementDate(user.createdAt)}
        </span>
      ),
    },
    {
      id: "lastLoginAt",
      header: "Last login",
      sortValue: (user) => user.lastLoginAt ?? null,
      cell: (user) => (
        <span className="whitespace-nowrap text-brand-text-muted">
          {formatManagementDate(user.lastLoginAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      hideable: false,
      className: "w-14 text-right",
      cell: (user) => (
        <UserActions
          user={user}
          isCurrentUser={isCurrentUserAccount(user, currentUserId)}
          isDisabled={isMutationPending || isStalePage}
          onView={setDetailsUser}
          onEdit={(selected) => {
            setEditorUser(selected);
            setIsEditorOpen(true);
          }}
          onChangeRole={(selected) => {
            setRoleTarget(selected.role === "STUDENT" ? "INSTRUCTOR" : "STUDENT");
            setPendingAction({ kind: "role", user: selected });
          }}
          onSuspend={(selected) =>
            setPendingAction({
              kind: "status",
              user: selected,
              status: "SUSPENDED",
            })
          }
          onActivate={(selected) =>
            setPendingAction({
              kind: "status",
              user: selected,
              status: "ACTIVE",
            })
          }
        />
      ),
    },
  ], [currentUserId, isMutationPending, isStalePage]);

  const setFilter = <K extends keyof UsersPageFilters>(
    key: K,
    value: UsersPageFilters[K],
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
    table.setPage(1);
    table.clearSelection();
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    table.setPage(1);
    table.clearSelection();
  };

  const exportUsers = (mode: AdminExportMode) => {
    if (isStalePage) return;

    const records =
      mode === "selected"
        ? pageUsers.filter((user) => table.selectedIds.has(user.id))
        : mode === "current-page"
          ? pageUsers
          : [];

    if (records.length === 0) return;

    downloadCsv(
      `coursify-users-${mode}`,
      [
        "Name",
        "Email",
        "Role",
        "Status",
        "Email verified",
        "Registered",
        "Last login",
      ],
      records.map((user) => [
        user.name,
        user.email,
        user.role,
        user.status,
        user.isEmailVerified ? "Yes" : "No",
        user.createdAt,
        user.lastLoginAt ?? "",
      ]),
    );
    toast.success(`Exported ${records.length} user records.`);
  };

  const saveUser = async (values: UserEditorSubmission) => {
    try {
      if ("password" in values) {
        await createUser.mutateAsync(values);
      } else {
        await updateUser.mutateAsync(values);
      }
      table.clearSelection();
      setIsEditorOpen(false);
      setEditorUser(null);
      return true;
    } catch {
      return false;
    }
  };

  const confirmUserAction = () => {
    if (
      !pendingAction ||
      isCurrentUserAccount(pendingAction.user, currentUserId)
    ) return;

    if (pendingAction.kind === "status") {
      table.clearSelection();
      updateUserStatus.mutate({
        userId: pendingAction.user.id,
        status: pendingAction.status,
      });
      return;
    }

    if (roleTarget === pendingAction.user.role) return;
    table.clearSelection();
    updateUserRole.mutate({
      userId: pendingAction.user.id,
      role: roleTarget,
    });
  };

  const changePage = (page: number) => {
    table.clearSelection();
    table.setPage(page);
  };

  const changePageSize = (pageSize: number) => {
    if (!ADMIN_PAGE_SIZES.some((size) => size === pageSize)) return;
    table.clearSelection();
    table.setPageSize(pageSize);
  };

  const toggleSorting = (column: string) => {
    table.clearSelection();
    table.toggleSorting(column);
  };

  const filtersActive =
    Boolean(filters.search.trim()) ||
    filters.role !== "ALL" ||
    filters.status !== "ALL" ||
    filters.verification !== "ALL" ||
    filters.registeredWithin !== "ALL" ||
    filters.lastLoginWithin !== "ALL";
  const confirmation =
    pendingAction?.kind === "status"
      ? {
          title:
            pendingAction.status === "SUSPENDED"
              ? "Suspend this account?"
              : "Activate this account?",
          description:
            pendingAction.status === "SUSPENDED"
              ? `Suspending ${pendingAction.user.name} will prevent the account from signing in.`
              : `This will restore sign-in access for ${pendingAction.user.name}.`,
          confirmLabel:
            pendingAction.status === "SUSPENDED"
              ? "Suspend account"
              : "Activate account",
          destructive: pendingAction.status === "SUSPENDED",
        }
      : pendingAction?.kind === "role"
        ? {
            title: "Change this user's role?",
            description: `Choose a new role for ${pendingAction.user.name}. Role changes can affect this user's access.`,
            confirmLabel: "Change role",
            destructive: false,
          }
        : null;

  return (
    <section className="mx-auto w-full max-w-450 space-y-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <AdminPageHeader
        title="Users"
        description="Manage platform accounts and access permissions."
        actions={
          <>
            <AdminExportButton
              selectedCount={
                isStalePage
                  ? 0
                  : pageUsers.filter((user) =>
                      table.selectedIds.has(user.id),
                    ).length
              }
              filteredCount={0}
              currentPageCount={isStalePage ? 0 : pageUsers.length}
              isDisabled={isStalePage || usersQuery.isFetching}
              onExport={exportUsers}
            />
            <Button
              type="button"
              onClick={() => {
                setEditorUser(null);
                setIsEditorOpen(true);
              }}
              className="gap-2"
            >
              <Plus size={16} aria-hidden="true" />
              Add user
            </Button>
          </>
        }
      />

      <UsersStats
        stats={statsQuery.data}
        isPending={statsQuery.isPending}
        error={
          statsQuery.isError
            ? getGraphQLErrorMessage(statsQuery.error)
            : undefined
        }
        onRetry={() => void statsQuery.refetch()}
      />

      <AdminTableToolbar
        search={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search by name or email..."
        searchLabel="Search users"
        onClear={clearFilters}
        filtersActive={filtersActive}
        actions={
          usersQuery.isFetching ? (
            <span
              role="status"
              className="inline-flex items-center gap-2 text-xs text-brand-text-muted"
            >
              <LoaderCircle
                size={14}
                aria-hidden="true"
                className="animate-spin motion-reduce:animate-none"
              />
              Updating users
            </span>
          ) : usersQuery.isError ? (
            <div className="flex items-center gap-2">
              <span role="alert" className="text-xs text-destructive">
                {getGraphQLErrorMessage(usersQuery.error)}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void usersQuery.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : null
        }
        filters={
          <>
            <AdminFilterSelect
              label="Filter by role"
              value={filters.role}
              options={[
                { value: "ALL", label: "All roles" },
                { value: "STUDENT", label: "Students" },
                { value: "INSTRUCTOR", label: "Instructors" },
                { value: "ADMIN", label: "Admins" },
              ]}
              onChange={(value) =>
                setFilter("role", isUserRole(value) ? value : "ALL")
              }
            />
            <AdminFilterSelect
              label="Filter by account status"
              value={filters.status}
              options={[
                { value: "ALL", label: "All statuses" },
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
                { value: "SUSPENDED", label: "Suspended" },
              ]}
              onChange={(value) =>
                setFilter("status", isUserStatus(value) ? value : "ALL")
              }
            />
            <AdminFilterSelect
              label="Filter by email verification"
              value={filters.verification}
              options={[
                { value: "ALL", label: "Any verification" },
                { value: "VERIFIED", label: "Verified" },
                { value: "UNVERIFIED", label: "Unverified" },
              ]}
              onChange={(value) =>
                setFilter(
                  "verification",
                  isVerificationFilter(value) ? value : "ALL",
                )
              }
            />
            <AdminFilterSelect
              label="Filter by registration date"
              value={filters.registeredWithin}
              options={[
                { value: "ALL", label: "Any registration date" },
                { value: "30_DAYS", label: "Registered: last 30 days" },
                { value: "12_MONTHS", label: "Registered: last 12 months" },
              ]}
              onChange={(value) =>
                setFilter(
                  "registeredWithin",
                  isDateFilter(value) ? value : "ALL",
                )
              }
            />
            <AdminFilterSelect
              label="Filter by last login date"
              value={filters.lastLoginWithin}
              options={[
                { value: "ALL", label: "Any last login" },
                { value: "30_DAYS", label: "Login: last 30 days" },
                { value: "12_MONTHS", label: "Login: last 12 months" },
              ]}
              onChange={(value) =>
                setFilter(
                  "lastLoginWithin",
                  isDateFilter(value) ? value : "ALL",
                )
              }
            />
          </>
        }
      />

      <AdminDataTable
        rows={pageUsers}
        columns={columns}
        getRowId={(user) => user.id}
        pagination={pagination}
        onPageChange={changePage}
        onPageSizeChange={changePageSize}
        sorting={table.sorting}
        onSort={toggleSorting}
        selectedIds={table.selectedIds}
        onToggleRows={table.toggleRows}
        visibleColumnIds={visibleColumns}
        onVisibleColumnsChange={setVisibleColumns}
        isLoading={usersQuery.isPending && !usersQuery.data}
        isPlaceholderData={isStalePage}
        isSelectionDisabled={isTableInteractionDisabled}
        isPaginationDisabled={isTableInteractionDisabled || !usersQuery.data}
        error={
          usersQuery.isError && !usersQuery.data
            ? getGraphQLErrorMessage(usersQuery.error)
            : null
        }
        emptyTitle={
          filtersActive
            ? "No users match these filters"
            : "No users are available"
        }
        emptyDescription="Try a different search or clear one or more filters."
      />

      <UserDetailsSheet
        key={detailsUser?.id ?? "none"}
        user={detailsUser}
        isCurrentUser={
          detailsUser
            ? isCurrentUserAccount(detailsUser, currentUserId)
            : false
        }
        onOpenChange={(open) => {
          if (!open) setDetailsUser(null);
        }}
      />
      <UserEditorDialog
        open={isEditorOpen}
        user={editorUser}
        isCurrentUser={
          editorUser
            ? isCurrentUserAccount(editorUser, currentUserId)
            : false
        }
        isPending={createUser.isPending || updateUser.isPending}
        onOpenChange={(open) => {
          setIsEditorOpen(open);
          if (!open) setEditorUser(null);
        }}
        onSave={saveUser}
      />
      <AdminConfirmDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
        title={confirmation?.title ?? ""}
        description={confirmation?.description ?? ""}
        confirmLabel={confirmation?.confirmLabel ?? "Confirm"}
        isDestructive={confirmation?.destructive}
        isDisabled={
          isMutationPending ||
          (pendingAction?.kind === "role" &&
            pendingAction.user.role === roleTarget)
        }
        onConfirm={confirmUserAction}
      >
        {pendingAction?.kind === "role" && (
          <label className="block space-y-1.5 text-xs font-medium text-brand-text">
            New role
            <Select
              value={roleTarget}
              onValueChange={(value) => {
                if (value === "STUDENT" || value === "INSTRUCTOR") {
                  setRoleTarget(value);
                }
              }}
            >
              <SelectTrigger className="h-10 w-full rounded-lg border-brand-border bg-background px-3 text-xs text-brand-text">
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                align="start"
                className="w-(--anchor-width) rounded-xl border-brand-border bg-popover p-1.5 text-popover-foreground shadow-xl"
              >
                <SelectItem
                  value="STUDENT"
                  className="rounded-lg py-2 text-xs font-medium"
                >
                  Student
                </SelectItem>
                <SelectItem
                  value="INSTRUCTOR"
                  className="rounded-lg py-2 text-xs font-medium"
                >
                  Instructor
                </SelectItem>
              </SelectContent>
            </Select>
          </label>
        )}
      </AdminConfirmDialog>
    </section>
  );
}
