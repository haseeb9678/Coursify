
"use client";

import {
  CalendarClock,
  Wallet,
  Award,
  Infinity as InfinityIcon,
  BadgeCheck,
  CircleHelp,
  Globe,
  Headphones,
  type LucideIcon,
} from "lucide-react";

import { motion, useReducedMotion } from "motion/react";
import MotionReveal from "@/components/layouts/marketing/MotionReveal";

interface Benefit {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

const benefits: Benefit[] = [
  {
    title: "Flexible Schedule",
    description:
      "Learn at your own pace with 24/7 on-demand access across desktop, tablet, and mobile devices.",
    icon: CalendarClock,
  },
  {
    title: "Pocket Friendly",
    description:
      "Transparent, affordable pricing with one-time course purchases and no hidden subscription fees.",
    icon: Wallet,
  },
];

const features: Feature[] = [
  { title: "Expert Mentors", description: "Industry veterans", icon: Award },
  { title: "Lifetime Access", description: "Revisit anytime", icon: InfinityIcon },
  { title: "Certified Courses", description: "Verified credentials", icon: BadgeCheck },
  { title: "Interactive Quizzes", description: "Test your mastery", icon: CircleHelp },
  { title: "Global Network", description: "Connect with learners", icon: Globe },
  { title: "24/7 Support", description: "Dedicated assistance", icon: Headphones },
];

export default function WhyChooseUsSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden border-y border-brand-primary/[0.07] py-16 sm:py-20">

      {/* Ambient background lighting */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-brand-primary/[0.055] via-brand-primary/[0.025] to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-indigo-500/[0.055] via-brand-primary/[0.025] to-transparent" />

      {/* Soft side glows */}
      <div className="pointer-events-none absolute -left-40 top-1/3 -z-10 size-[420px] rounded-full bg-brand-primary/[0.09] blur-[100px]" />

      <div className="pointer-events-none absolute -right-40 bottom-0 -z-10 size-[380px] rounded-full bg-indigo-400/[0.08] blur-[110px]" />

      <div className="relative z-10 w-full px-4 sm:px-6 xl:px-10 2xl:px-15">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">

          {/* Left: Introduction and Benefits */}
          <div className="space-y-7 lg:col-span-5">
            <MotionReveal>
              <div>
                <span className="inline-flex rounded-full border border-primary/30 bg-brand-soft px-6 py-3 text-[13px] font-extrabold uppercase tracking-[0.16em] text-brand-primary">
                  Why Choose Us
                </span>

                <h2 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-brand-text sm:text-4xl">
                  Creating A Community Of{" "}
                  <span className="bg-gradient-to-r from-brand-primary to-indigo-500 bg-clip-text text-transparent">
                    Life Long Learners
                  </span>
                </h2>

                <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-brand-text-muted">
                  We believe education should adapt to your life—not the other
                  way around. Join a community of ambitious learners.
                </p>
              </div>
            </MotionReveal>

            {/* Benefits */}
            <div className="space-y-5">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;

                return (
                  <MotionReveal key={benefit.title} delay={index * 0.1}>
                    <motion.div
                      whileHover={shouldReduceMotion ? undefined : { x: 5 }}
                      transition={{ duration: 0.25 }}
                      className="group flex items-start gap-4"
                    >
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-brand-soft-border bg-white/80 text-brand-primary shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                        <Icon size={22} />
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-brand-text">
                          {benefit.title}
                        </h3>
                        <p className="mt-1 max-w-md text-sm leading-relaxed text-brand-text-muted">
                          {benefit.description}
                        </p>
                      </div>
                    </motion.div>
                  </MotionReveal>
                );
              })}
            </div>
          </div>

          {/* Right: 3D Feature Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:col-span-7">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <MotionReveal
                  key={feature.title}
                  className="h-full"
                  delay={index * 0.07}
                  variant="scale"
                >
                  <motion.div
                    initial={false}
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : {
                            y: -8,
                            rotateX: 5,
                            rotateY: index % 2 === 0 ? -5 : 5,
                            scale: 1.025,
                          }
                    }
                    transition={{
                      type: "spring",
                      stiffness: 220,
                      damping: 18,
                    }}
                    style={{ transformPerspective: 900 }}
                    className="group relative isolate flex min-h-[165px] h-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-brand-border/70 bg-white/80 p-4 text-center shadow-[0_8px_30px_rgba(37,99,235,0.04)] backdrop-blur-xl transition-all duration-300 hover:border-brand-primary/30 hover:shadow-[0_20px_45px_rgba(37,99,235,0.12)] sm:min-h-[185px] sm:p-6"
                  >
                    {/* Subtle top and bottom card lighting */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-brand-primary/[0.09] to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-indigo-400/[0.07] to-transparent" />

                    {/* Ambient glow */}
                    <div className="pointer-events-none absolute -right-12 -top-12 size-28 rounded-full bg-brand-primary/[0.10] blur-3xl transition-all duration-500 group-hover:bg-brand-primary/[0.18]" />

                    {/* Icon */}
                    <motion.div
                      whileHover={
                        shouldReduceMotion
                          ? undefined
                          : { rotate: 8, scale: 1.12, y: -3 }
                      }
                      transition={{ type: "spring", stiffness: 300 }}
                      className="relative mb-4 flex size-13 items-center justify-center rounded-2xl border border-brand-soft-border bg-gradient-to-br from-white to-brand-soft text-brand-primary shadow-[0_6px_15px_rgba(37,99,235,0.10)]"
                    >
                      <Icon size={25} strokeWidth={1.8} />
                    </motion.div>

                    <h3 className="relative text-sm font-bold text-brand-text transition-colors group-hover:text-brand-primary sm:text-base">
                      {feature.title}
                    </h3>

                    <p className="relative mt-1 text-xs leading-relaxed text-brand-text-muted">
                      {feature.description}
                    </p>

                    {/* Bottom accent */}
                    <div className="absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-primary to-indigo-500 transition-all duration-300 group-hover:w-1/2" />
                  </motion.div>
                </MotionReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
