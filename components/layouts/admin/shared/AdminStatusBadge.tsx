import { Badge } from "@/components/ui/badge";

interface AdminStatusBadgeProps {
  status: string;
}

const variants: Record<string, { label: string; className: string }> = {
  ACTIVE: {
    label: "Active",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  INACTIVE: {
    label: "Inactive",
    className: "border-border bg-muted text-muted-foreground",
  },
  SUSPENDED: {
    label: "Suspended",
    className: "border-destructive/20 bg-destructive/10 text-destructive",
  },
  VERIFIED: {
    label: "Verified",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  UNVERIFIED: {
    label: "Unverified",
    className: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  APPROVED: {
    label: "Approved",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  PENDING: {
    label: "Pending review",
    className: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  REJECTED: {
    label: "Rejected",
    className: "border-destructive/20 bg-destructive/10 text-destructive",
  },
  IN_PROGRESS: {
    label: "In progress",
    className: "border-primary/20 bg-primary/10 text-primary",
  },
  COMPLETED: {
    label: "Completed",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
};

export default function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  const config = variants[status] ?? {
    label: status.replaceAll("_", " ").toLowerCase(),
    className: "border-border bg-muted text-muted-foreground",
  };

  return (
    <Badge
      variant="outline"
      className={`h-6 border px-2 text-[10px] font-semibold capitalize ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}
