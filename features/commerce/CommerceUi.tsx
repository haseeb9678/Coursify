"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { commerceLogin } from "./return-path";
import { statusLabel } from "./commerce-format";
import { useAuthStore } from "@/features/auth/store/auth.store";

export function CommerceStatus({ value }: { value?: string | null }) {
  const positive = value && ["PAID", "SUCCEEDED", "ACTIVE", "COMPLETED", "PROCESSED"].includes(value);
  return <Badge variant={positive ? "secondary" : "outline"}>{statusLabel(value)}</Badge>;
}

export function CommerceLoading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="space-y-3" role="status">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-28 w-full rounded-xl" />
    </div>
  );
}

export function CommerceMessage({ title, message, actions }: {
  title: string; message?: string; actions?: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-xl border border-brand-border bg-card p-5">
      <h2 className="font-semibold text-brand-text">{title}</h2>
      {message && <p className="text-sm text-brand-text-muted">{message}</p>}
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </section>
  );
}

export function CommerceLink({ href, children, primary = false }: {
  href: string; children: ReactNode; primary?: boolean;
}) {
  return <Button variant={primary ? "default" : "outline"} render={<Link href={href} />} nativeButton={false}>{children}</Button>;
}

export function StudentCheckoutGate({ path, children }: { path: string; children: ReactNode }) {
  const { isInitialized, user } = useAuthStore();
  if (!isInitialized) return <CommerceLoading label="Checking your account" />;
  if (!user) {
    return <CommerceMessage title="Sign in to continue" message="Use your student account to access this checkout."
      actions={<CommerceLink href={commerceLogin(path)} primary>Sign in</CommerceLink>} />;
  }
  if (user.role !== "STUDENT" || user.status !== "ACTIVE") {
    return <CommerceMessage title="Student account required" message="Checkout is available to active student accounts."
      actions={<CommerceLink href="/courses">Browse courses</CommerceLink>} />;
  }
  return children;
}
