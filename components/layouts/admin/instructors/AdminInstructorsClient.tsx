"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCheck, Clock3, Star, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminConfirmDialog from "@/components/layouts/admin/shared/AdminConfirmDialog";
import AdminDataTable, {
  type AdminTableColumn,
} from "@/components/layouts/admin/shared/AdminDataTable";
import AdminDialog from "@/components/layouts/admin/shared/AdminDialog";
import AdminExportButton, {
  type AdminExportMode,
} from "@/components/layouts/admin/shared/AdminExportButton";
import AdminFilterSelect from "@/components/layouts/admin/shared/AdminFilterSelect";
import AdminPageHeader from "@/components/layouts/admin/shared/AdminPageHeader";
import AdminStatsGrid from "@/components/layouts/admin/shared/AdminStatsGrid";
import AdminStatusBadge from "@/components/layouts/admin/shared/AdminStatusBadge";
import AdminTableToolbar from "@/components/layouts/admin/shared/AdminTableToolbar";
import AdminUserAvatar from "@/components/layouts/admin/shared/AdminUserAvatar";
import InstructorActions from "./InstructorActions";
import InstructorDetailsSheet, {
  type InstructorDetailsTab,
} from "./InstructorDetailsSheet";
import { useAdminManagementData } from "@/features/admin/hooks/use-admin-management-data";
import { useAdminTableState } from "@/features/admin/hooks/use-admin-table-state";
import { useDebouncedValue } from "@/features/admin/hooks/use-debounced-value";
import { updateAdminDemoInstructorApproval } from "@/features/admin/store/admin-demo.store";
import type {
  AdminInstructor,
  InstructorsFilters,
} from "@/features/admin/types/management.types";
import { downloadCsv, paginateRecords, sortRecords } from "@/features/admin/utils/management.utils";

const initialFilters: InstructorsFilters = {
  search: "",
  approvalStatus: "ALL",
  accountStatus: "ALL",
  specialization: "ALL",
  rating: "ALL",
};
const initialVisibleColumns = [
  "identity",
  "specialization",
  "courses",
  "students",
  "rating",
  "earnings",
  "approval",
  "account",
  "actions",
];

type ApprovalAction = {
  instructor: AdminInstructor;
  action: "approve" | "reject";
} | null;

function Rating({ instructor }: { instructor: AdminInstructor }) {
  if (instructor.averageRating === null || instructor.reviewCount === 0) {
    return <span className="whitespace-nowrap text-[11px] text-brand-text-muted">Not rated</span>;
  }
  const filledStars = Math.round(instructor.averageRating);

  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap"
      aria-label={`${instructor.averageRating} out of 5 from ${instructor.reviewCount} reviews`}
    >
      <span className="inline-flex text-amber-500" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            size={12}
            className={index < filledStars ? "fill-current" : "text-brand-border"}
          />
        ))}
      </span>
      <span className="font-semibold tabular-nums text-brand-text">
        {instructor.averageRating.toFixed(1)}
      </span>
      <span className="text-[10px] text-brand-text-muted">({instructor.reviewCount})</span>
    </span>
  );
}

