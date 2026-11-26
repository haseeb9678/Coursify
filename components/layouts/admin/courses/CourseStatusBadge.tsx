import { Badge } from "@/components/ui/badge";
import type { CourseStatus } from "@/features/admin/types/learning.types";

const courseStatusPresentation: Record<
  CourseStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "border-border bg-muted text-muted-foreground",
  },
  PENDING_REVIEW: {
    label: "Pending review",
    className: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  APPROVED: {
    label: "Approved",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  REJECTED: {
    label: "Changes requested",
    className: "border-destructive/20 bg-destructive/10 text-destructive",
  },
  PUBLISHED: {
    label: "Published",
    className: "border-primary/20 bg-primary/10 text-primary",
  },
  ARCHIVED: {
    label: "Archived",
    className: "border-border bg-brand-page-secondary text-brand-text-muted",
  },
};

export default function CourseStatusBadge({
  status,
}: {
  status: CourseStatus;
}) {
  const presentation = courseStatusPresentation[status];
  return (
    <Badge
      variant="outline"
      className={`h-6 whitespace-nowrap border px-2 text-[10px] font-semibold ${presentation.className}`}
    >
      {presentation.label}
    </Badge>
  );
}
