import { AlertCircle } from "lucide-react";

interface AdminErrorStateProps {
  title: string;
  description: string;
}

export default function AdminErrorState({
  title,
  description,
}: AdminErrorStateProps) {
  return (
    <div role="alert" className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
      <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <AlertCircle size={20} aria-hidden="true" />
      </span>
      <h3 className="text-sm font-semibold text-brand-text">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-brand-text-muted">
        {description}
      </p>
    </div>
  );
}
