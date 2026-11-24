"use client";

import Image from "next/image";
import type { PointerEvent } from "react";

import {
  Sparkles,
  GraduationCap,
  PlayCircle,
  Award,
} from "lucide-react";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

const feature = {
  image:
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85",
  imageAlt: "Professional instructors collaborating",
  tag: "Expert Mentorship",
  highlight: "Learn from industry professionals",
};

/* Refined pointer-driven 3D interaction */
function useTilt(maxDeg: number, enabled: boolean) {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const spring = {
    stiffness: 150,
    damping: 24,
    mass: 0.8,
  };

  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);

  const rotateX = useTransform(
    sy,
    [0, 1],
    [maxDeg, -maxDeg],
  );

  const rotateY = useTransform(
    sx,
    [0, 1],
    [-maxDeg, maxDeg],
  );

  const glareX = useTransform(sx, [0, 1], [0, 100]);
  const glareY = useTransform(sy, [0, 1], [0, 100]);

  const glare = useMotionTemplate`
    radial-gradient(
      circle at ${glareX}% ${glareY}%,
      rgba(255,255,255,0.18),
      transparent 60%
    )
  `;

  const glareOpacity = useSpring(0, {
    stiffness: 160,
    damping: 24,
  });

  const onPointerMove = (
    event: PointerEvent<HTMLElement>,
  ) => {
    if (!enabled || event.pointerType !== "mouse") {
      return;
    }

    const rect =
      event.currentTarget.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    const x =
      (event.clientX - rect.left) / rect.width;

    const y =
      (event.clientY - rect.top) / rect.height;

    px.set(Math.max(0, Math.min(1, x)));
    py.set(Math.max(0, Math.min(1, y)));

    glareOpacity.set(1);
  };

  const onPointerLeave = () => {
    px.set(0.5);
    py.set(0.5);
    glareOpacity.set(0);
  };

  return {
    sx,
    sy,
    rotateX: enabled ? rotateX : 0,
    rotateY: enabled ? rotateY : 0,
    glare,
    glareOpacity,
    onPointerMove,
    onPointerLeave,
  };
}

