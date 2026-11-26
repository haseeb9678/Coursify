"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Award,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
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
import StudentActions from "./StudentActions";
import StudentDetailsSheet, { type StudentDetailsTab } from "./StudentDetailsSheet";
import { useAdminManagementData } from "@/features/admin/hooks/use-admin-management-data";
import { useAdminTableState } from "@/features/admin/hooks/use-admin-table-state";
import { useDebouncedValue } from "@/features/admin/hooks/use-debounced-value";
import type {
  AdminStudent,
  StudentsFilters,
} from "@/features/admin/types/management.types";
import {
  DEMO_REFERENCE_TIMESTAMP,
  STUDENT_ACTIVITY_WINDOW_MS,
  downloadCsv,
  getStudentAverageProgress,
  paginateRecords,
  sortRecords,
} from "@/features/admin/utils/management.utils";

const initialFilters: StudentsFilters = {
  search: "",
  status: "ALL",
  activity: "ALL",
  enrollment: "ALL",
  progress: "ALL",
};
const initialVisibleColumns = [
  "identity",
  "enrollments",
  "completed",
  "inProgress",
  "progress",
  "certificates",
  "lastActivity",
  "status",
  "actions",
];

function isActiveLearner(student: AdminStudent) {
  return (
    student.status === "ACTIVE" &&
    Boolean(
      student.lastActivityAt &&
        DEMO_REFERENCE_TIMESTAMP - new Date(student.lastActivityAt).getTime() <= STUDENT_ACTIVITY_WINDOW_MS,
    )
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex min-w-32 items-center gap-2">
      <div
        className="h-1.5 min-w-16 flex-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Average progress ${value}%`}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-9 text-right text-[11px] font-semibold tabular-nums text-brand-text">
        {value}%
      </span>
    </div>
  );
}

