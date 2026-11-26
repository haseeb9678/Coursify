"use client";

import {
  useCallback,
  useEffect,
  useState,
  type PointerEvent,
} from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Quote,
  Star,
} from "lucide-react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import MotionReveal from "@/components/layouts/marketing/MotionReveal";

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  review: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export default function TestimonialsSection({
  testimonials,
}: TestimonialsSectionProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Writes each slide's distance from the center as CSS vars (coverflow depth)
  const updateDepth = useCallback(
    (emblaApi: NonNullable<CarouselApi>) => {
      if (shouldReduceMotion) return;

      const rootRect = emblaApi.rootNode().getBoundingClientRect();
      const rootCenter = rootRect.left + rootRect.width / 2;
      const half = rootRect.width / 2 || 1;

      emblaApi.slideNodes().forEach((node) => {
        const rect = node.getBoundingClientRect();
        const raw = (rect.left + rect.width / 2 - rootCenter) / half;
        const p = Math.max(-1.2, Math.min(1.2, raw));

        node.style.setProperty("--p", p.toFixed(3));
        node.style.setProperty("--abs", Math.abs(p).toFixed(3));
      });
    },
    [shouldReduceMotion],
  );

  useEffect(() => {
    if (!api) return;

    const updateCarousel = () => {
      setSelectedIndex(api.selectedScrollSnap());
      setSnapCount(api.scrollSnapList().length);
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    const onScroll = () => updateDepth(api);

    updateCarousel();
    onScroll();

    api.on("select", updateCarousel);
    api.on("reInit", updateCarousel);
    api.on("scroll", onScroll);
    api.on("reInit", onScroll);
    api.on("resize", onScroll);

    return () => {
      api.off("select", updateCarousel);
      api.off("reInit", updateCarousel);
      api.off("scroll", onScroll);
      api.off("reInit", onScroll);
      api.off("resize", onScroll);
    };
  }, [api, updateDepth]);

  if (!testimonials.length) return null;

  return (
    <section className="relative overflow-hidden py-9">
      <div className="w-full px-4 sm:px-6 xl:px-10 2xl:px-15">

        {/* Section Heading */}
        <MotionReveal className="mx-auto mb-10 flex max-w-2xl flex-col items-center gap-3 text-center sm:mb-12">
          <h2 className="text-2xl leading-tight font-extrabold tracking-tight text-brand-text sm:text-3xl lg:text-4xl">
            What Our Students{" "}
            <span className="bg-gradient-to-r from-brand-primary to-indigo-500 bg-clip-text text-transparent">
              Say
            </span>
          </h2>

          <p className="max-w-xl text-sm leading-relaxed text-brand-text-muted sm:text-base">
            Discover how our learning experience helps students build
            practical skills and move closer to their career goals.
          </p>
        </MotionReveal>

        {/* Testimonials Carousel */}
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: false,
            containScroll: "trimSnaps",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 py-6">
            {testimonials.map((testimonial, index) => (
              <CarouselItem
                key={testimonial.id}
                className="min-w-0 basis-full pl-4 sm:basis-1/2 lg:basis-1/3"
              >
                <MotionReveal
                  className="h-full"
                  delay={index * 0.05}
                  variant="scale"
                >
                  <TestimonialCard testimonial={testimonial} />
                </MotionReveal>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Carousel Controls + Pagination */}
        <div className="mt-6 flex items-center justify-center gap-4 sm:mt-8">
          <button
            type="button"
            onClick={() => api?.scrollPrev()}
            disabled={!canScrollPrev}
            aria-label="Previous testimonials"
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-brand-border bg-card text-brand-text transition-all duration-200 hover:border-brand-primary hover:bg-brand-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-brand-border disabled:hover:bg-card disabled:hover:text-brand-text"
          >
            <ArrowLeft size={17} />
          </button>

          {snapCount > 1 && (
            <div
              className="flex max-w-[60vw] flex-wrap items-center justify-center gap-2"
              aria-label="Testimonial slides"
            >
              {Array.from({ length: snapCount }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => api?.scrollTo(index)}
                  aria-label={`Go to testimonial slide ${index + 1}`}
                  aria-current={selectedIndex === index ? "true" : undefined}
                  className={`h-2 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none ${
                    selectedIndex === index
                      ? "w-7 bg-brand-primary"
                      : "w-2 bg-brand-border hover:bg-brand-primary/50"
                  }`}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => api?.scrollNext()}
            disabled={!canScrollNext}
            aria-label="Next testimonials"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-primary text-primary-foreground transition-all duration-200 hover:bg-brand-primary-hover focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowRight size={17} />
          </button>
        </div>

      </div>
    </section>
  );
}

/* -------------------------------------------------------
   Reusable Testimonial Card (3D tilt + depth layers)
------------------------------------------------------- */

function TestimonialCard({
  testimonial,
}: {
  testimonial: Testimonial;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const initials = testimonial.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Pointer tilt
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const springConfig = { stiffness: 170, damping: 20, mass: 0.6 };
  const springX = useSpring(pointerX, springConfig);
  const springY = useSpring(pointerY, springConfig);

  const rotateX = useTransform(springY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8]);

  const glareX = useTransform(springX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(springY, [-0.5, 0.5], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(260px circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.7), transparent 70%)`;
  const glareOpacity = useSpring(0, { stiffness: 140, damping: 24 });

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || event.pointerType !== "mouse") return;

    const rect = event.currentTarget.getBoundingClientRect();

    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
    glareOpacity.set(1);
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
    glareOpacity.set(0);
  };

  const depth = (value: number) => (shouldReduceMotion ? 0 : value);

  return (
    // Coverflow layer: driven by the slider position via --p / --abs
    <div
      className="h-full"
      style={
        shouldReduceMotion
          ? undefined
          : {
              transform:
                "perspective(1200px) rotateY(calc(var(--p, 0) * -12deg)) scale(calc(1 - var(--abs, 0) * 0.06)) translateZ(calc(var(--abs, 0) * -30px))",
              opacity: "calc(1 - var(--abs, 0) * 0.22)",
              willChange: "transform",
            }
      }
    >
      {/* Pointer tilt layer */}
      <motion.div
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        whileHover={shouldReduceMotion ? undefined : { y: -6 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        style={
          shouldReduceMotion
            ? undefined
            : {
                rotateX,
                rotateY,
                transformPerspective: 1000,
                transformStyle: "preserve-3d",
              }
        }
        className="h-full"
      >
        <article
          style={{ transformStyle: "preserve-3d" }}
          className="group relative flex h-full min-h-[300px] flex-col justify-between gap-6 rounded-2xl 
          border border-primary/30 bg-brand-soft p-5 shadow-[0_10px_28px_-18px_rgba(37,99,235,0.35)]
           transition-[border-color,box-shadow] duration-300 hover:border-primary/30
            hover:shadow-[0_28px_50px_-24px_rgba(37,99,235,0.45)] sm:p-6"
        >
          {/* Clipped backdrop: oversized quote mark + cursor light */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
            <Quote
              strokeWidth={1.2}
              className="absolute -right-4 -bottom-6 size-36 rotate-6 fill-brand-primary/[0.06] text-brand-primary/10 transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-110"
            />

            <motion.div
              style={{ background: glare, opacity: glareOpacity }}
              className="absolute inset-0"
            />
          </div>

          <div className="relative space-y-4">
            {/* Quote tile + rating */}
            <div className="flex items-center justify-between gap-3">
              <motion.div
                style={{ z: depth(34) }}
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-primary-foreground shadow-lg shadow-brand-primary/30"
              >
                <Quote size={18} className="fill-white/90" />
              </motion.div>

              <div
                className="flex items-center gap-0.5"
                aria-label={`${testimonial.rating} out of 5 stars`}
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={15}
                    className={
                      index < testimonial.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-brand-border"
                    }
                  />
                ))}
              </div>
            </div>

            {/* Review */}
            <motion.p
              style={{ z: depth(12) }}
              className="text-sm leading-7 text-brand-text sm:text-[15px]"
            >
              “{testimonial.review}”
            </motion.p>
          </div>

          {/* Student Information (white panel floats above the card) */}
          <motion.div
            style={{ z: depth(24) }}
            className="relative flex items-center gap-3.5 rounded-xl border border-brand-border bg-card/95 p-3 shadow-sm backdrop-blur-sm"
          >
            <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-card bg-brand-primary/10 text-sm font-bold text-brand-primary shadow-sm ring-1 ring-brand-soft-border sm:size-12">
              {!imageFailed ? (
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                initials
              )}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-brand-text">
                {testimonial.name}
              </h3>

              <p className="mt-0.5 text-xs leading-relaxed text-brand-text-muted">
                {testimonial.role} at {testimonial.company}
              </p>
            </div>
          </motion.div>
        </article>
      </motion.div>
    </div>
  );
}