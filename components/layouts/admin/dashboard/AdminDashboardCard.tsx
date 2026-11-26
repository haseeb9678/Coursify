"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

interface AdminDashboardCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function AdminDashboardCard({
  children,
  className,
  delay = 0,
}: AdminDashboardCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.35,
        delay: shouldReduceMotion ? 0 : delay,
        ease: "easeOut",
      }}
      className={cn(
        "min-w-0 rounded-2xl border border-brand-border/80 bg-card p-4 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-5",
        className,
      )}
    >
      {children}
    </motion.section>
  );
}