export default function AdminStudentsClient() {
  const { users, students: studentProfiles } = useAdminManagementData();
  const table = useAdminTableState();
  const { setPage } = table;
  const [filters, setFilters] = useState(initialFilters);
  const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns);
  const [detailsStudent, setDetailsStudent] = useState<AdminStudent | null>(null);
  const [detailsTab, setDetailsTab] = useState<StudentDetailsTab>("overview");
  const debouncedSearch = useDebouncedValue(filters.search.trim());

  const students = useMemo(() => {
    const usersById = new Map(users.map((user) => [user.id, user]));
    return studentProfiles.flatMap((profile): AdminStudent[] => {
      const user = usersById.get(profile.userId);
      if (!user || user.role !== "STUDENT") return [];
      return [{
        ...user,
        ...profile,
        averageProgress: getStudentAverageProgress(profile.enrollments),
      }];
    });
  }, [studentProfiles, users]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.status, filters.activity, filters.enrollment, filters.progress, setPage]);

  const filteredStudents = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    return students.filter((student) => {
      if (query && !`${student.name} ${student.email}`.toLowerCase().includes(query)) return false;
      if (filters.status !== "ALL" && student.status !== filters.status) return false;
      if (filters.activity === "ACTIVE" && !isActiveLearner(student)) return false;
      if (filters.activity === "INACTIVE" && isActiveLearner(student)) return false;
      if (filters.enrollment === "ENROLLED" && student.enrollments.length === 0) return false;
      if (filters.enrollment === "NOT_ENROLLED" && student.enrollments.length > 0) return false;
      if (filters.progress === "LOW" && student.averageProgress >= 33) return false;
      if (
        filters.progress === "MEDIUM" &&
        (student.averageProgress < 33 || student.averageProgress >= 67)
      ) return false;
      if (filters.progress === "HIGH" && student.averageProgress < 67) return false;
      return true;
    });
  }, [debouncedSearch, filters.activity, filters.enrollment, filters.progress, filters.status, students]);

  const sortedStudents = useMemo(
    () =>
      sortRecords(filteredStudents, table.sorting, (student, column) => {
        switch (column) {
          case "identity": return student.name;
          case "enrollments": return student.enrollments.length;
          case "completed": return student.enrollments.filter((item) => item.status === "COMPLETED").length;
          case "inProgress": return student.enrollments.filter((item) => item.status === "IN_PROGRESS").length;
          case "progress": return student.averageProgress;
          case "certificates": return student.certificates.length;
          case "lastActivity": return student.lastActivityAt;
          case "status": return student.status;
          default: return null;
        }
      }),
    [filteredStudents, table.sorting],
  );
  const page = paginateRecords(sortedStudents, table.page, table.pageSize);

  const columns = useMemo<AdminTableColumn<AdminStudent>[]>(() => [
    {
      id: "identity",
      header: "Student",
      sortValue: (student) => student.name,
      cell: (student) => (
        <div className="flex min-w-48 items-center gap-3">
          <AdminUserAvatar name={student.name} avatar={student.avatar} />
          <div className="min-w-0">
            <p className="truncate font-semibold text-brand-text">{student.name}</p>
            <p className="mt-0.5 truncate text-[11px] text-brand-text-muted">{student.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "enrollments",
      header: "Enrolled",
      sortValue: (student) => student.enrollments.length,
      cell: (student) => <span className="font-semibold tabular-nums">{student.enrollments.length}</span>,
    },
    {
      id: "completed",
      header: "Completed",
      sortValue: (student) => student.enrollments.filter((item) => item.status === "COMPLETED").length,
      cell: (student) => <span className="font-semibold tabular-nums">{student.enrollments.filter((item) => item.status === "COMPLETED").length}</span>,
    },
    {
      id: "inProgress",
      header: "In progress",
      sortValue: (student) => student.enrollments.filter((item) => item.status === "IN_PROGRESS").length,
      cell: (student) => <span className="font-semibold tabular-nums">{student.enrollments.filter((item) => item.status === "IN_PROGRESS").length}</span>,
    },
    {
      id: "progress",
      header: "Avg. progress",
      sortValue: (student) => student.averageProgress,
      cell: (student) => <ProgressBar value={student.averageProgress} />,
    },
    {
      id: "certificates",
      header: "Certificates",
      sortValue: (student) => student.certificates.length,
      cell: (student) => <span className="font-semibold tabular-nums">{student.certificates.length}</span>,
    },
    {
      id: "lastActivity",
      header: "Last activity",
      sortValue: (student) => student.lastActivityAt,
      cell: (student) => (
        <span className="whitespace-nowrap text-brand-text-muted">
          {student.lastActivityAt
            ? new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
                Math.ceil((new Date(student.lastActivityAt).getTime() - DEMO_REFERENCE_TIMESTAMP) / (24 * 60 * 60 * 1000)),
                "day",
              )
            : "No recent activity"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Account",
      sortValue: (student) => student.status,
      cell: (student) => <AdminStatusBadge status={student.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      hideable: false,
      className: "w-14 text-right",
      cell: (student) => (
        <StudentActions
          student={student}
          onView={(selected, tab) => {
            setDetailsTab(tab);
            setDetailsStudent(selected);
          }}
        />
      ),
    },
  ], []);

  const setFilter = <K extends keyof StudentsFilters>(key: K, value: StudentsFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
    table.setPage(1);
  };
  const clearFilters = () => {
    setFilters(initialFilters);
    table.setPage(1);
    table.clearSelection();
  };

  const exportStudents = (mode: AdminExportMode) => {
    const records =
      mode === "selected"
        ? students.filter((student) => table.selectedIds.has(student.id))
        : mode === "filtered"
          ? filteredStudents
          : students;
    downloadCsv(
      `coursify-students-${mode}`,
      ["Name", "Email", "Account status", "Enrolled courses", "Completed courses", "In-progress courses", "Average progress", "Certificates", "Last learning activity"],
      records.map((student) => [
        student.name,
        student.email,
        student.status,
        student.enrollments.length,
        student.enrollments.filter((item) => item.status === "COMPLETED").length,
        student.enrollments.filter((item) => item.status === "IN_PROGRESS").length,
        `${student.averageProgress}%`,
        student.certificates.length,
        student.lastActivityAt ?? "",
      ]),
    );
    toast.success(`Exported ${records.length} demo student records. Not saved to backend.`);
  };

  const totalEnrollments = students.reduce((total, student) => total + student.enrollments.length, 0);
  const totalCertificates = students.reduce((total, student) => total + student.certificates.length, 0);
  const stats = [
    {
      label: "Total students",
      value: students.length.toLocaleString(),
      description: "Student accounts in the demo",
      icon: GraduationCap,
      tone: "primary" as const,
    },
    {
      label: "Active learners",
      value: students.filter(isActiveLearner).length.toLocaleString(),
      description: "Active accounts learning in the last 30 days",
      icon: Activity,
      tone: "green" as const,
    },
    {
      label: "Total enrollments",
      value: totalEnrollments.toLocaleString(),
      description: "Across all student course records",
      icon: BookOpen,
      tone: "violet" as const,
    },
    {
      label: "Certificates issued",
      value: totalCertificates.toLocaleString(),
      description: "Completed-course demo certificates",
      icon: Award,
      tone: "amber" as const,
    },
  ];

  const filtersActive =
    Boolean(filters.search.trim()) ||
    filters.status !== "ALL" ||
    filters.activity !== "ALL" ||
    filters.enrollment !== "ALL" ||
    filters.progress !== "ALL";

  return (
    <section className="mx-auto w-full max-w-450 space-y-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <AdminPageHeader
        title="Students"
        description="Monitor student enrollments and learning performance."
        actions={
          <AdminExportButton
            selectedCount={table.selectedIds.size}
            filteredCount={filteredStudents.length}
            onExport={exportStudents}
          />
        }
      />

      <AdminStatsGrid stats={stats} />

      <AdminTableToolbar
        search={filters.search}
        onSearchChange={(value) => setFilter("search", value)}
        searchPlaceholder="Search by name or email..."
        searchLabel="Search students"
        onClear={clearFilters}
        filtersActive={filtersActive}
        filters={
          <>
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
                value === "ALL" || value === "ACTIVE" || value === "INACTIVE" || value === "SUSPENDED"
                  ? setFilter("status", value)
                  : undefined
              }
            />
            <AdminFilterSelect
              label="Filter by learning activity"
              value={filters.activity}
              options={[
                { value: "ALL", label: "All activity" },
                { value: "ACTIVE", label: "Active in 30 days" },
                { value: "INACTIVE", label: "No activity in 30 days" },
              ]}
              onChange={(value) =>
                value === "ALL" || value === "ACTIVE" || value === "INACTIVE"
                  ? setFilter("activity", value)
                  : undefined
              }
            />
            <AdminFilterSelect
              label="Filter by enrollment"
              value={filters.enrollment}
              options={[
                { value: "ALL", label: "Any enrollment" },
                { value: "ENROLLED", label: "Enrolled in courses" },
                { value: "NOT_ENROLLED", label: "No enrollments" },
              ]}
              onChange={(value) =>
                value === "ALL" || value === "ENROLLED" || value === "NOT_ENROLLED"
                  ? setFilter("enrollment", value)
                  : undefined
              }
            />
            <AdminFilterSelect
              label="Filter by progress range"
              value={filters.progress}
              options={[
                { value: "ALL", label: "Any progress" },
                { value: "LOW", label: "Low (0-32%)" },
                { value: "MEDIUM", label: "Medium (33-66%)" },
                { value: "HIGH", label: "High (67-100%)" },
              ]}
              onChange={(value) =>
                value === "ALL" || value === "LOW" || value === "MEDIUM" || value === "HIGH"
                  ? setFilter("progress", value)
                  : undefined
              }
            />
          </>
        }
      />

      <AdminDataTable
        rows={page.items}
        columns={columns}
        getRowId={(student) => student.id}
        pagination={page.meta}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
        sorting={table.sorting}
        onSort={table.toggleSorting}
        selectedIds={table.selectedIds}
        onToggleRows={table.toggleRows}
        visibleColumnIds={visibleColumns}
        onVisibleColumnsChange={setVisibleColumns}
        emptyTitle="No students match these filters"
        emptyDescription="Try a different search or clear one or more filters."
      />

      <StudentDetailsSheet
        key={`${detailsStudent?.id ?? "none"}-${detailsTab}`}
        student={detailsStudent}
        initialTab={detailsTab}
        onOpenChange={(open) => {
          if (!open) setDetailsStudent(null);
        }}
      />
    </section>
  );
}
