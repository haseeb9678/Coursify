
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
} from "lucide-react";

interface PromotionSection {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonHref: string;
  image: string;
  imageAlt: string;
  imageLabel: string;
  imageDescription: string;
  icon: typeof Building2;
}

const promotionSections: PromotionSection[] = [
  {
    id: "business",
    eyebrow: "Coursify for Teams",
    title: "Upskill Your Team With Coursify Business",
    description:
      "Empower your organization with access to professional tech, design, and leadership courses tailored to your company's learning and development goals.",
    features: [
      "Custom learning paths and team progress analytics",
      "Dedicated enterprise support and learning management",
    ],
    buttonText: "Explore Business Solutions",
    buttonHref: "/business",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "A professional team collaborating around a table",
    imageLabel: "Better teams start with better learning",
    imageDescription: "Build skills. Grow together.",
    icon: Building2,
  },
  {
    id: "instructor",
    eyebrow: "Teach With Us",
    title: "Become An Instructor & Teach Thousands Of Students",
    description:
      "Share your expertise with a wider audience. Create engaging courses, inspire learners, and turn your knowledge into meaningful learning experiences.",
    features: [
      "Earn revenue from your course enrollments",
      "Course creation guidance and access to a global audience",
    ],
    buttonText: "Start Teaching Today",
    buttonHref: "/teach",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=85",
    imageAlt: "An instructor preparing digital learning content",
    imageLabel: "Your knowledge can inspire others",
    imageDescription: "Teach. Inspire. Make an impact.",
    icon: GraduationCap,
  },
];

export default function BusinessInstructorSection() {
  return (
    <section className="relative isolate overflow-hidden py-16 sm:py-20 lg:py-24">
      {/* Ambient Background */}
      <div className="pointer-events-none absolute -left-40 top-20 -z-10 size-[420px] rounded-full bg-brand-accent/[0.07] blur-[120px]" />

      <div className="w-full space-y-20 px-4 sm:px-6 lg:space-y-28">

        {promotionSections.map((section, index) => {
          const Icon = section.icon;
          const imageFirst = index === 1;

          return (
            <div
              key={section.id}
              className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              {/* Image */}
              <div
                className={`relative min-w-0 ${
                  imageFirst ? "lg:order-1" : "lg:order-2"
                }`}
              >
                <div className="group relative isolate overflow-hidden rounded-2xl border border-brand-border/70 bg-brand-soft shadow-xl shadow-brand-primary/[0.06]">

                  <div className="relative aspect-[5/4] overflow-hidden sm:aspect-[16/10] lg:aspect-[5/4]">
                    <Image
                      src={section.image}
                      alt={section.imageAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 550px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Image Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/75 via-[#111827]/10 to-transparent" />

                    {/* Image Bottom Content */}
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                      <div className="flex items-center gap-2 text-white">
                        <span className="flex size-9 items-center justify-center rounded-lg border border-white/20 bg-white/15 backdrop-blur-md">
                          <Icon size={19} />
                        </span>

                        <span className="text-xs font-semibold tracking-wide text-white/90">
                          {section.eyebrow}
                        </span>
                      </div>

                      <h3 className="mt-4 max-w-sm text-xl font-bold leading-snug text-white sm:text-2xl">
                        {section.imageLabel}
                      </h3>

                      <p className="mt-1 text-sm text-white/75">
                        {section.imageDescription}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Decorative Background Shape */}
                <div className="pointer-events-none absolute -bottom-5 -right-5 -z-10 size-28 rounded-2xl border border-brand-soft-border bg-brand-soft/60" />
              </div>

              {/* Content */}
              <div
                className={`flex flex-col ${
                  imageFirst ? "lg:order-2" : "lg:order-1"
                }`}
              >
                {/* Eyebrow */}
                <div className="mb-5 flex items-center gap-2">
                  <span className="h-1.5 w-7 rounded-full bg-brand-primary" />
                  <span className="text-xs font-bold uppercase tracking-[0.13em] text-brand-primary">
                    {section.eyebrow}
                  </span>
                </div>

                {/* Heading */}
                <h2 className="max-w-xl text-3xl font-extrabold leading-[1.2] tracking-tight text-brand-text sm:text-[34px] lg:text-[38px]">
                  {section.title}
                </h2>

                {/* Description */}
                <p className="mt-5 max-w-lg text-[15px] leading-7 text-brand-text-muted">
                  {section.description}
                </p>

                {/* Features */}
                <ul className="mt-7 space-y-4">
                  {section.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3"
                    >
                      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-primary">
                        <Check size={14} strokeWidth={2.5} />
                      </span>

                      <span className="text-sm font-semibold leading-6 text-brand-text">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="mt-8">
                  <Link
                    href={section.buttonHref}
                    className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-primary/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-primary-hover hover:shadow-lg hover:shadow-brand-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
                  >
                    {section.buttonText}

                    <ArrowRight
                      size={17}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
