import { Inbox } from "lucide-react";

interface AdminEmptyStateProps {
  title: string;
  description: string;
}

export default function AdminEmptyState({
  title,
  description,
}: AdminEmptyStateProps) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
      <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Inbox size={20} aria-hidden="true" />
      </span>
      <h3 className="text-sm font-semibold text-brand-text">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-brand-text-muted">
        {description}
      </p>
    </div>
  );
}
