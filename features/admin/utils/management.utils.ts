import type {
  PaginationMeta,
  PaginatedResponse,
  TableSorting,
} from "@/features/admin/types/management.types";

export const DEMO_REFERENCE_TIMESTAMP = Date.UTC(2026, 10, 26);
export const STUDENT_ACTIVITY_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export function getPaginationMeta(
  total: number,
  requestedPage: number,
  limit: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  const page = totalPages === 0 ? 1 : Math.min(Math.max(1, requestedPage), totalPages);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1 && totalPages > 0,
  };
}

export function paginateRecords<T>(
  records: readonly T[],
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const meta = getPaginationMeta(records.length, page, limit);
  const start = (meta.page - 1) * meta.limit;
  return {
    items: records.slice(start, start + meta.limit),
    meta,
  };
}

export function sortRecords<T>(
  records: readonly T[],
  sorting: TableSorting | null,
  valueForColumn: (record: T, column: string) => string | number | null,
): T[] {
  if (!sorting) return [...records];

  const direction = sorting.direction === "asc" ? 1 : -1;
  return [...records].sort((a, b) => {
    const left = valueForColumn(a, sorting.column);
    const right = valueForColumn(b, sorting.column);
    if (left === right) return 0;
    if (left === null || left === undefined) return 1;
    if (right === null || right === undefined) return -1;

    const result =
      typeof left === "number" && typeof right === "number"
        ? left - right
        : String(left).localeCompare(String(right), undefined, {
            numeric: true,
            sensitivity: "base",
          });
    return result * direction;
  });
}

function protectSpreadsheetFormula(value: unknown) {
  const text = value == null ? "" : String(value);
  return /^[\t\r ]*[=+\-@]/.test(text) ? `'${text}` : text;
}

export function createCsvContent(
  headers: readonly string[],
  rows: readonly (readonly unknown[])[],
) {
  return [headers, ...rows]
    .map((row) =>
      row
        .map((value) => `"${protectSpreadsheetFormula(value).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\r\n");
}

export function downloadCsv(
  filename: string,
  headers: readonly string[],
  rows: readonly (readonly unknown[])[],
) {
  const blob = new Blob(["\uFEFF", createCsvContent(headers, rows)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function formatManagementDate(value?: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function getStudentAverageProgress(
  enrollments: readonly { progress: number }[],
) {
  if (enrollments.length === 0) return 0;
  return Math.round(
    enrollments.reduce((total, enrollment) => total + enrollment.progress, 0) /
      enrollments.length,
  );
}
