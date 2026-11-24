"use client";

import Image from "next/image";
import { Sparkles, GraduationCap, PlayCircle, Award } from "lucide-react";
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

/* Pointer-driven 3D tilt (spring smoothed) + moving glare */
function useTilt(maxDeg: number, enabled: boolean) {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const spring = { stiffness: 190, damping: 20, mass: 0.7 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);

  const rotateX = useTransform(sy, [0, 1], [maxDeg, -maxDeg]);
  const rotateY = useTransform(sx, [0, 1], [-maxDeg, maxDeg]);

  const glareX = useTransform(sx, [0, 1], [0, 100]);
  const glareY = useTransform(sy, [0, 1], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.32), transparent 55%)`;
  const glareOpacity = useSpring(0, { stiffness: 160, damping: 24 });

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!enabled || e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
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
  const tilt = useTilt(9, !reduceMotion);

  // Image drifts slightly against the tilt for inner parallax
  const imgX = useTransform(tilt.sx, [0, 1], [10, -10]);
  const imgY = useTransform(tilt.sy, [0, 1], [10, -10]);

  return (
    <section className="relative isolate overflow-hidden py-16 sm:py-20 lg:py-20 pt-3!">
      {/* Ambient background */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[420px] 
      -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-accent/[0.09] blur-[120px] sm:size-[560px]"
      />

      <div className="w-full px-4 sm:px-6 xl:px-10 2xl:px-15">
        {/* Section heading */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto mb-14 max-w-2xl space-y-4 text-center sm:mb-16"
        >
          <span className="rounded-full border border-primary/30  max-w-max mx-auto
                 bg-brand-soft px-6 flex items-center justify-center gap-2
  py-3 text-sm font-extrabold uppercase tracking-[0.1em] text-brand-primary">
    <Award/>
    Mentorship & Excellence
  </span>

          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-brand-text sm:text-[34px] lg:text-[38px]">
            Grow Your Knowledge With{" "}
            <span className="text-brand-primary">Industry Experts</span>
          </h2>

          <p className="mx-auto max-w-xl text-sm leading-7 text-brand-text-muted sm:text-[15px]">
            Learn from professionals, build practical skills, and prepare
            yourself for the real world.
          </p>
        </motion.div>

        {/* Center 3D card */}
        <div className="max-w-180 mx-auto">
          <motion.div
            initial={
              reduceMotion ? false : { opacity: 0, y: 45, scale: 0.9, rotateX: 14 }
            }
            whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.9,
              delay: 0.15,
              type: "spring",
              stiffness: 100,
              damping: 18,
            }}
            style={{ transformPerspective: 1400 }}
            className="relative mx-auto w-full max-w-[350px] lg:col-span-4 lg:max-w-none"
          >
            {/* Tilt layer: everything inside shares one 3D space */}
            <motion.div
              onPointerMove={tilt.onPointerMove}
              onPointerLeave={tilt.onPointerLeave}
              style={{
                rotateX: tilt.rotateX,
                rotateY: tilt.rotateY,
                transformStyle: "preserve-3d",
                transformPerspective: 1200,
              }}
              className="relative"
            >
              {/* Decorative rings (sit behind the frame) */}
              <motion.div
                animate={reduceMotion ? undefined : { rotate: 360 }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                style={{ z: reduceMotion ? 0 : -30 }}
                className="pointer-events-none absolute -inset-4 rounded-[32px] border border-brand-soft-border/90"
              />

              <motion.div
                style={{ z: reduceMotion ? 0 : -60 }}
                className="pointer-events-none absolute -inset-8 rounded-[40px] border border-brand-border/80"
              />

              {/* 3D image frame */}
              <div
                style={{ transform: "translateZ(0)" }}
                className="relative h-[390px] overflow-hidden rounded-[24px] border-[5px] border-white bg-brand-soft shadow-[0_25px_60px_rgba(15,23,42,0.18)] sm:h-[440px]"
              >
                {/* Image with inner parallax */}
                <motion.div
                  style={
                    reduceMotion ? undefined : { x: imgX, y: imgY, scale: 1.1 }
                  }
                  className="absolute inset-0"
                >
                  <Image
                    src={feature.image}
                    alt={feature.imageAlt}
                    fill
                    sizes="(max-width: 1023px) 90vw, 30vw"
                    className="object-cover"
                  />
                </motion.div>

                {/* Image gradient */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent" />

                {/* Cursor glare */}
                <motion.div
                  style={{ background: tilt.glare, opacity: tilt.glareOpacity }}
                  className="pointer-events-none absolute inset-0 mix-blend-soft-light"
                />

                {/* Top badge */}
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/90 px-3 py-2 text-[11px] font-bold text-brand-text shadow-lg backdrop-blur-md">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  Discover your potential
                </div>

                {/* Bottom content */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-primary/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                    <Sparkles size={12} />
                    {feature.tag}
                  </div>

                  <h3 className="text-2xl font-extrabold leading-tight text-white">
                    {feature.highlight}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-white/75">
                    Every step brings you closer to your goals.
                  </p>
                </div>

                {/* Inner image highlight */}
                <div className="pointer-events-none absolute inset-0 rounded-[19px] border border-white/20" />
              </div>

              {/* Floating learning badge (floats in front of the frame) */}
              <motion.div
                style={{ z: reduceMotion ? 0 : 90 }}
                className="absolute -right-3 top-1/3 sm:-right-8"
              >
                <motion.div
                  animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center gap-2.5 rounded-xl border border-brand-border/70 bg-white p-3 shadow-[0_20px_40px_rgba(15,23,42,0.18)]"
                >
                  <div className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand-primary">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-brand-text">
                      Keep Learning
                    </p>
                    <p className="text-[10px] text-brand-text-muted">
                      Build your future
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Floating play badge */}
              <motion.div
                style={{ z: reduceMotion ? 0 : 65 }}
                className="absolute -bottom-4 -left-3 sm:-left-7"
              >
                <motion.div
                  animate={reduceMotion ? undefined : { y: [0, 7, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center gap-2 rounded-xl border border-brand-border/70 bg-white px-3 py-2.5 shadow-[0_18px_36px_rgba(15,23,42,0.16)]"
                >
                  <PlayCircle size={19} className="text-brand-primary" />
                  <span className="text-xs font-bold text-brand-text">
                    Learn at your pace
                  </span>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}