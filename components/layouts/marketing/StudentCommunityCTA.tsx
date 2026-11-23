
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Globe2,
  GraduationCap,
  Users,
  Sparkles,
  BookOpen,
  MoveUpRight,
} from "lucide-react";

import MotionReveal from "@/components/layouts/marketing/MotionReveal";

const communityStats = [
  {
    value: "12,000+",
    label: "Active learners",
    icon: Users,
  },
  {
    value: "120+",
    label: "Countries reached",
    icon: Globe2,
  },
  {
    value: "500+",
    label: "Expert courses",
    icon: GraduationCap,
  },
];

const studentInitials = [
  { id: 1, initials: "SA", color: "bg-blue-100 text-blue-700" },
  { id: 2, initials: "AM", color: "bg-violet-100 text-violet-700" },
  { id: 3, initials: "RK", color: "bg-amber-100 text-amber-700" },
  { id: 4, initials: "JM", color: "bg-emerald-100 text-emerald-700" },
];

export default function StudentCommunityCTA() {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div className="w-full px-4 sm:px-6">

        {/* Main CTA */}
        <div className="relative isolate grid overflow-hidden rounded-3xl border border-brand-border/70 bg-[#F4F7FF] shadow-sm lg:min-h-[490px] lg:grid-cols-[1.05fr_0.95fr]">

          {/* Decorative background */}
          <div className="pointer-events-none absolute -left-32 -top-32 -z-10 size-[420px] rounded-full bg-blue-300/20 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-40 left-1/3 -z-10 size-[400px] rounded-full bg-indigo-300/20 blur-[110px]" />

          {/* Content */}
          <MotionReveal
            className="relative z-10 flex flex-col justify-center p-7 sm:p-10 lg:p-12 xl:p-14"
            delay={0.05}
          >

            {/* Eyebrow */}
            <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-blue-200/80 bg-white/80 px-3.5 py-2 text-xs font-bold tracking-wide text-brand-primary shadow-sm">
              <Sparkles size={14} />
              LEARN TOGETHER, GROW TOGETHER
            </div>

            {/* Heading */}
            <h2 className="max-w-xl text-[30px] font-extrabold leading-[1.2] tracking-tight text-brand-text sm:text-4xl lg:text-[42px]">
              Great Things Happen When We{" "}
              <span className="text-brand-primary">
                Learn Together.
              </span>
            </h2>

            {/* Description */}
            <p className="mt-5 max-w-lg text-sm leading-7 text-brand-text-muted sm:text-[15px]">
              Become part of a growing learning community. Connect with
              ambitious learners, discover expert-led courses, and develop
              practical skills to move your career forward.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1 hover:bg-brand-primary-hover hover:shadow-xl"
              >
                Join Our Community
                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/courses"
                className="group inline-flex items-center gap-2 rounded-xl px-3 py-3.5 text-sm font-bold text-brand-text transition-colors hover:text-brand-primary"
              >
                Explore Courses
                <MoveUpRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>

            {/* Learner social proof */}
            <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-blue-200/60 pt-7">
              <div className="flex -space-x-3">
                {studentInitials.map((student) => (
                  <div
                    key={student.id}
                    className={`flex size-10 items-center justify-center rounded-full border-[3px] border-[#F4F7FF] text-[10px] font-extrabold ${student.color}`}
                  >
                    {student.initials}
                  </div>
                ))}
                <div className="flex size-10 items-center justify-center rounded-full border-[3px] border-[#F4F7FF] bg-brand-primary text-[10px] font-bold text-white">
                  +K
                </div>
              </div>

              <div>
                <p className="text-sm font-extrabold text-brand-text">
                  12,000+ learners
                </p>
                <p className="mt-0.5 text-xs text-brand-text-muted">
                  Building their future with Coursify
                </p>
              </div>
            </div>
          </MotionReveal>

          {/* Image area */}
          <MotionReveal
            className="relative min-h-[300px] overflow-hidden sm:min-h-[390px] lg:min-h-full"
            variant="fadeLeft"
            delay={0.15}
          >

            {/* Image fallback */}
            {imageFailed ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 via-indigo-100 to-blue-50">
                <div className="flex size-20 items-center justify-center rounded-3xl bg-white text-brand-primary shadow-xl">
                  <GraduationCap size={42} />
                </div>
                <p className="mt-4 text-sm font-bold text-brand-text">
                  Your learning journey starts here
                </p>
              </div>
            ) : (
              <Image
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=85"
                alt="University graduates celebrating their achievements"
                fill
                priority={false}
                sizes="(max-width: 1023px) 100vw, 45vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
                onError={() => setImageFailed(true)}
              />
            )}

            {/* Image overlays */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/5" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent to-black/[0.04]" />

            {/* Floating card */}
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/60 bg-white/90 p-4 shadow-xl shadow-black/10 backdrop-blur-xl sm:bottom-8 sm:left-8 sm:right-auto sm:max-w-[290px] sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-primary">
                  <BookOpen size={22} />
                </div>

                <div>
                  <p className="text-sm font-extrabold text-brand-text">
                    Learn. Grow. Succeed.
                  </p>
                  <p className="mt-1 text-xs text-brand-text-muted">
                    One course at a time.
                  </p>
                </div>
              </div>
            </div>

            {/* Top image badge */}
            <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-white/40 bg-white/90 px-3 py-2 text-xs font-bold text-brand-text shadow-lg backdrop-blur-md sm:right-8 sm:top-8">
              <span className="size-2 rounded-full bg-emerald-500" />
              A community that inspires
            </div>
          </MotionReveal>
        </div>

        {/* Statistics */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {communityStats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <MotionReveal
                key={stat.label}
                className="h-full"
                delay={index * 0.07}
                hover
              >
                <div className="group flex items-center gap-4 rounded-2xl border border-brand-border/70 bg-card p-5 transition-all duration-300 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/[0.05] sm:px-6">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-primary transition-colors duration-300 group-hover:bg-brand-primary group-hover:text-white">
                    <Icon size={22} />
                  </div>

                  <div>
                    <p className="text-xl font-extrabold tracking-tight text-brand-text">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs font-medium text-brand-text-muted">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </MotionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
