
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
  {
    title: "Expert Mentors",
    description: "Industry veterans",
    icon: Award,
  },
  {
    title: "Lifetime Access",
    description: "Revisit anytime",
    icon: InfinityIcon,
  },
  {
    title: "Certified Courses",
    description: "Verified credentials",
    icon: BadgeCheck,
  },
  {
    title: "Interactive Quizzes",
    description: "Test your mastery",
    icon: CircleHelp,
  },
  {
    title: "Global Network",
    description: "Connect with learners",
    icon: Globe,
  },
  {
    title: "24/7 Support",
    description: "Dedicated assistance",
    icon: Headphones,
  },
];

export default function WhyChooseUsSection() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -left-24 top-1/2 size-[380px] -translate-y-1/2 rounded-full bg-brand-accent/[0.08] blur-[110px] sm:size-[480px] sm:blur-[130px]" />

      <div className="relative z-10 w-full px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Side: Heading and Benefits */}
          <div className="space-y-6 lg:col-span-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                Why Choose Us
              </span>

              <h2 className="mt-2 text-2xl font-extrabold leading-tight text-brand-text sm:text-3xl lg:text-[34px]">
                Creating A Community Of Life Long Learners
              </h2>

              <p className="mt-4 text-[15px] leading-relaxed text-brand-text-muted">
                We believe education should adapt to your life—not the other
                way around. Join an active global network of ambitious
                learners building real-world portfolios.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-5 pt-1">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;

                return (
                  <MotionReveal
                    key={benefit.title}
                    delay={index * 0.08}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-primary">
                        <Icon size={21} />
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-brand-text">
                          {benefit.title}
                        </h3>

                        <p className="mt-1 text-sm leading-relaxed text-brand-text-muted">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </MotionReveal>
                );
              })}
            </div>
          </div>

          {/* Right Side: Feature Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:col-span-7">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <MotionReveal
                  key={feature.title}
                  className="h-full"
                  delay={index * 0.06}
                  variant="scale"
                  hover
                >
                  <div className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border border-brand-border/80 bg-card p-4 text-center shadow-sm transition-all duration-300 hover:shadow-lg sm:min-h-[175px] sm:p-6">
                    <div className="mb-3.5 flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-primary">
                      <Icon size={24} />
                    </div>

                    <h3 className="text-sm font-bold text-brand-text">
                      {feature.title}
                    </h3>

                    <p className="mt-1 text-xs leading-relaxed text-brand-text-muted">
                      {feature.description}
                    </p>
                  </div>
                </MotionReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
