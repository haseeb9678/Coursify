
"use client";

import { motion, useReducedMotion } from "motion/react";

const highlightedBlocks = [
  { column: 1, row: 1, opacity: 0.07 },
  { column: 3, row: 2, opacity: 0.12 },
  { column: 4, row: 2, opacity: 0.05 },
  { column: 6, row: 1, opacity: 0.08 },
  { column: 2, row: 4, opacity: 0.06 },
  { column: 5, row: 5, opacity: 0.1 },
  { column: 7, row: 3, opacity: 0.07 },
  { column: 8, row: 6, opacity: 0.09 },
  { column: 3, row: 7, opacity: 0.05 },
];

export default function HeroAmbientBackground() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Base Background */}
      <div className="absolute inset-0 bg-linear-to-br from-background via-background to-brand-soft/80" />

      {/* Primary Ambient Lighting */}
      <motion.div
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, 35, 0],
                y: [0, -25, 0],
                scale: [1, 1.08, 1],
              }
        }
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -right-[10%] -top-[30%] h-[85%] w-[65%] rounded-full bg-primary/[0.16] blur-[90px] lg:blur-[120px] dark:bg-primary/[0.14]"
      />

      {/* Secondary Ambient Lighting */}
      <motion.div
        animate={
          shouldReduceMotion
            ? undefined
            : {
                x: [0, -25, 0],
                y: [0, 20, 0],
              }
        }
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-[35%] -left-[12%] h-[75%] w-[55%] rounded-full bg-brand-accent/[0.10] blur-[90px] lg:blur-[120px]"
      />

      {/* Architectural Grid */}
      <div
        className="absolute inset-0 text-primary opacity-[0.10] dark:opacity-[0.14]"
        style={{
          backgroundImage: `
            linear-gradient(currentColor 1px, transparent 1px),
            linear-gradient(90deg, currentColor 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse at 80% 35%, black 10%, rgba(0,0,0,0.65) 45%, transparent 85%)",
        }}
      />

      {/* Highlighted Grid Blocks */}
      <div
        className="absolute right-0 top-0 hidden h-full w-[576px] lg:block"
        style={{
          maskImage:
            "linear-gradient(to bottom, black 0%, black 65%, transparent 100%)",
        }}
      >
        {highlightedBlocks.map(
          ({ column, row, opacity }) => (
            <div
              key={`${column}-${row}`}
              className="absolute border border-primary/10 bg-primary"
              style={{
                right: column * 64,
                top: row * 64,
                width: 64,
                height: 64,
                opacity,
              }}
            />
          ),
        )}
      </div>

      {/* Primary Glass Panel */}
      <div
        className="
          absolute -right-[7%] top-[6%]
          hidden h-[88%] w-[47%]
          -rotate-6 rounded-[48px]
          border border-primary/15
          bg-linear-to-br
          from-white/40 via-white/10 to-primary/5
          shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]
          backdrop-blur-[2px]
          lg:block
          dark:border-white/10
          dark:from-white/[0.06]
          dark:via-white/[0.02]
          dark:to-primary/5
        "
      />

      {/* Secondary Glass Panel */}
      <div
        className="
          absolute -right-[12%] top-[18%]
          hidden h-[75%] w-[40%]
          rotate-6 rounded-[48px]
          border border-primary/10
          bg-primary/[0.035]
          lg:block
          dark:border-white/[0.07]
        "
      />

      {/* Small Architectural Accent */}
      <div
        className="
          absolute left-[5%] top-[12%]
          hidden size-32
          -rotate-12 rounded-3xl
          border border-primary/10
          bg-linear-to-br
          from-primary/[0.04] to-transparent
          xl:block
        "
      />

      {/* Bottom Background Transition */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-background via-background/60 to-transparent sm:h-28" />
    </div>
  );
}
