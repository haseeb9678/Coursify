"use client";

import { useAccessibleMotion } from "@/features/accessibility/hooks/use-accessible-motion";
import type { ReactNode } from "react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

interface DashboardCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function DashboardCard({
  children,
  className,
  delay = 0,
}: DashboardCardProps) {
  const shouldReduceMotion = useAccessibleMotion();

  return (
    <motion.section
      initial={
        shouldReduceMotion
          ? false
          : { opacity: 0, y: 12 }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.4,
        delay: shouldReduceMotion ? 0 : delay,
        ease: "easeOut",
      }}
      className={cn(
        "min-w-0 rounded-2xl",
        "border border-brand-border/80",
        "bg-card p-4 sm:p-5",
        "shadow-sm",
        "transition-shadow duration-300",
        "hover:shadow-md",
        className,
      )}
    >
      {children}
    </motion.section>
  );
}