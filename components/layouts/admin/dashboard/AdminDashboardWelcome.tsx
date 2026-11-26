"use client";

import { useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, LayoutDashboard, Sparkles } from "lucide-react";

import { useAuthStore } from "@/features/auth/store/auth.store";

const subscribeToHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function getGreeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function AdminDashboardWelcome({
  isDemo,
}: {
  isDemo: boolean;
}) {
  const hasHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot,
  );
  const shouldReduceMotion = useReducedMotion();
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const firstName = user?.name.trim().split(/\s+/)[0] || "there";
  const greeting = hasHydrated
    ? getGreeting(new Date().getHours())
    : "Welcome";
  const currentDate = hasHydrated
    ? new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date())
    : "";

  return (
    <motion.section
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.35 }}
      className="relative isolate overflow-hidden rounded-2xl border border-primary/15 bg-linear-to-br from-primary/10 via-brand-soft/40 to-card p-5 sm:p-7"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              <LayoutDashboard size={15} aria-hidden="true" />
              Administration workspace
            </span>
            {isDemo && (
              <Badge
                variant="outline"
                className="gap-1 border-primary/25 bg-background/70 text-primary"
              >
                <Sparkles size={12} aria-hidden="true" />
                Sample data
              </Badge>
            )}
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-brand-text sm:text-3xl">
            {greeting},{" "}
            {isInitialized ? (
              firstName
            ) : (
              <span
                role="status"
                aria-label="Loading administrator name"
                className="inline-block h-[0.85em] w-24 animate-pulse rounded-md bg-primary/15 align-middle motion-reduce:animate-none"
              />
            )}
            !
          </h1>

          <p className="max-w-2xl text-sm leading-relaxed text-brand-text-muted">
            Here&apos;s what&apos;s happening across your learning platform
            today.
          </p>

          <p className="flex items-center gap-1.5 text-xs text-brand-text-muted">
            <CalendarDays size={14} aria-hidden="true" />
            <time suppressHydrationWarning>
              {currentDate || "Platform overview"}
            </time>
          </p>
        </div>
      </div>
    </motion.section>
  );
}