export default function GrowKnowledgeSection() {
  const reduceMotion = useReducedMotion() ?? false;

  const tilt = useTilt(5, !reduceMotion);

  // Subtle image parallax.
  const imgX = useTransform(
    tilt.sx,
    [0, 1],
    [6, -6],
  );

  const imgY = useTransform(
    tilt.sy,
    [0, 1],
    [6, -6],
  );

  // Independent movement for floating elements.
  const floatingX = useTransform(
    tilt.sx,
    [0, 1],
    [-8, 8],
  );

  const floatingY = useTransform(
    tilt.sy,
    [0, 1],
    [-6, 6],
  );

  return (
    <section className="relative isolate overflow-hidden py-16 sm:py-20 lg:py-20 pt-3!">
      {/* Existing ambient background */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[420px]
        -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-accent/[0.09] blur-[120px] sm:size-[560px]"
      />

      <div className="w-full px-4 sm:px-6 xl:px-10 2xl:px-15">

        {/* =====================================
            SECTION HEADING — UNCHANGED
        ====================================== */}

        <motion.div
          initial={
            reduceMotion
              ? false
              : { opacity: 0, y: 30 }
          }
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
          className="mx-auto mb-14 max-w-2xl space-y-4 text-center sm:mb-16"
        >
          <span className="rounded-full border border-primary/30 max-w-max mx-auto bg-brand-soft px-6 flex items-center justify-center gap-2 py-3 text-sm font-extrabold uppercase tracking-[0.1em] text-brand-primary">
            <Award />
            Mentorship & Excellence
          </span>

          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-brand-text sm:text-[34px] lg:text-[38px]">
            Grow Your Knowledge With{" "}
            <span className="text-brand-primary">
              Industry Experts
            </span>
          </h2>

          <p className="mx-auto max-w-xl text-sm leading-7 text-brand-text-muted sm:text-[15px]">
            Learn from professionals, build practical
            skills, and prepare yourself for the real world.
          </p>
        </motion.div>

        {/* =====================================
            PREMIUM 3D CARD
        ====================================== */}

        <div className="relative mx-auto w-full max-w-230 px-2 sm:px-8 lg:px-12">

          {/* Local ambient lighting */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[10%] inset-y-[15%] -z-10 rounded-full bg-primary/[0.12] blur-[80px] dark:bg-primary/[0.08]"
          />

          {/* Entrance animation */}
          <motion.div
            initial={
              reduceMotion
                ? false
                : {
                    opacity: 0,
                    y: 30,
                    scale: 0.97,
                  }
            }
            whileInView={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: reduceMotion ? 0 : 0.7,
              ease: "easeOut",
              delay: reduceMotion ? 0 : 0.1,
            }}
            className="relative w-full"
          >

            {/* Static perspective container */}
            <div
              onPointerMove={tilt.onPointerMove}
              onPointerLeave={tilt.onPointerLeave}
              className="relative [perspective:1600px]"
            >

              {/* Main 3D layer */}
              <motion.div
                style={{
                  rotateX: tilt.rotateX,
                  rotateY: tilt.rotateY,
                  transformStyle: "preserve-3d",
                }}
                className="relative"
              >

                {/* Rear glass layer */}
                <div
                  aria-hidden="true"
                  style={{
                    transform: "translateZ(-35px)",
                  }}
                  className="pointer-events-none absolute inset-0 hidden translate-y-5 rotate-[-3deg] rounded-[32px] border border-primary/15 bg-primary/[0.045] sm:block"
                />

                {/* Secondary layered frame */}
                <div
                  aria-hidden="true"
                  style={{
                    transform: "translateZ(-18px)",
                  }}
                  className="pointer-events-none absolute inset-0 hidden translate-x-3 translate-y-3 rotate-[2deg] rounded-[30px] border border-brand-border bg-card/60 backdrop-blur-md sm:block"
                />

                {/* Main glass frame */}
                <div className="relative rounded-[24px] border border-brand-border bg-card/65 p-2 shadow-[0_30px_70px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:rounded-[30px] sm:p-3 dark:shadow-black/30">

                  {/* Image container */}
                  <div className="relative h-[340px] overflow-hidden rounded-[17px] bg-brand-soft sm:h-[400px] sm:rounded-[22px] lg:h-[460px]">

                    {/* Image parallax */}
                    <motion.div
                      style={
                        reduceMotion
                          ? undefined
                          : {
                              x: imgX,
                              y: imgY,
                              scale: 1.04,
                            }
                      }
                      className="absolute inset-0"
                    >
                      <Image
                        src={feature.image}
                        alt={feature.imageAlt}
                        fill
                        sizes="(max-width: 639px) 90vw, (max-width: 1023px) 80vw, 820px"
                        className="object-cover object-center"
                      />
                    </motion.div>

                    {/* Cinematic image contrast */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/15 to-slate-950/5"
                    />

                    {/* Subtle horizontal gradient */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-linear-to-r from-slate-950/20 to-transparent"
                    />

                    {/* Interactive lighting */}
                    {!reduceMotion && (
                      <motion.div
                        style={{
                          background: tilt.glare,
                          opacity: tilt.glareOpacity,
                        }}
                        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
                      />
                    )}

                    {/* Top glass badge */}
                    <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-slate-950/25 px-3.5 py-2 text-[11px] font-medium text-white backdrop-blur-md sm:px-4 sm:text-xs">
                        <span className="size-1.5 rounded-full bg-emerald-400" />

                        Discover your potential
                      </div>
                    </div>

                    {/* =================================
                        IMAGE CONTENT
                    ================================== */}

                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-10">
                      <div className="max-w-lg">

                        {/* Category */}
                        <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80 sm:mb-4 sm:text-xs">
                          <Sparkles
                            size={14}
                            strokeWidth={1.7}
                            className="text-blue-300"
                          />

                          {feature.tag}
                        </div>

                        {/* Card heading */}
                        <h3 className="max-w-md text-[26px] font-semibold leading-[1.15] tracking-[-0.035em] text-white sm:text-4xl lg:text-[42px]">
                          {feature.highlight}
                        </h3>

                        {/* Description */}
                        <p className="mt-3 max-w-sm text-xs leading-relaxed text-white/75 sm:text-sm sm:leading-6">
                          Every step brings you closer
                          to your goals.
                        </p>

                        {/* Minimal accent line */}
                        <div
                          aria-hidden="true"
                          className="mt-5 h-0.75 w-12 rounded-full bg-white/80 sm:mt-6"
                        />
                      </div>
                    </div>

                    {/* Inner glass highlight */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-[17px] border border-white/15 sm:rounded-[22px]"
                    />
                  </div>
                </div>

                {/* =====================================
                    FLOATING MENTORSHIP CARD
                ====================================== */}

                <motion.div
                  style={
                    reduceMotion
                      ? undefined
                      : {
                          x: floatingX,
                          y: floatingY,
                          z: 45,
                        }
                  }
                  className="pointer-events-none absolute -right-3 top-[24%] z-20 hidden sm:block lg:-right-9"
                >
                  <div className="flex items-center gap-3 rounded-2xl border border-brand-border bg-card/90 p-3.5 shadow-[0_16px_40px_-15px_rgba(15,23,42,0.25)] backdrop-blur-xl lg:px-5 lg:py-4">

                    {/* Icon */}
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-primary/10 text-primary lg:size-12">
                      <GraduationCap
                        size={23}
                        strokeWidth={1.7}
                      />
                    </div>

                    {/* Information */}
                    <div className="space-y-1">
                      <p className="text-sm font-semibold tracking-tight text-brand-text">
                        Keep learning
                      </p>

                      <p className="text-[11px] text-brand-text-muted sm:text-xs">
                        Build your future
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* =====================================
                    FLOATING FLEXIBILITY CARD
                ====================================== */}

                <motion.div
                  style={
                    reduceMotion
                      ? undefined
                      : {
                          x: floatingX,
                          y: floatingY,
                          z: 35,
                        }
                  }
                  className="pointer-events-none absolute -bottom-5 left-3 z-20 sm:-bottom-6 sm:-left-4 lg:-left-8"
                >
                  <div className="flex items-center gap-2.5 rounded-xl border border-brand-border bg-card/90 px-3 py-2.5 shadow-[0_12px_30px_-12px_rgba(15,23,42,0.25)] backdrop-blur-xl sm:gap-3 sm:px-4 sm:py-3">

                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-10">
                      <PlayCircle
                        size={20}
                        strokeWidth={1.7}
                      />
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-brand-text sm:text-[13px]">
                        Learn at your pace
                      </p>

                      <p className="hidden text-[11px] text-brand-text-muted sm:block">
                        Flexible learning experience
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}