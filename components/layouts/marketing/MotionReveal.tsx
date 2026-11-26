"use client";

import { useAccessibleMotion } from "@/features/accessibility/hooks/use-accessible-motion";
import type { ReactNode } from "react";
import { motion } from "motion/react";

type MotionRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "fadeUp" | "fadeLeft" | "scale";
  hover?: boolean;
};

const initialByVariant = {
  fadeUp: { opacity: 0, y: 24 },
  fadeLeft: { opacity: 0, x: 28 },
  scale: { opacity: 0, scale: 0.96 },
} as const;

const visibleByVariant = {
  fadeUp: { opacity: 1, y: 0 },
  fadeLeft: { opacity: 1, x: 0 },
  scale: { opacity: 1, scale: 1 },
} as const;

export default function MotionReveal({
  children,
  className,
  delay = 0,
  variant = "fadeUp",
  hover = false,
}: MotionRevealProps) {
  const shouldReduceMotion = useAccessibleMotion();

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : initialByVariant[variant]}
      whileInView={visibleByVariant[variant]}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.55,
        delay: shouldReduceMotion ? 0 : delay,
        ease: "easeOut",
      }}
      whileHover={
        hover && !shouldReduceMotion
          ? {
              y: -5,
              scale: 1.015,
              transition: { duration: 0.2, delay: 0 },
            }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
}