export default function AdminInstructorsClient() {
  const { users, instructors: instructorProfiles } = useAdminManagementData();
  const table = useAdminTableState();
  const { setPage } = table;
  const [filters, setFilters] = useState(initialFilters);
  const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);
  const [detailsInstructor, setDetailsInstructor] = useState<AdminInstructor | null>(null);
  const [detailsTab, setDetailsTab] = useState<InstructorDetailsTab>("overview");
  const [approvalAction, setApprovalAction] = useState<ApprovalAction>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionError, setRejectionError] = useState("");
  const debouncedSearch = useDebouncedValue(filters.search.trim());

  const instructors = useMemo(() => {
    const usersById = new Map(users.map((user) => [user.id, user]));
    return instructorProfiles.flatMap((profile): AdminInstructor[] => {
      const user = usersById.get(profile.userId);
      if (!user || user.role !== "INSTRUCTOR") return [];
      return [{ ...user, ...profile }];
    });
  }, [instructorProfiles, users]);

  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    filters.approvalStatus,
    filters.accountStatus,
    filters.specialization,
    filters.rating,
    setPage,
  ]);

  const filteredInstructors = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    return instructors.filter((instructor) => {
      if (query && !`${instructor.name} ${instructor.email}`.toLowerCase().includes(query)) return false;
      if (filters.approvalStatus !== "ALL" && instructor.approvalStatus !== filters.approvalStatus) return false;
      if (filters.accountStatus !== "ALL" && instructor.status !== filters.accountStatus) return false;
      if (filters.specialization !== "ALL" && instructor.specialization !== filters.specialization) return false;
      if (filters.rating === "RATED" && instructor.averageRating === null) return false;
      if (filters.rating === "UNRATED" && instructor.averageRating !== null) return false;
      if (filters.rating === "4_PLUS" && (instructor.averageRating === null || instructor.averageRating < 4)) return false;
      return true;
    });
  }, [
    debouncedSearch,
    filters.accountStatus,
    filters.approvalStatus,
    filters.rating,
    filters.specialization,
    instructors,
  ]);

  const sortedInstructors = useMemo(
    () =>
      sortRecords(filteredInstructors, table.sorting, (instructor, column) => {
        switch (column) {
          case "identity": return instructor.name;
          case "specialization": return instructor.specialization;
          case "courses": return instructor.courses.length;
          case "students": return instructor.studentsTaught;
          case "rating": return instructor.averageRating;
          case "earnings": return instructor.totalEarnings;
          case "approval": return instructor.approvalStatus;
          case "account": return instructor.status;
          default: return null;
        }
      }),
    [filteredInstructors, table.sorting],
  );
  const page = paginateRecords(sortedInstructors, table.page, table.pageSize);

  const columns = useMemo<AdminTableColumn<AdminInstructor>[]>(() => [
    {
      id: "identity",
      header: "Instructor",
      sortValue: (instructor) => instructor.name,
      cell: (instructor) => (
        <div className="flex min-w-48 items-center gap-3">
          <AdminUserAvatar name={instructor.name} avatar={instructor.avatar} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-brand-text">{instructor.name}</p>
            <p className="mt-0.5 truncate text-[11px] text-brand-text-muted">{instructor.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "specialization",
      header: "Specialization",
      sortValue: (instructor) => instructor.specialization,
      cell: (instructor) => <span className="whitespace-nowrap text-brand-text-muted">{instructor.specialization}</span>,
    },
    {
      id: "courses",
      header: "Courses",
      sortValue: (instructor) => instructor.courses.length,
      cell: (instructor) => <span className="font-semibold tabular-nums">{instructor.courses.length}</span>,
    },
    {
      id: "students",
      header: "Students taught",
      sortValue: (instructor) => instructor.studentsTaught,
      cell: (instructor) => <span className="font-semibold tabular-nums">{instructor.studentsTaught.toLocaleString()}</span>,
    },
    {
      id: "rating",
      header: "Rating",
      sortValue: (instructor) => instructor.averageRating,
      cell: (instructor) => <Rating instructor={instructor} />,
    },
    {
      id: "earnings",
      header: "Earnings",
      sortValue: (instructor) => instructor.totalEarnings,
      cell: (instructor) => (
        <span className="whitespace-nowrap text-[11px] text-brand-text-muted">
          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(instructor.totalEarnings)}
          <span className="ml-1 text-[9px]">(demo)</span>
        </span>
      ),
    },
    {
      id: "approval",
      header: "Approval",
      sortValue: (instructor) => instructor.approvalStatus,
      cell: (instructor) => <AdminStatusBadge status={instructor.approvalStatus} />,
    },
    {
      id: "account",
      header: "Account",
      sortValue: (instructor) => instructor.status,
      cell: (instructor) => <AdminStatusBadge status={instructor.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      hideable: false,
      className: "w-14 text-right",
      cell: (instructor) => (
        <InstructorActions
          instructor={instructor}
          onView={(selected, tab) => {
            setDetailsTab(tab);
            setDetailsInstructor(selected);
          }}
          onApprove={(selected) => setApprovalAction({ instructor: selected, action: "approve" })}
          onReject={(selected) => {
            setRejectionReason("");
            setRejectionError("");
            setApprovalAction({ instructor: selected, action: "reject" });
          }}
        />
      ),
    },
  ], []);

  const setFilter = <K extends keyof InstructorsFilters>(
    key: K,
    value: InstructorsFilters[K],
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
    table.setPage(1);
  };
  const clearFilters = () => {
    setFilters(initialFilters);
    table.setPage(1);
    table.clearSelection();
  };

  const exportInstructors = (mode: AdminExportMode) => {
    const records =
      mode === "selected"
        ? instructors.filter((instructor) => table.selectedIds.has(instructor.id))
        : mode === "filtered"
          ? filteredInstructors
          : instructors;
    downloadCsv(
      `coursify-instructors-${mode}`,
      ["Name", "Email", "Specialization", "Courses", "Students taught", "Average rating", "Reviews", "Demo earnings", "Approval status", "Account status"],
      records.map((instructor) => [
        instructor.name,
        instructor.email,
        instructor.specialization,
        instructor.courses.length,
        instructor.studentsTaught,
        instructor.averageRating ?? "",
        instructor.reviewCount,
        instructor.totalEarnings,
        instructor.approvalStatus,
        instructor.status,
      ]),
    );
    toast.success(`Exported ${records.length} demo instructor records. Not saved to backend.`);
  };

  const applyApproval = () => {
    if (!approvalAction || approvalAction.action !== "approve") return;
    updateAdminDemoInstructorApproval(approvalAction.instructor.userId, "APPROVED");
    toast.success(`${approvalAction.instructor.name} approved in the demo only.`);
    setApprovalAction(null);
  };

  const rejectApplication = () => {
    const reason = rejectionReason.trim();
    if (!approvalAction || approvalAction.action !== "reject") return;
    if (reason.length < 5) {
      setRejectionError("Enter a rejection reason with at least five characters.");
      return;
    }
    updateAdminDemoInstructorApproval(
      approvalAction.instructor.userId,
      "REJECTED",
      reason,
    );
    toast.success("Application rejected in the demo only; no message was sent.");
    setApprovalAction(null);
    setRejectionReason("");
    setRejectionError("");
  };

  const specializations = [...new Set(instructors.map((item) => item.specialization))].sort();
  const ratedInstructors = instructors.filter((item) => item.averageRating !== null);
  const averageRating =
    ratedInstructors.length > 0
      ? (
          ratedInstructors.reduce((total, item) => total + (item.averageRating ?? 0), 0) /
          ratedInstructors.length
        ).toFixed(1)
      : "—";
  const stats = [
    {
      label: "Total instructors",
      value: instructors.length.toLocaleString(),
      description: "Instructor accounts in the demo",
      icon: UsersRound,
      tone: "primary" as const,
    },
    {
      label: "Approved instructors",
      value: instructors.filter((item) => item.approvalStatus === "APPROVED").length.toLocaleString(),
      description: "Applications approved",
      icon: CheckCheck,
      tone: "green" as const,
    },
    {
      label: "Pending applications",
      value: instructors.filter((item) => item.approvalStatus === "PENDING").length.toLocaleString(),
      description: "Waiting for review",
      icon: Clock3,
      tone: "amber" as const,
    },
    {
      label: "Average rating",
      value: averageRating,
      description: "Rated instructors only",
      icon: Star,
      tone: "violet" as const,
    },
  ];

  const filtersActive =
    Boolean(filters.search.trim()) ||
    filters.approvalStatus !== "ALL" ||
    filters.accountStatus !== "ALL" ||
    filters.specialization !== "ALL" ||
    filters.rating !== "ALL";
  const isRejecting = approvalAction?.action === "reject";
  return (
    <section className="mx-auto w-full max-w-450 space-y-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <AdminPageHeader
        title="Instructors"
        description="Manage educators and monitor teaching performance."
        actions={
          <AdminExportButton
            selectedCount={table.selectedIds.size}
            filteredCount={filteredInstructors.length}
            onExport={exportInstructors}
          />
        }
      />

      <AdminStatsGrid stats={stats} />

      <AdminTableToolbar
        search={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search by name or email..."
        searchLabel="Search instructors"
        onClear={clearFilters}
        filtersActive={filtersActive}
        filters={
          <>
            <AdminFilterSelect
              label="Filter by approval status"
              value={filters.approvalStatus}
              options={[
                { value: "ALL", label: "All approval states" },
                { value: "PENDING", label: "Pending" },
                { value: "APPROVED", label: "Approved" },
                { value: "REJECTED", label: "Rejected" },
              ]}
              onChange={(value) =>
                value === "ALL" || value === "PENDING" || value === "APPROVED" || value === "REJECTED"
                  ? setFilter("approvalStatus", value)
                  : undefined
              }
            />
            <AdminFilterSelect
              label="Filter by account status"
              value={filters.accountStatus}
              options={[
                { value: "ALL", label: "All account states" },
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
                { value: "SUSPENDED", label: "Suspended" },
              ]}
              onChange={(value) =>
                value === "ALL" || value === "ACTIVE" || value === "INACTIVE" || value === "SUSPENDED"
                  ? setFilter("accountStatus", value)
                  : undefined
              }
            />
            <AdminFilterSelect
              label="Filter by specialization"
              value={filters.specialization}
              options={[
                { value: "ALL", label: "All specializations" },
                ...specializations.map((specialization) => ({ value: specialization, label: specialization })),
              ]}
              onChange={(value) => setFilter("specialization", value)}
            />
            <AdminFilterSelect
              label="Filter by rating"
              value={filters.rating}
              options={[
                { value: "ALL", label: "Any rating" },
                { value: "4_PLUS", label: "4 stars and above" },
                { value: "RATED", label: "Rated" },
                { value: "UNRATED", label: "Not rated" },
              ]}
              onChange={(value) =>
                value === "ALL" || value === "4_PLUS" || value === "RATED" || value === "UNRATED"
                  ? setFilter("rating", value)
                  : undefined
              }
            />
          </>
        }
      />

      <AdminDataTable
        rows={page.items}
        columns={columns}
        getRowId={(instructor) => instructor.id}
        pagination={page.meta}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
        sorting={table.sorting}
        onSort={table.toggleSorting}
        selectedIds={table.selectedIds}
        onToggleRows={table.toggleRows}
        visibleColumnIds={visibleColumns}
        onVisibleColumnsChange={setVisibleColumns}
        emptyTitle="No instructors match these filters"
        emptyDescription="Try a different search or clear one or more filters."
      />

      <InstructorDetailsSheet
        key={`${detailsInstructor?.id ?? "none"}-${detailsTab}`}
        instructor={detailsInstructor}
        initialTab={detailsTab}
        onOpenChange={(open) => {
          if (!open) setDetailsInstructor(null);
        }}
      />

      <AdminConfirmDialog
        open={approvalAction?.action === "approve"}
        onOpenChange={(open) => {
          if (!open) setApprovalAction(null);
        }}
        title="Approve instructor application?"
        description={`This marks ${approvalAction?.instructor.name ?? "the instructor"} as approved in the local demo. It does not notify the instructor or publish courses.`}
        confirmLabel="Approve application"
        onConfirm={applyApproval}
      />

      <AdminDialog
        open={isRejecting}
        onOpenChange={(open) => {
          if (!open) {
            setApprovalAction(null);
            setRejectionReason("");
            setRejectionError("");
          }
        }}
        title="Reject instructor application"
        description={`This demo rejection is stored locally for ${approvalAction?.instructor.name ?? "the instructor"}. No message is sent.`}
        size="sm"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setApprovalAction(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={rejectApplication}
            >
              Reject application
            </Button>
          </>
        }
      >
        <label className="block space-y-1.5 text-xs font-medium text-brand-text">
          Rejection reason
          <Input
            value={rejectionReason}
            onChange={(event) => {
              setRejectionReason(event.target.value);
              setRejectionError("");
            }}
            placeholder="Explain why this application is being rejected"
            className="h-10"
            required
            minLength={5}
          />
          {rejectionError && (
            <span className="block text-xs font-normal text-destructive">{rejectionError}</span>
          )}
        </label>
      </AdminDialog>
    </section>
  );
}
