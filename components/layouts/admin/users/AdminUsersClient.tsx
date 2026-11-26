"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Plus,
  ShieldAlert,
  UserCheck,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import AdminConfirmDialog from "@/components/layouts/admin/shared/AdminConfirmDialog";
import AdminDataTable, {
  type AdminTableColumn,
} from "@/components/layouts/admin/shared/AdminDataTable";
import AdminExportButton, {
  type AdminExportMode,
} from "@/components/layouts/admin/shared/AdminExportButton";
import AdminFilterSelect from "@/components/layouts/admin/shared/AdminFilterSelect";
import AdminPageHeader from "@/components/layouts/admin/shared/AdminPageHeader";
import AdminStatsGrid from "@/components/layouts/admin/shared/AdminStatsGrid";
import AdminStatusBadge from "@/components/layouts/admin/shared/AdminStatusBadge";
import AdminTableToolbar from "@/components/layouts/admin/shared/AdminTableToolbar";
import AdminUserAvatar from "@/components/layouts/admin/shared/AdminUserAvatar";
import UserActions from "./UserActions";
import UserDetailsSheet from "./UserDetailsSheet";
import UserEditorDialog from "./UserEditorDialog";
import { useAdminTableState } from "@/features/admin/hooks/use-admin-table-state";
import { useAdminManagementData } from "@/features/admin/hooks/use-admin-management-data";
import { useDebouncedValue } from "@/features/admin/hooks/use-debounced-value";
import {
  createAdminDemoUser,
  updateAdminDemoUser,
} from "@/features/admin/store/admin-demo.store";
import {
  DEMO_REFERENCE_TIMESTAMP,
  downloadCsv,
  formatManagementDate,
  paginateRecords,
  sortRecords,
} from "@/features/admin/utils/management.utils";
import type {
  AdminUser,
  CreateUserInput,
  UsersFilters,
} from "@/features/admin/types/management.types";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { User } from "@/features/auth/types/auth.types";

function matchesCurrentUser(user: AdminUser, currentUser: User | null) {
  return Boolean(
    currentUser &&
      (currentUser.id === user.id ||
        currentUser.email.trim().toLowerCase() === user.email.toLowerCase()),
  );
}

