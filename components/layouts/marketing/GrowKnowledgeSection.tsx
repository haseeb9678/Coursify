
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  UserCheck,
  Layers3,
  Compass,
  ShieldCheck,
  Sparkles,
  GraduationCap,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";

const knowledgeFeatures = [
  {
    id: "instructors",
    title: "World-Class Instructors",
    description:
      "Learn from industry-recognized practitioners and educators who bring real-world experience into every lesson.",
    icon: UserCheck,
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Professional instructors collaborating in a modern workspace",
    tag: "Expert Mentorship",
    highlight: "Learn from industry professionals",
  },
  {
    id: "projects",
    title: "Practical Projects",
    description:
      "Turn knowledge into experience by building practical projects and developing a portfolio that demonstrates your skills.",
    icon: Layers3,
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Students working together on a practical digital project",
    tag: "Learn by Doing",
    highlight: "Build skills through real projects",
  },
  {
    id: "career",
    title: "Career Guidance",
    description:
      "Prepare for your next opportunity with career-focused learning, interview preparation, and professional development.",
    icon: Compass,
    image:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Career mentor discussing professional development with a learner",
    tag: "Career Development",
    highlight: "Move confidently toward your goals",
  },
  {
    id: "certificates",
    title: "Verified Certificates",
    description:
      "Showcase your achievements with course completion certificates that you can share with your professional network.",
    icon: ShieldCheck,
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Student working on academic achievements and learning documents",
    tag: "Recognize Your Growth",
    highlight: "Make your achievements visible",
  },
];

