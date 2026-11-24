import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Dashboard | Coursify",
  description: "Manage your personal learning workspace.",
};

export default function StudentDashboardPage() {
  return (
    <section className="w-full space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Page Introduction */}
      <div className="space-y-2">
        <span className="text-xs font-semibold tracking-wide text-primary">
          Student workspace
        </span>

        <h1 className="text-2xl font-semibold tracking-[-0.035em] text-brand-text sm:text-3xl">
          Welcome back!
        </h1>

        <p className="text-sm leading-relaxed text-brand-text-muted">
          Continue your learning journey and achieve
          your goals.
        </p>
      </div>

      {/* Temporary Dashboard Content */}
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-brand-border bg-card">
        <p className="text-sm text-brand-text-muted">
          Student dashboard content
        </p>
      </div>
    </section>
  );
}