const initialFilters: UsersFilters = {
  search: "",
  role: "ALL",
  status: "ALL",
  verification: "ALL",
  registeredWithin: "ALL",
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

type PendingUserAction = {
  user: AdminUser;
  action: "suspend" | "activate" | "archive";
} | {
  user: AdminUser;
  action: "edit-permissions";
  values: CreateUserInput;
} | null;

export default function AdminUsersClient() {
  const { users } = useAdminManagementData();
  const currentUser = useAuthStore((state) => state.user);
  const table = useAdminTableState();
  const { setPage } = table;
  const [filters, setFilters] = useState(initialFilters);
  const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);
  const [detailsUser, setDetailsUser] = useState<AdminUser | null>(null);
  const [editorUser, setEditorUser] = useState<AdminUser | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingUserAction>(null);
  const debouncedSearch = useDebouncedValue(filters.search.trim());

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.role, filters.status, filters.verification, filters.registeredWithin, setPage]);

  const filteredUsers = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    const cutoff =
      filters.registeredWithin === "30_DAYS"
        ? DEMO_REFERENCE_TIMESTAMP - 30 * 24 * 60 * 60 * 1000
        : filters.registeredWithin === "12_MONTHS"
          ? DEMO_REFERENCE_TIMESTAMP - 365 * 24 * 60 * 60 * 1000
          : null;

    return users.filter((user) => {
      if (query && !`${user.name} ${user.email}`.toLowerCase().includes(query)) return false;
      if (filters.role !== "ALL" && user.role !== filters.role) return false;
      if (filters.status !== "ALL" && user.status !== filters.status) return false;
      if (
        filters.verification !== "ALL" &&
        user.isEmailVerified !== (filters.verification === "VERIFIED")
      ) return false;
      if (cutoff && new Date(user.createdAt).getTime() < cutoff) return false;
      return true;
    });
  }, [debouncedSearch, filters.registeredWithin, filters.role, filters.status, filters.verification, users]);

  const sortedUsers = useMemo(
    () =>
      sortRecords(filteredUsers, table.sorting, (user, column) => {
        switch (column) {
          case "identity": return user.name;
          case "role": return user.role;
          case "status": return user.status;
          case "verification": return Number(user.isEmailVerified);
          case "createdAt": return user.createdAt;
          case "lastLoginAt": return user.lastLoginAt ?? null;
          default: return null;
        }
      }),
    [filteredUsers, table.sorting],
  );
  const page = paginateRecords(sortedUsers, table.page, table.pageSize);

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
            <p className="mt-0.5 truncate text-[11px] text-brand-text-muted">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "role",
      header: "Role",
      sortValue: (user) => user.role,
      cell: (user) => <span className="font-medium capitalize">{user.role.toLowerCase()}</span>,
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
      cell: (user) => <AdminStatusBadge status={user.isEmailVerified ? "VERIFIED" : "UNVERIFIED"} />,
    },
    {
      id: "createdAt",
      header: "Registered",
      sortValue: (user) => user.createdAt,
      cell: (user) => <span className="whitespace-nowrap text-brand-text-muted">{formatManagementDate(user.createdAt)}</span>,
    },
    {
      id: "lastLoginAt",
      header: "Last login",
      sortValue: (user) => user.lastLoginAt ?? null,
      cell: (user) => <span className="whitespace-nowrap text-brand-text-muted">{formatManagementDate(user.lastLoginAt)}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      hideable: false,
      className: "w-14 text-right",
      cell: (user) => (
        <UserActions
          user={user}
          isCurrentUser={matchesCurrentUser(user, currentUser)}
          onView={setDetailsUser}
          onEdit={(selected) => {
            setEditorUser(selected);
            setIsEditorOpen(true);
          }}
          onChangeRole={(selected) => {
            setEditorUser(selected);
            setIsEditorOpen(true);
          }}
          onSuspend={(selected) => setPendingAction({ user: selected, action: "suspend" })}
          onActivate={(selected) => setPendingAction({ user: selected, action: "activate" })}
          onArchive={(selected) => setPendingAction({ user: selected, action: "archive" })}
        />
      ),
    },
  ], [currentUser]);

  const setFilter = <K extends keyof UsersFilters>(key: K, value: UsersFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
    table.setPage(1);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    table.setPage(1);
    table.clearSelection();
  };

  const exportUsers = (mode: AdminExportMode) => {
    const records =
      mode === "selected"
        ? users.filter((user) => table.selectedIds.has(user.id))
        : mode === "filtered"
          ? filteredUsers
          : users;

    downloadCsv(
      `coursify-users-${mode}`,
      ["Name", "Email", "Role", "Status", "Email verified", "Registered", "Last login"],
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
    toast.success(`Exported ${records.length} demo user records. Not saved to backend.`);
  };

  const saveUser = (values: CreateUserInput) => {
    const duplicateEmail = users.some(
      (user) =>
        user.email.toLowerCase() === values.email.toLowerCase() &&
        user.id !== editorUser?.id,
    );
    if (duplicateEmail) {
      toast.error("That email already exists in the demo dataset.");
      return false;
    }

    if (editorUser) {
      if (
        matchesCurrentUser(editorUser, currentUser) &&
        (editorUser.role !== values.role || editorUser.status !== values.status)
      ) {
        toast.error("Your own role and account status cannot be changed.");
        return false;
      }
      if (editorUser.role !== values.role || editorUser.status !== values.status) {
        setPendingAction({ user: editorUser, action: "edit-permissions", values });
        return false;
      }
      if (!updateAdminDemoUser(editorUser.id, values)) {
        toast.error("This demo user is no longer available.");
        return false;
      }
      toast.success("User updated in the demo only; changes are not saved to backend.");
    } else {
      createAdminDemoUser(values);
      toast.success("Demo user added; no account or email was created.");
    }
    setIsEditorOpen(false);
    setEditorUser(null);
    return true;
  };

  const confirmUserAction = () => {
    if (!pendingAction) return;
    if (matchesCurrentUser(pendingAction.user, currentUser)) {
      toast.error("You cannot change your own administrator access.");
      return;
    }

    if (pendingAction.action === "edit-permissions") {
      if (!updateAdminDemoUser(pendingAction.user.id, pendingAction.values)) {
        toast.error("This demo user is no longer available.");
        setPendingAction(null);
        return;
      }
      toast.success("Role or account status updated in the demo only.");
      setIsEditorOpen(false);
      setEditorUser(null);
      setPendingAction(null);
      return;
    }

    const status =
      pendingAction.action === "suspend"
        ? "SUSPENDED"
        : pendingAction.action === "activate"
          ? "ACTIVE"
          : "INACTIVE";
    updateAdminDemoUser(pendingAction.user.id, { status });
    toast.success(`${pendingAction.user.name}'s account was updated in the demo only.`);
    setPendingAction(null);
  };

  const stats = [
    {
      label: "Total users",
      value: users.length.toLocaleString(),
      description: "Across all account roles",
      icon: UsersRound,
      tone: "primary" as const,
    },
    {
      label: "Active users",
      value: users.filter((user) => user.status === "ACTIVE").length.toLocaleString(),
      description: "Accounts currently active",
      icon: UserCheck,
      tone: "green" as const,
    },
    {
      label: "Suspended users",
      value: users.filter((user) => user.status === "SUSPENDED").length.toLocaleString(),
      description: "Access currently suspended",
      icon: ShieldAlert,
      tone: "red" as const,
    },
    {
      label: "Verified users",
      value: users.filter((user) => user.isEmailVerified).length.toLocaleString(),
      description: "Email address verified",
      icon: BadgeCheck,
      tone: "violet" as const,
    },
  ];

  const filtersActive =
    Boolean(filters.search.trim()) ||
    filters.role !== "ALL" ||
    filters.status !== "ALL" ||
    filters.verification !== "ALL" ||
    filters.registeredWithin !== "ALL";

  const confirmation = pendingAction
    ? pendingAction.action === "edit-permissions"
      ? {
          title: "Confirm account access changes?",
          description: `This changes the role or account status for ${pendingAction.user.name} in the local demo only.`,
          confirmLabel: "Confirm changes",
          destructive: pendingAction.values.status === "SUSPENDED",
        }
      : {
        suspend: {
          title: "Suspend this account?",
          description: `This demo action marks ${pendingAction.user.name}'s account as suspended.`,
          confirmLabel: "Suspend account",
          destructive: true,
        },
        activate: {
          title: "Activate this account?",
          description: `This demo action marks ${pendingAction.user.name}'s account as active.`,
          confirmLabel: "Activate account",
          destructive: false,
        },
        archive: {
          title: "Archive this account?",
          description: `This demo action marks ${pendingAction.user.name}'s account inactive. It does not delete backend data.`,
          confirmLabel: "Archive account",
          destructive: true,
        },
      }[pendingAction.action]
    : null;

  return (
    <section className="mx-auto w-full max-w-450 space-y-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <AdminPageHeader
        title="Users"
        description="Manage platform accounts and access permissions."
        actions={
          <>
            <AdminExportButton
              selectedCount={table.selectedIds.size}
              filteredCount={filteredUsers.length}
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

      <AdminStatsGrid stats={stats} />

      <AdminTableToolbar
        search={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search by name or email..."
        searchLabel="Search users"
        onClear={clearFilters}
        filtersActive={filtersActive}
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
              onChange={(value) => setFilter("role", value as UsersFilters["role"])}
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
              onChange={(value) => setFilter("status", value as UsersFilters["status"])}
            />
            <AdminFilterSelect
              label="Filter by email verification"
              value={filters.verification}
              options={[
                { value: "ALL", label: "Any verification" },
                { value: "VERIFIED", label: "Verified" },
                { value: "UNVERIFIED", label: "Unverified" },
              ]}
              onChange={(value) => setFilter("verification", value as UsersFilters["verification"])}
            />
            <AdminFilterSelect
              label="Filter by registration date"
              value={filters.registeredWithin}
              options={[
                { value: "ALL", label: "Any date" },
                { value: "30_DAYS", label: "Last 30 days" },
                { value: "12_MONTHS", label: "Last 12 months" },
              ]}
              onChange={(value) => setFilter("registeredWithin", value as UsersFilters["registeredWithin"])}
            />
          </>
        }
      />

      <AdminDataTable
        rows={page.items}
        columns={columns}
        getRowId={(user) => user.id}
        pagination={page.meta}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
        sorting={table.sorting}
        onSort={table.toggleSorting}
        selectedIds={table.selectedIds}
        onToggleRows={table.toggleRows}
        visibleColumnIds={visibleColumns}
        onVisibleColumnsChange={setVisibleColumns}
        emptyTitle="No users match these filters"
        emptyDescription="Try a different search or clear one or more filters."
      />

      <UserDetailsSheet
        key={detailsUser?.id ?? "none"}
        user={detailsUser}
        onOpenChange={(open) => {
          if (!open) setDetailsUser(null);
        }}
      />
      <UserEditorDialog
        open={isEditorOpen}
        user={editorUser}
        isCurrentUser={editorUser ? matchesCurrentUser(editorUser, currentUser) : false}
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
        onConfirm={confirmUserAction}
      />
    </section>
  );
}