export default function GrowKnowledgeSection() {
  const [activeFeature, setActiveFeature] = useState(knowledgeFeatures[0]);

  return (
    <section className="relative isolate overflow-hidden py-16 sm:py-20 lg:py-24">
      {/* Ambient background */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-accent/[0.09] blur-[120px] sm:size-[560px]" />

      <div className="w-full px-4 sm:px-6">

        {/* Section heading */}
        <div className="mx-auto mb-14 max-w-2xl space-y-4 text-center sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-soft-border bg-brand-soft px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-brand-primary">
            <Sparkles size={14} />
            Mentorship & Excellence
          </div>

          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-brand-text sm:text-[34px] lg:text-[38px]">
            Grow Your Knowledge With{" "}
            <span className="text-brand-primary">
              Industry Experts
            </span>
          </h2>

          <p className="mx-auto max-w-xl text-sm leading-7 text-brand-text-muted sm:text-[15px]">
            Go beyond traditional learning. Gain practical knowledge,
            learn from experienced professionals, and build skills
            that prepare you for the real world.
          </p>
        </div>

        {/* Main feature layout */}
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">

          {/* Left features */}
          <div className="space-y-4 lg:col-span-4">
            {knowledgeFeatures.slice(0, 2).map((feature) => {
              const Icon = feature.icon;
              const isActive = activeFeature.id === feature.id;

              return (
                <button
                  key={feature.id}
                  type="button"
                  onClick={() => setActiveFeature(feature)}
                  aria-pressed={isActive}
                  className={`group w-full rounded-2xl border p-5 text-left transition-all duration-300 sm:p-6 lg:text-right ${
                    isActive
                      ? "border-brand-soft-border bg-brand-soft shadow-md shadow-blue-500/[0.05]"
                      : "border-transparent bg-transparent hover:border-brand-border hover:bg-card hover:shadow-sm"
                  }`}
                >
                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <div
                      className={`flex size-12 items-center justify-center rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-brand-primary text-white shadow-lg shadow-blue-500/20"
                          : "bg-brand-soft text-brand-primary group-hover:bg-brand-primary group-hover:text-white"
                      }`}
                    >
                      <Icon size={22} />
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-brand-text sm:text-lg">
                        {feature.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-brand-text-muted">
                        {feature.description}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold transition-colors ${
                        isActive
                          ? "text-brand-primary"
                          : "text-brand-text-muted group-hover:text-brand-primary"
                      }`}
                    >
                      {isActive ? "Currently selected" : "Explore feature"}
                      <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Center interactive image */}
          <div className="relative mx-auto w-full max-w-[350px] lg:col-span-4 lg:max-w-none">
            {/* Decorative rings */}
            <div className="absolute -inset-4 rounded-[32px] border border-brand-soft-border/70" />
            <div className="absolute -inset-8 rounded-[40px] border border-brand-border/40" />

            <div className="relative h-[390px] overflow-hidden rounded-[24px] border-[5px] border-white bg-brand-soft shadow-2xl shadow-blue-950/10 sm:h-[440px]">
              <Image
                key={activeFeature.id}
                src={activeFeature.image}
                alt={activeFeature.imageAlt}
                fill
                priority={false}
                sizes="(max-width: 1023px) 90vw, 30vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />

              {/* Image gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />

              {/* Image top badge */}
              <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/90 px-3 py-2 text-[11px] font-bold text-brand-text shadow-lg backdrop-blur-md">
                <span className="size-2 rounded-full bg-emerald-500" />
                Discover your potential
              </div>

              {/* Image bottom content */}
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-primary/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                  <Sparkles size={12} />
                  {activeFeature.tag}
                </div>

                <h3 className="text-2xl font-extrabold leading-tight text-white">
                  {activeFeature.highlight}
                </h3>

                <p className="mt-2 text-xs leading-5 text-white/75">
                  Every step brings you closer to your goals.
                </p>
              </div>
            </div>

            {/* Floating learning badge */}
            <div className="absolute -right-3 top-1/3 flex items-center gap-2.5 rounded-xl border border-brand-border/70 bg-white p-3 shadow-xl sm:-right-8">
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
            </div>

            {/* Floating play badge */}
            <div className="absolute -bottom-4 -left-3 flex items-center gap-2 rounded-xl border border-brand-border/70 bg-white px-3 py-2.5 shadow-xl sm:-left-7">
              <PlayCircle size={19} className="text-brand-primary" />
              <span className="text-xs font-bold text-brand-text">
                Learn at your pace
              </span>
            </div>
          </div>

          {/* Right features */}
          <div className="space-y-4 lg:col-span-4">
            {knowledgeFeatures.slice(2, 4).map((feature) => {
              const Icon = feature.icon;
              const isActive = activeFeature.id === feature.id;

              return (
                <button
                  key={feature.id}
                  type="button"
                  onClick={() => setActiveFeature(feature)}
                  aria-pressed={isActive}
                  className={`group w-full rounded-2xl border p-5 text-left transition-all duration-300 sm:p-6 ${
                    isActive
                      ? "border-brand-soft-border bg-brand-soft shadow-md shadow-blue-500/[0.05]"
                      : "border-transparent bg-transparent hover:border-brand-border hover:bg-card hover:shadow-sm"
                  }`}
                >
                  <div className="flex flex-col items-start gap-3">
                    <div
                      className={`flex size-12 items-center justify-center rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-brand-primary text-white shadow-lg shadow-blue-500/20"
                          : "bg-brand-soft text-brand-primary group-hover:bg-brand-primary group-hover:text-white"
                      }`}
                    >
                      <Icon size={22} />
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-brand-text sm:text-lg">
                        {feature.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-brand-text-muted">
                        {feature.description}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold transition-colors ${
                        isActive
                          ? "text-brand-primary"
                          : "text-brand-text-muted group-hover:text-brand-primary"
                      }`}
                    >
                      {isActive ? "Currently selected" : "Explore feature"}
                      <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 flex flex-col items-center justify-center gap-4 text-center sm:mt-16">
          <div className="flex items-center gap-2 text-xs font-medium text-brand-text-muted">
            <CheckCircle2 size={15} className="text-brand-primary" />
            Designed to help you learn and grow
          </div>

          <Link
            href="/courses"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/15 transition-all duration-300 hover:-translate-y-1 hover:bg-brand-primary-hover hover:shadow-xl"
          >
            Explore Learning Opportunities
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
