import { Suspense, type ReactNode } from "react";
import { cookies } from "next/headers";

import StudentLayoutClient from "@/components/layouts/student/StudentLayoutClient";
import Footer from "@/components/layouts/marketing/Footer";
import { footerColumns } from "@/features/home/data/footer.data";

interface StudentLayoutProps {
  children: ReactNode;
}

async function StudentLayoutContent({
  children,
}: StudentLayoutProps) {
  const cookieStore = await cookies();

  const sidebarState =
    cookieStore.get("sidebar_state")?.value;

  const defaultOpen =
    sidebarState === undefined
      ? true
      : sidebarState === "true";

  return (
    <StudentLayoutClient
      defaultOpen={defaultOpen}
      
    >
      {children}
    </StudentLayoutClient>
  );
}

function StudentLayoutFallback() {
  return (
    <div
      role="status"
      aria-label="Loading student workspace"
      className="flex min-h-dvh bg-background"
    >
      {/* Sidebar Skeleton */}
      <div className="hidden w-64 shrink-0 border-r border-brand-border p-4 md:block">
        <div className="h-10 w-36 animate-pulse rounded-lg bg-brand-soft" />

        <div className="mt-10 space-y-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="h-10 animate-pulse rounded-lg bg-brand-soft/70"
            />
          ))}
        </div>
      </div>

      {/* Workspace Skeleton */}
      <div className="min-w-0 flex-1">
        <div className="flex h-18 items-center gap-4 border-b border-brand-border px-5">
          <div className="size-8 animate-pulse rounded-lg bg-brand-soft" />

          <div className="h-4 w-36 animate-pulse rounded-md bg-brand-soft" />
        </div>

        <div className="space-y-5 p-6">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-brand-soft" />

          <div className="h-4 w-64 max-w-full animate-pulse rounded-md bg-brand-soft/70" />

          <div className="h-64 animate-pulse rounded-2xl bg-brand-soft/40" />
        </div>
      </div>
    </div>
  );
}

export default function StudentLayout({
  children,
}: StudentLayoutProps) {
  return (
    <Suspense fallback={<StudentLayoutFallback />}>
      <StudentLayoutContent>
        {children}
      </StudentLayoutContent>
    </Suspense>
  );
}