import { Info } from "lucide-react";

export default function LearningSampleNotice() {
  return (
    <aside className="flex items-start gap-2 rounded-lg border border-brand-border bg-brand-page-secondary/60 px-3 py-2.5 text-xs text-brand-text-muted">
      <Info size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />
      <p>
        Temporary sample data. Changes stay in this browser session and are not
        sent to the server.
      </p>
    </aside>
  );
}
