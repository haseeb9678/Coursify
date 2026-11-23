"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
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

import type { SkillDomain } from "@/features/courses/types/skill-domain.types";

interface SkillDomainsSectionProps {
  domains: SkillDomain[];
}

interface SkillDomainCardProps {
  domain: SkillDomain;
  index: number;
}

/* -------------------------------------------------------------------------- */
/*  Single slide: pointer tilt, glare, image parallax and depth-popped label   */
/* -------------------------------------------------------------------------- */

function SkillDomainCard({ domain, index }: SkillDomainCardProps) {
  const shouldReduceMotion = useReducedMotion();

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const springConfig = { stiffness: 170, damping: 20, mass: 0.6 };
  const springX = useSpring(pointerX, springConfig);
  const springY = useSpring(pointerY, springConfig);

  const rotateX = useTransform(springY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-12, 12]);

  // Photo drifts against the tilt, so the card feels like a window
  const imageX = useTransform(springX, [-0.5, 0.5], [9, -9]);
  const imageY = useTransform(springY, [-0.5, 0.5], [9, -9]);

  const glareX = useTransform(springX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(springY, [-0.5, 0.5], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.38), transparent 58%)`;
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
                "perspective(1100px) rotateY(calc(var(--p, 0) * -14deg)) scale(calc(1 - var(--abs, 0) * 0.07)) translateZ(calc(var(--abs, 0) * -30px))",
              willChange: "transform",
            }
      }
    >
      {/* Entrance layer: card rises up from the floor */}
      <motion.div
        initial={
          shouldReduceMotion ? false : { opacity: 0, y: 34, rotateX: -22 }
        }
        whileInView={
          shouldReduceMotion ? undefined : { opacity: 1, y: 0, rotateX: 0 }
        }
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          type: "spring",
          stiffness: 110,
          damping: 18,
          delay: index * 0.07,
        }}
        style={{ transformPerspective: 1000, transformOrigin: "50% 100%" }}
        className="h-full"
      >
        {/* Pointer tilt layer */}
        <motion.div
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          whileHover={shouldReduceMotion ? undefined : { y: -6 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
          style={
            shouldReduceMotion
              ? undefined
              : {
                  rotateX,
                  rotateY,
                  transformPerspective: 900,
                  transformStyle: "preserve-3d",
                }
          }
          className="h-full"
        >
          <Link
            href={`/courses?category=${encodeURIComponent(domain.slug)}`}
            aria-label={`Explore ${domain.name} courses`}
            style={{ transformStyle: "preserve-3d" }}
            className="group relative block h-[190px] rounded-2xl shadow-[0_8px_22px_-10px_rgba(15,23,42,0.35)] ring-1 ring-black/5 transition-shadow duration-500 hover:shadow-[0_26px_44px_-18px_rgba(37,99,235,0.45)] focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none sm:h-[210px] lg:h-[230px]"
          >
            {/* Clipped media layer */}
            <div className="absolute inset-0 overflow-hidden rounded-[inherit] bg-brand-soft">
              <motion.div
                style={
                  shouldReduceMotion
                    ? undefined
                    : { x: imageX, y: imageY, scale: 1.12 }
                }
                className="absolute inset-0"
              >
                <Image
                  src={domain.image}
                  alt={domain.name}
                  fill
                  sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 20vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </motion.div>

              {/* Legibility gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent transition-opacity duration-500 group-hover:from-black/95" />

              {/* Soft top light */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/20 to-transparent" />

              {/* Cursor glare */}
              <motion.div
                style={{ background: glare, opacity: glareOpacity }}
                className="pointer-events-none absolute inset-0 mix-blend-soft-light"
              />

              {/* Inner border */}
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/15 transition-colors duration-500 group-hover:border-white/40" />
            </div>

            {/* Label + arrow float in front of the photo */}
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3.5 sm:p-4">
              <motion.div
                style={{ z: depth(34) }}
                className="min-w-0 flex-1 text-left"
              >
                <span className="line-clamp-2 text-sm leading-snug font-bold text-white drop-shadow-md sm:text-base">
                  {domain.name}
                </span>

                <span className="mt-2 block h-0.5 w-0 rounded-full bg-white transition-all duration-500 group-hover:w-9" />
              </motion.div>

              <motion.span
                style={{ z: depth(48) }}
                className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md transition-colors duration-300 group-hover:bg-white group-hover:text-brand-primary sm:size-9"
              >
                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-300 group-hover:rotate-45"
                />
              </motion.span>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section                                                                    */
/* -------------------------------------------------------------------------- */

export default function SkillDomainsSection({
  domains,
}: SkillDomainsSectionProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const progressRef = useRef<HTMLSpanElement>(null);

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

    const update = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    const onScroll = () => {
      updateDepth(api);

      if (progressRef.current) {
        const progress = Math.max(0, Math.min(1, api.scrollProgress()));
        progressRef.current.style.width = `${12 + progress * 88}%`;
      }
    };

    update();
    onScroll();

    api.on("select", update);
    api.on("reInit", update);
    api.on("scroll", onScroll);
    api.on("reInit", onScroll);
    api.on("resize", onScroll);

    return () => {
      api.off("select", update);
      api.off("reInit", update);
      api.off("scroll", onScroll);
      api.off("reInit", onScroll);
      api.off("resize", onScroll);
    };
  }, [api, updateDepth]);

  if (!domains.length) return null;

  return (
    <section className="py-16 sm:py-20">
      <div className="flex w-full flex-col gap-10 px-4 sm:px-6 xl:px-10 2xl:px-15">

        {/* Section Heading */}
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <span className="rounded-full border border-primary/30 bg-brand-soft px-6 py-3 text-sm font-extrabold uppercase tracking-[0.1em] text-brand-primary">
            Trending Domains
          </span>

          <h2 className="max-w-xl text-2xl leading-tight font-extrabold tracking-tight text-brand-text sm:text-3xl lg:text-4xl">
            Unlock Your New{" "}
             <span className="bg-gradient-to-r from-brand-primary to-indigo-500 bg-clip-text text-transparent">
    Skills
    </span>
           
          </h2>
        </div>

        {/* Carousel Wrapper */}
        <div className="relative px-0 md:px-5">

          {/* Previous Arrow */}
          <button
            type="button"
            onClick={() => api?.scrollPrev()}
            disabled={!canScrollPrev}
            aria-label="Previous skill domains"
            className="absolute -left-5 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-brand-border bg-card text-brand-text shadow-md transition-all duration-300 hover:scale-110 hover:border-brand-primary hover:bg-brand-primary hover:text-white disabled:pointer-events-none disabled:opacity-40 md:flex"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Skills Carousel */}
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: false,
              containScroll: "trimSnaps",
            }}
            className="w-full min-w-0"
          >
            <CarouselContent className="-ml-3 py-6 sm:-ml-4">
              {domains.map((domain, index) => (
                <CarouselItem
                  key={domain.id}
                  className="min-w-0 basis-1/2 pl-3 sm:basis-1/3 sm:pl-4 lg:basis-1/5"
                >
                  <SkillDomainCard domain={domain} index={index} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Scroll progress */}
          <div
            aria-hidden
            className="mx-auto mt-1 h-1 w-24 overflow-hidden rounded-full bg-brand-border"
          >
            <span
              ref={progressRef}
              className="block h-full w-[12%] rounded-full bg-brand-primary transition-[width] duration-150 ease-out"
            />
          </div>

          {/* Next Arrow */}
          <button
            type="button"
            onClick={() => api?.scrollNext()}
            disabled={!canScrollNext}
            aria-label="Next skill domains"
            className="absolute -right-5 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-brand-border bg-card text-brand-text shadow-md transition-all duration-300 hover:scale-110 hover:border-brand-primary hover:bg-brand-primary hover:text-white disabled:pointer-events-none disabled:opacity-40 md:flex"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}