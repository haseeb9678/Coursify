import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

export default function AdminPageHeader({
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-brand-text sm:text-3xl">
            {title}
          </h1>
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[10px] font-semibold text-primary">
            <Sparkles size={12} aria-hidden="true" />
            Demo data
          </span>
        </div>
        <p className="max-w-2xl text-sm text-brand-text-muted">{description}</p>
        <p className="mt-1 text-xs text-brand-text-muted">
          Changes are temporary and are not saved to the backend.
        </p>
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </header>
  );
}
