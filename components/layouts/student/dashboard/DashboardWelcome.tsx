"use client";

import { useAccessibleMotion } from "@/features/accessibility/hooks/use-accessible-motion";
import Link from "next/link";

import {
  ArrowUpRight,
  GraduationCap,
  Sparkles,
} from "lucide-react";

import { motion } from "motion/react";

import { useAuthStore } from "@/features/auth/store/auth.store";

export default function DashboardWelcome() {
  const shouldReduceMotion = useAccessibleMotion();

  // Authentication state
  const user = useAuthStore((state) => state.user);

  const isInitialized = useAuthStore(
    (state) => state.isInitialized,
  );

  // Extract first name from authenticated user
  const firstName =
    user?.name.trim().split(/\s+/)[0] || "Student";

  return (
    <motion.section
      initial={
        shouldReduceMotion
          ? false
          : { opacity: 0, y: 10 }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="
        relative isolate overflow-hidden rounded-2xl
        border border-primary/15
        bg-linear-to-br from-primary/10
        via-brand-soft/50 to-card
        p-5 sm:p-7 lg:p-8
      "
    >
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute -right-16
          -top-20 size-72 rounded-full
          bg-primary/10 blur-3xl
        "
      />

      <div className="relative flex items-center justify-between gap-6">
        <div className="min-w-0 space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Sparkles size={15} />

            Your learning workspace
          </span>

          {/* Personalized Welcome Heading */}
          <h1 className="text-2xl font-bold tracking-tight text-brand-text sm:text-3xl lg:text-4xl">
            Welcome back,{" "}

            {!isInitialized ? (
              <span
                role="status"
                aria-label="Loading student name"
                className="
                  inline-block h-[0.85em] w-24
                  animate-pulse rounded-md
                  bg-primary/15 align-middle
                  motion-reduce:animate-none
                  sm:w-32
                "
              />
            ) : (
              <span>{firstName}!</span>
            )}
          </h1>

          <p className="max-w-lg text-sm leading-relaxed text-brand-text-muted">
            Every lesson brings you closer to your goals.
            Keep learning, stay consistent, and build
            something extraordinary.
          </p>

          <Link
            href="/courses"
            className="
              mt-2 inline-flex items-center gap-2
              rounded-lg bg-primary px-4 py-2.5
              text-sm font-semibold
              text-primary-foreground
              transition-colors hover:bg-primary/90
            "
          >
            Explore courses

            <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* Minimal decorative illustration */}
        <motion.div
          aria-hidden="true"
          animate={
            shouldReduceMotion
              ? undefined
              : { y: [0, -7, 0] }
          }
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            hidden size-32 shrink-0 rotate-6
            items-center justify-center
            rounded-3xl border border-primary/15
            bg-card/60 shadow-xl shadow-primary/5
            backdrop-blur-xl sm:flex lg:size-40
          "
        >
          <GraduationCap
            size={65}
            strokeWidth={1.3}
            className="text-primary"
          />
        </motion.div>
      </div>
    </motion.section>
  );
}