"use client";

import { useAccessibleMotion } from "@/features/accessibility/hooks/use-accessible-motion";
import Image from "next/image";
import Link from "next/link";

import {
  useCallback,
  useEffect,
  useState,
  type PointerEvent,
} from "react";

import {
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  GraduationCap,
  MonitorPlay,
  BookOpen,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
  useMotionValue,
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

import { heroSlides } from "@/features/home/data/hero-slides.data";
import type { HeroSlide } from "@/features/home/types/hero-slide.types";
import HeroAmbientBackground from "@/components/shared/HeroAmbientBackground";

interface HeroSectionProps {
  slides?: HeroSlide[];
}

const AUTOPLAY_DELAY = 5500;

const learningBenefits = [
  {
    icon: GraduationCap,
    label: "Expert instructors",
  },
  {
    icon: MonitorPlay,
    label: "Flexible learning",
  },
  {
    icon: BookOpen,
    label: "Practical skills",
  },
];

export default function HeroSection({
  slides = heroSlides,
}: HeroSectionProps) {
  const shouldReduceMotion = useAccessibleMotion();

  const displayedSlides =
    slides.length > 0 ? slides : heroSlides;

  const slideCount = displayedSlides.length;

  const [carouselApi, setCarouselApi] =
    useState<CarouselApi>();

  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);

  // Refined 3D pointer interaction.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const springConfig = {
    stiffness: 140,
    damping: 24,
    mass: 0.8,
  };

  const springX = useSpring(pointerX, springConfig);
  const springY = useSpring(pointerY, springConfig);

  const rotateX = useTransform(
    springY,
    [-0.5, 0.5],
    [3, -3],
  );

  const rotateY = useTransform(
    springX,
    [-0.5, 0.5],
    [-4, 4],
  );

  const floatingX = useTransform(
    springX,
    [-0.5, 0.5],
    [-8, 8],
  );

  const floatingY = useTransform(
    springY,
    [-0.5, 0.5],
    [-6, 6],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (
        shouldReduceMotion ||
        event.pointerType !== "mouse"
      ) {
        return;
      }

      const rect =
        event.currentTarget.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      const x =
        (event.clientX - rect.left) / rect.width - 0.5;

      const y =
        (event.clientY - rect.top) / rect.height - 0.5;

      pointerX.set(Math.max(-0.5, Math.min(0.5, x)));
      pointerY.set(Math.max(-0.5, Math.min(0.5, y)));
    },
    [pointerX, pointerY, shouldReduceMotion],
  );

  const resetPointer = useCallback(() => {
    pointerX.set(0);
    pointerY.set(0);
  }, [pointerX, pointerY]);

  // Synchronize carousel state.
  useEffect(() => {
    if (!carouselApi) return;

    const updateActiveSlide = () => {
      setActiveSlide(carouselApi.selectedScrollSnap());
    };

    updateActiveSlide();

    carouselApi.on("select", updateActiveSlide);
    carouselApi.on("reInit", updateActiveSlide);

    return () => {
      carouselApi.off("select", updateActiveSlide);
      carouselApi.off("reInit", updateActiveSlide);
    };
  }, [carouselApi]);

  // Pause when the browser tab is inactive.
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    handleVisibilityChange();

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, []);

  const canAutoplay =
    slideCount > 1 &&
    !isPaused &&
    !isHovered &&
    !isFocused &&
    !shouldReduceMotion &&
    isPageVisible;

  // Automatic slide navigation.
  useEffect(() => {
    if (!carouselApi || !canAutoplay) return;

    const interval = window.setInterval(() => {
      if (carouselApi.canScrollNext()) {
        carouselApi.scrollNext();
      } else {
        carouselApi.scrollTo(0);
      }
    }, AUTOPLAY_DELAY);

    return () => window.clearInterval(interval);
  }, [carouselApi, canAutoplay, activeSlide]);

  const safeActiveSlide = Math.min(
    activeSlide,
    Math.max(0, slideCount - 1),
  );

  const currentSlide =
    displayedSlides[safeActiveSlide];

  return (
    <section className="relative isolate w-full overflow-x-clip bg-background">
      <HeroAmbientBackground />

      {/* Full-width fluid container */}
      <div className="w-full px-4 py-10 sm:px-8 sm:py-14 lg:px-[4vw] lg:py-16 xl:py-20 2xl:px-[5vw]">
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-[5vw]">

          {/* =====================================
              LEFT — EDITORIAL CONTENT
          ====================================== */}

          <MotionReveal
            delay={0.05}
            className="min-w-0 text-center lg:text-left"
          >
            {/* Eyebrow */}
            <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-primary/10 bg-background/60 px-3.5 py-2 backdrop-blur-md sm:mb-7">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-primary"
              />

              <span className="text-xs font-semibold tracking-wide text-primary sm:text-sm">
                Learning without limits
              </span>
            </div>

            {/* Fluid Typography */}
            <h1 className="text-[clamp(2.25rem,3.7vw,5.75rem)] font-semibold leading-[1.1] tracking-[-0.045em] text-brand-text text-balance">
              Build skills for a world that{" "}

              <span className="text-primary">
                never stops changing.
              </span>
            </h1>

            {/* Supporting Description */}
            <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-[1.8] text-brand-text-muted sm:mt-7 sm:text-base lg:mx-0 xl:text-lg 2xl:text-xl">
              Learn from industry experts, build practical
              skills, and take the next step in your
              career — wherever you are.
            </p>

            {/* CTA Actions */}
            <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:mt-9 sm:flex-row sm:items-center sm:gap-4 lg:justify-start">

              {/* Primary Button */}
              <Link
                href="/courses"
                className="group relative inline-flex h-13 items-center justify-center gap-3 overflow-hidden rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-300 hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98] motion-reduce:transform-none xl:h-14 xl:px-8 xl:text-base"
              >
                Explore courses

                <ArrowUpRight
                  size={19}
                  strokeWidth={1.8}
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
                />
              </Link>

              {/* Secondary Button */}
              <Link
                href="/demo"
                className="group inline-flex h-13 items-center justify-center gap-2.5 rounded-xl border border-brand-border bg-background/60 px-6 backdrop-blur-md text-sm font-semibold text-brand-text transition-colors duration-300 hover:border-primary/25 hover:bg-brand-soft/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 xl:h-14 xl:px-7 xl:text-base"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Play
                    size={13}
                    strokeWidth={1.8}
                    className="ml-0.5 fill-current"
                  />
                </span>

                Watch demo
              </Link>
            </div>

            {/* Learning Benefits */}
            <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-4 border-t border-brand-border/70 pt-6 sm:mt-10 lg:justify-start xl:mt-12 xl:gap-x-8">
              {learningBenefits.map(
                ({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 text-xs font-medium text-brand-text-muted sm:text-[13px] xl:text-sm"
                  >
                    <Icon
                      size={18}
                      strokeWidth={1.7}
                      aria-hidden="true"
                      className="shrink-0 text-primary"
                    />

                    <span>{label}</span>
                  </div>
                ),
              )}
            </div>
          </MotionReveal>

          {/* =====================================
              RIGHT — WIDE 3D CAROUSEL
          ====================================== */}

          <MotionReveal
            variant="fadeLeft"
            delay={0.15}
            className="w-full min-w-0"
          >
            <div
              className="relative mx-auto w-full max-w-180 lg:max-w-none"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onFocusCapture={() => setIsFocused(true)}
              onBlurCapture={(event) => {
                if (
                  !event.currentTarget.contains(
                    event.relatedTarget as Node | null,
                  )
                ) {
                  setIsFocused(false);
                }
              }}
            >
              {/* 3D Scene */}
              <div
                className="relative [perspective:1600px]"
                onPointerMove={handlePointerMove}
                onPointerLeave={resetPointer}
              >
                {/* Subtle Layered Backdrop */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -z-10 hidden translate-x-3 translate-y-3 rounded-[30px] border border-white/50 bg-card/35 backdrop-blur-md sm:block dark:border-white/10"
                />

                {/* Main 3D Layer */}
                <motion.div
                  style={
                    shouldReduceMotion
                      ? undefined
                      : {
                          rotateX,
                          rotateY,
                          transformStyle: "preserve-3d",
                        }
                  }
                  className="relative"
                >
                  {/* Carousel Frame */}
                  <div className="relative rounded-[22px] border border-white/60 bg-card/65 p-2 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.3)] backdrop-blur-xl sm:rounded-[28px] sm:p-2.5 dark:border-white/10">
                    <div className="relative overflow-hidden rounded-[17px] bg-brand-soft sm:rounded-[22px]">
                      {slideCount > 0 ? (
                        <Carousel
                          setApi={setCarouselApi}
                          opts={{
                            align: "start",
                            loop: slideCount > 1,
                            duration: 20,
                          }}
                          className="w-full"
                        >
                          <CarouselContent className="ml-0">
                            {displayedSlides.map(
                              (slide, index) => (
                                <CarouselItem
                                  key={`${slide.id}-${index}`}
                                  className="min-w-0 basis-full pl-0"
                                >
                                  {/* Responsive Fluid Image */}
                                  <div className="relative aspect-5/4 w-full overflow-hidden bg-brand-soft sm:aspect-4/3 lg:aspect-auto lg:h-[clamp(400px,34vw,740px)]">
                                    <Image
                                      src={slide.src}
                                      alt={slide.alt}
                                      fill
                                      priority={index === 0}
                                      sizes="(max-width: 639px) 95vw, (max-width: 1023px) 720px, 46vw"
                                      className="object-cover object-center"
                                    />

                                    {/* Caption Contrast */}
                                    <div
                                      aria-hidden="true"
                                      className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent"
                                    />
                                  </div>
                                </CarouselItem>
                              ),
                            )}
                          </CarouselContent>
                        </Carousel>
                      ) : (
                        <div className="flex aspect-5/4 flex-col items-center justify-center gap-3 bg-brand-soft lg:aspect-auto lg:h-[clamp(400px,34vw,740px)]">
                          <GraduationCap
                            size={48}
                            strokeWidth={1.2}
                            className="text-primary"
                          />

                          <p className="text-sm font-medium text-brand-text-muted">
                            Your learning journey starts here
                          </p>
                        </div>
                      )}

                      {/* Dynamic Slide Caption */}
                      <AnimatePresence mode="wait">
                        {currentSlide?.label && (
                          <motion.div
                            key={`${currentSlide.id}-${safeActiveSlide}`}
                            initial={
                              shouldReduceMotion
                                ? false
                                : { opacity: 0, y: 6 }
                            }
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            exit={{
                              opacity: 0,
                              y: shouldReduceMotion ? 0 : -6,
                            }}
                            transition={{
                              duration: shouldReduceMotion
                                ? 0
                                : 0.25,
                            }}
                            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7 xl:p-8"
                          >
                            <p className="max-w-[90%] text-base font-medium leading-snug tracking-tight text-white sm:text-lg xl:text-xl">
                              {currentSlide.label}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Minimal Floating Card */}
                  <motion.div
                    style={
                      shouldReduceMotion
                        ? undefined
                        : {
                            x: floatingX,
                            y: floatingY,
                            z: 24,
                          }
                    }
                    className="pointer-events-none absolute -left-4 top-[14%] z-20 hidden sm:block xl:-left-7"
                  >
                    <div className="flex items-center gap-3 rounded-xl border border-white/60 bg-card/85 px-4 py-3 shadow-[0_12px_30px_-12px_rgba(15,23,42,0.22)] backdrop-blur-xl dark:border-white/10 xl:px-5 xl:py-4">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary xl:size-12">
                        <GraduationCap
                          size={23}
                          strokeWidth={1.7}
                        />
                      </span>

                      <div className="space-y-1">
                        <p className="text-xs font-semibold tracking-tight text-brand-text xl:text-sm">
                          Learn at your own pace
                        </p>

                        <p className="text-[11px] text-brand-text-muted xl:text-xs">
                          Built around your goals
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* =====================================
                  CAROUSEL CONTROLS
              ====================================== */}

              {slideCount > 1 && (
                <div className="mt-5 flex items-center justify-between gap-3 sm:mt-7">

                  {/* Slide Counter */}
                  {/* <div className="flex shrink-0 items-baseline gap-1.5 tabular-nums">
                    <span className="text-sm font-semibold text-brand-text xl:text-base">
                      {String(safeActiveSlide + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>

                    <span className="text-xs text-brand-text-muted">
                      /
                    </span>

                    <span className="text-xs font-medium text-brand-text-muted xl:text-sm">
                      {String(slideCount).padStart(2, "0")}
                    </span>
                  </div> */}

                  {/* Pagination */}
                  <div
                    aria-label="Slide pagination"
                    className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto"
                  >
                    {displayedSlides.map((slide, index) => {
                      const isActive =
                        safeActiveSlide === index;

                      return (
                        <button
                          key={`${slide.id}-dot-${index}`}
                          type="button"
                          onClick={() =>
                            carouselApi?.scrollTo(
                              index,
                              shouldReduceMotion,
                            )
                          }
                          disabled={!carouselApi}
                          aria-label={`Go to slide ${index + 1}`}
                          aria-current={
                            isActive ? "true" : undefined
                          }
                          className="group flex h-9 min-w-5 shrink-0 cursor-pointer items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-default"
                        >
                          <span
                            className={`h-1 rounded-full transition-all duration-300 motion-reduce:transition-none ${
                              isActive
                                ? "w-7 bg-primary sm:w-9"
                                : "w-2.5 bg-brand-text-muted/25 group-hover:bg-primary/50 sm:w-4"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation Actions */}
                  <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">

                    {/* Pause / Resume */}
                    {!shouldReduceMotion && (
                      <button
                        type="button"
                        onClick={() =>
                          setIsPaused((previous) => !previous)
                        }
                        aria-label={
                          isPaused
                            ? "Resume slideshow"
                            : "Pause slideshow"
                        }
                        title={
                          isPaused
                            ? "Resume slideshow"
                            : "Pause slideshow"
                        }
                        className="flex size-10 cursor-pointer items-center justify-center rounded-full text-brand-text-muted transition-colors hover:bg-brand-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {isPaused ? (
                          <Play size={16} strokeWidth={1.8} />
                        ) : (
                          <Pause size={16} strokeWidth={1.8} />
                        )}
                      </button>
                    )}

                    {/* Previous Slide */}
                    <button
                      type="button"
                      onClick={() =>
                        carouselApi?.scrollPrev(
                          shouldReduceMotion,
                        )
                      }
                      disabled={!carouselApi}
                      aria-label="Previous slide"
                      className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-brand-border bg-card/65 text-brand-text backdrop-blur-md transition-colors hover:border-primary/30 hover:bg-brand-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 sm:size-11 xl:size-12"
                    >
                      <ArrowLeft size={19} strokeWidth={1.8} />
                    </button>

                    {/* Next Slide */}
                    <button
                      type="button"
                      onClick={() =>
                        carouselApi?.scrollNext(
                          shouldReduceMotion,
                        )
                      }
                      disabled={!carouselApi}
                      aria-label="Next slide"
                      className="flex size-10 cursor-pointer items-center justify-center rounded-full border border-brand-border bg-card/65 text-brand-text backdrop-blur-md transition-colors hover:border-primary/30 hover:bg-brand-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 sm:size-11 xl:size-12"
                    >
                      <ArrowRight size={19} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </MotionReveal>
        </div>
      </div>
    </section>
  );
}
