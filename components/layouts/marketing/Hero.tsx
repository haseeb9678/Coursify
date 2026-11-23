"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { PointerEvent } from "react";

import {
  Play,
  Users,
  MonitorPlay,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

import MotionReveal from "@/components/layouts/marketing/MotionReveal";

import { heroSlides } from "@/features/home/data/hero-slides.data";
import type { HeroSlide } from "@/features/home/types/hero-slide.types";

interface HeroSectionProps {
  slides?: HeroSlide[];
}

const GROWTH_BARS = [45, 65, 55, 85, 100];

const HeroSection = ({ slides = heroSlides }: HeroSectionProps) => {
  const shouldReduceMotion = useReducedMotion();

  // Depth helper: real translateZ values collapse to 0 for reduced motion.
  const depth = (value: number) => (shouldReduceMotion ? 0 : value);

  // Keep a fallback so an empty API response never breaks the hero.
  const displayedSlides = slides.length > 0 ? slides : heroSlides;

  // Carousel state
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // 3D pointer movement values
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 20, mass: 0.6 };
  const springX = useSpring(pointerX, springConfig);
  const springY = useSpring(pointerY, springConfig);

  const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-12, 12]);

  // Moving glare on the main card
  const glareX = useTransform(springX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(springY, [-0.5, 0.5], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.4), transparent 55%)`;
  const glareOpacity = useSpring(0, { stiffness: 140, damping: 24 });

  // Floor shadow slides opposite to the tilt for a grounded feel
  const shadowX = useTransform(springX, [-0.5, 0.5], [22, -22]);
  const shadowScale = useTransform(springY, [-0.5, 0.5], [1.06, 0.94]);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (shouldReduceMotion || event.pointerType === "touch") return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      pointerX.set(x);
      pointerY.set(y);
      glareOpacity.set(1);
    },
    [pointerX, pointerY, glareOpacity, shouldReduceMotion],
  );

  const handlePointerLeave = useCallback(() => {
    pointerX.set(0);
    pointerY.set(0);
    glareOpacity.set(0);
  }, [pointerX, pointerY, glareOpacity]);

  // Keep active pagination dot synchronized with the carousel.
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

  // Automatic background slider.
  useEffect(() => {
    if (
      !carouselApi ||
      displayedSlides.length <= 1 ||
      isPaused ||
      shouldReduceMotion
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      carouselApi.scrollNext();
    }, 4500);

    return () => {
      window.clearInterval(interval);
    };
  }, [carouselApi, displayedSlides.length, isPaused, shouldReduceMotion]);

  const floatTransition = {
    duration: 4.2,
    repeat: Infinity,
    repeatType: "mirror" as const,
    ease: "easeInOut" as const,
  };

  const currentSlide = displayedSlides[activeSlide] ?? displayedSlides[0];

  return (
    <section className="relative isolate overflow-x-clip 
    pt-10 pb-16 sm:pt-12 lg:pt-16 lg:pb-24">
      {/* Ambient Background Effects */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={
            shouldReduceMotion ? undefined : { x: [0, 24, 0], y: [0, -18, 0] }
          }
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -right-32 size-[340px] rounded-full bg-blue-200/35 blur-[110px] sm:size-[440px]"
        />

        <motion.div
          animate={
            shouldReduceMotion ? undefined : { x: [0, -20, 0], y: [0, 22, 0] }
          }
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-36 -left-32 size-[320px] rounded-full bg-indigo-200/35 blur-[110px] sm:size-[420px]"
        />

        <div className="absolute top-20 right-[8%] hidden size-2 rounded-full bg-blue-300/60 md:block" />
        <div className="absolute bottom-24 left-[8%] hidden size-3 rounded-full bg-indigo-300/50 md:block" />
      </div>

      <div className="mx-auto w-full max-w-420 px-4 sm:px-6 lg:px-10 2xl:px-14">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10 xl:gap-12">
          {/* =====================================
              LEFT CONTENT
          ====================================== */}
          <MotionReveal
            className="min-w-0 space-y-6 text-center lg:col-span-6 lg:text-left"
            delay={0.05}
          >
            {/* Trust Badge */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="inline-flex max-w-full items-center gap-2 rounded-full border border-brand-soft-border bg-brand-soft/90 px-3.5 py-2 text-[11px] font-semibold
               tracking-wide text-brand-primary shadow-sm backdrop-blur-md sm:text-xs"
            >
              <span className="relative flex size-2 shrink-0">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-primary opacity-45" />
                <span className="relative inline-flex size-2 rounded-full bg-brand-primary" />
              </span>
              <span className="truncate">#1 TRUSTED ONLINE LEARNING PLATFORM</span>
              <Sparkles size={13} className="shrink-0" />
            </motion.div>

            {/* Heading & Subcopy */}
            <div className="space-y-4 sm:space-y-5">
              <h1 className="text-3xl leading-[1.16] font-extrabold tracking-tight text-brand-text sm:text-5xl xl:text-[52px]">
                <span className="block">Enhance your Skills for a</span>

                <span className="mt-2 inline-flex min-h-[1.25em] items-center justify-center rounded-xl bg-primary/10 px-3 py-1 text-brand-accent lg:justify-start">
                  <LayoutTextFlip
                    text=""
                    
                    words={[
                      "Brighter Future",
                      "Better Skills",
                      "Bigger Opportunities",
                    ]}
                  />
                </span>
              </h1>

              <p className="mx-auto max-w-xl text-sm leading-relaxed text-brand-text-muted sm:text-base lg:mx-0 lg:text-[17px]">
                Access over 5,000+ industry-led video courses, hands-on
                projects, and globally recognized certifications designed to
                accelerate your career from anywhere.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col items-stretch justify-center gap-3 pt-1 sm:flex-row sm:items-center sm:gap-4 lg:justify-start">
              <motion.div
                whileHover={
                  shouldReduceMotion ? undefined : { y: -2, scale: 1.015 }
                }
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto"
              >
                <Link
                  href="/courses"
                  className="group relative inline-flex h-12 w-full items-center 
                  justify-center gap-2 overflow-hidden rounded-lg bg-primary px-7 xl:min-w-50 text-[15px] 
                  font-semibold text-white shadow-lg shadow-primary/25 transition-colors hover:bg-primary-hover 
                  focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none sm:w-auto"
                >
                  {/* Light sweep on hover */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/25 opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
                  />
                  Get Started
                  <ArrowUpRight
                    size={17}
                    className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </motion.div>

              <motion.div
                whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto"
              >
                <Link
                  href="/demo"
                  className="group inline-flex h-12
                   w-full items-center justify-center gap-2.5 rounded-lg border border-transparent 
                   px-5 text-[15px] font-semibold text-brand-text transition-colors hover:border-brand-soft-border xl:min-w-50
                    hover:bg-brand-soft/50 hover:text-primary focus-visible:ring-2 focus-visible:ring-brand-primary 
                    focus-visible:outline-none sm:w-auto"
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-brand-soft text-primary shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-primary group-hover:text-white">
                    <Play size={14} fill="currentColor" />
                  </span>
                  Watch Demo
                </Link>
              </motion.div>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 pt-2 text-xs font-medium text-brand-text-muted sm:text-[13px] lg:justify-start">
              <div className="flex items-center gap-2">
                <GraduationCap
                  size={16}
                  className="shrink-0 text-brand-primary"
                />
                <span>Expert Instructors</span>
              </div>

              <div className="flex items-center gap-2">
                <MonitorPlay size={15} className="shrink-0 text-brand-primary" />
                <span>Learn Anywhere</span>
              </div>

              <div className="flex items-center gap-2">
                <Sparkles size={15} className="shrink-0 text-brand-primary" />
                <span>Career Focused</span>
              </div>
            </div>
          </MotionReveal>

          {/* =====================================
              RIGHT 3D VISUAL + IMAGE SLIDER
          ====================================== */}
          <MotionReveal
            className="flex min-w-0 justify-center lg:col-span-6 lg:justify-end"
            variant="fadeLeft"
            delay={0.15}
          >
            <div
              className="relative w-full max-w-[480px] [perspective:1200px] xl:max-w-[510px]"
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
            >
              {/* Entrance: the whole scene swings into place once */}
              <motion.div
                initial={
                  shouldReduceMotion
                    ? false
                    : { opacity: 0, rotateY: -26, rotateX: 8, y: 28, scale: 0.94 }
                }
                animate={{ opacity: 1, rotateY: 0, rotateX: 0, y: 0, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 85,
                  damping: 17,
                  delay: 0.2,
                }}
                style={{ transformStyle: "preserve-3d" }}
                className="relative"
              >
                {/* Tilt layer: everything inside shares one 3D space */}
                <motion.div
                  style={
                    shouldReduceMotion
                      ? undefined
                      : { rotateX, rotateY, transformStyle: "preserve-3d" }
                  }
                  className="relative"
                >
                  {/* Ambient Glow (deepest layer) */}
                  <motion.div
                    style={{ z: depth(-90) }}
                    className="pointer-events-none absolute inset-8 rounded-full bg-blue-400/20 blur-[70px]"
                  />

                  {/* Decorative Rings */}
                  <motion.div
                    animate={shouldReduceMotion ? undefined : { rotate: 360 }}
                    transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
                    style={{ z: depth(-60) }}
                    className="pointer-events-none absolute -inset-4 hidden rounded-[40%] border border-dashed border-blue-300/50 sm:block"
                  >
                    {/* Orbiting dot rides the ring */}
                    <span className="absolute -top-1 left-1/2 size-2 rounded-full bg-brand-primary shadow-[0_0_12px_rgba(37,99,235,0.7)]" />
                  </motion.div>

                  <motion.div
                    animate={shouldReduceMotion ? undefined : { rotate: -360 }}
                    transition={{ duration: 52, repeat: Infinity, ease: "linear" }}
                    style={{ z: depth(-85) }}
                    className="pointer-events-none absolute -inset-9 hidden rounded-[45%] border border-blue-200/40 md:block"
                  >
                    <span className="absolute -bottom-1 left-1/3 size-1.5 rounded-full bg-indigo-400/80" />
                  </motion.div>

                  {/* Backdrop Arch */}
                  <motion.div
                    style={{ z: depth(-40) }}
                    className="pointer-events-none absolute inset-x-5 top-10 bottom-0 
                    rounded-t-[48%] bg-gradient-to-b from-blue-100 via-brand-soft to-indigo-100/70 shadow-inner"
                  />

                  {/* Floor shadow */}
                  <motion.div
                    style={
                      shouldReduceMotion
                        ? undefined
                        : { x: shadowX, scaleX: shadowScale, z: -50 }
                    }
                    className="pointer-events-none absolute inset-x-10 -bottom-8 h-10 rounded-[50%] bg-blue-900/20 blur-2xl"
                  />

                  {/* Decorative Floating Orb */}
                  <motion.div
                    style={{ z: depth(70) }}
                    className="pointer-events-none absolute -top-3 right-2 z-20 hidden sm:-right-4 sm:top-12 sm:block"
                  >
                    <motion.div
                      animate={
                        shouldReduceMotion
                          ? undefined
                          : { y: [0, -14, 0], rotate: [0, 18, 0] }
                      }
                      transition={floatTransition}
                      className="flex size-11 items-center justify-center rounded-2xl border border-white/80 bg-white/85 text-brand-primary shadow-lg shadow-blue-200/50 backdrop-blur-xl sm:size-12"
                    >
                      <Sparkles size={22} />
                    </motion.div>
                  </motion.div>

                  {/* 3D Main Image Card */}
                  <motion.div
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.012 }}
                    transition={{ type: "spring", stiffness: 160, damping: 22 }}
                    className="relative z-10 overflow-hidden rounded-[24px] border border-white/85 bg-white p-1.5 shadow-[0_28px_75px_-25px_rgba(37,99,235,0.35)] sm:rounded-[28px] sm:p-2"
                  >
                    <div
                      className="relative overflow-hidden rounded-[20px] sm:rounded-[22px]"
                      onMouseEnter={() => setIsPaused(true)}
                      onMouseLeave={() => setIsPaused(false)}
                      onFocusCapture={() => setIsPaused(true)}
                      onBlurCapture={() => setIsPaused(false)}
                    >
                      <Carousel
                        setApi={setCarouselApi}
                        opts={{
                          align: "start",
                          loop: displayedSlides.length > 1,
                          duration: 12,
                        }}
                        className="w-full"
                      >
                        <CarouselContent className="ml-0">
                          {displayedSlides.map((slide, index) => (
                            <CarouselItem
                              key={`${slide.id}-${index}`}
                              className="min-w-0 basis-full pl-0"
                            >
                              <div className="relative h-[340px] w-full overflow-hidden bg-brand-soft sm:h-[430px] md:h-[490px] xl:h-[550px]">
                                <Image
                                  src={slide.src}
                                  alt={slide.alt}
                                  fill
                                  priority={index === 0}
                                  sizes="(max-width: 640px) 92vw, (max-width: 1024px) 480px, 510px"
                                  className="object-cover object-top"
                                />
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-blue-950/40 via-transparent to-white/10" />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                      </Carousel>

                      {/* Cursor glare */}
                      <motion.div
                        style={{ background: glare, opacity: glareOpacity }}
                        className="pointer-events-none absolute inset-0 z-10 mix-blend-soft-light"
                      />

                      {/* Active Slide Pill */}
                      {currentSlide?.label && (
                        <div
                          key={`${currentSlide.id}-${activeSlide}`}
                          className="pointer-events-none absolute bottom-3 right-3 sm:left-3 z-10 max-w-[48%] truncate rounded-full border border-white/50 bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-brand-text shadow-md backdrop-blur-md sm:bottom-4 sm:left-4 sm:max-w-[54%] sm:px-3.5 sm:py-2 sm:text-xs"
                        >
                          <span className="mr-1.5 inline-block size-2 rounded-full bg-emerald-500" />
                          {currentSlide.label}
                        </div>
                      )}

                      {/* Slider Controls */}
                      {displayedSlides.length > 1 && (
                        <div className="absolute right-3 bottom-3 z-20 sm:flex items-center gap-1.5 sm:right-4 sm:bottom-4 hidden">
                          {/* <button
                            type="button"
                            onClick={() => carouselApi?.scrollPrev()}
                            aria-label="Previous slide"
                            className="flex size-8 items-center justify-center rounded-full border border-white/60 bg-white/90 text-brand-text shadow-md backdrop-blur-md transition-all hover:scale-105 hover:bg-white hover:text-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none sm:size-9"
                          >
                            <ChevronLeft size={17} />
                          </button> */}

                          <div className="flex items-center gap-1.5 rounded-full border border-white/50 bg-white/90 px-2.5 py-2 shadow-md backdrop-blur-md">
                            {displayedSlides.map((slide, index) => (
                              <button
                                key={`${slide.id}-dot-${index}`}
                                type="button"
                                onClick={() => carouselApi?.scrollTo(index)}
                                aria-label={`Go to slide ${index + 1}`}
                                aria-current={
                                  activeSlide === index ? "true" : undefined
                                }
                                className={`h-1.5 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none ${
                                  activeSlide === index
                                    ? "w-5 bg-brand-primary"
                                    : "w-1.5 bg-brand-text-muted/40 hover:bg-brand-primary/60"
                                }`}
                              />
                            ))}
                          </div>

                          {/* <button
                            type="button"
                            onClick={() => carouselApi?.scrollNext()}
                            aria-label="Next slide"
                            className="flex size-8 items-center justify-center rounded-full border border-white/60 bg-white/90 text-brand-text shadow-md backdrop-blur-md transition-all hover:scale-105 hover:bg-white hover:text-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none sm:size-9"
                          >
                            <ChevronRight size={17} />
                          </button> */}
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* =====================================
                      FLOATING CARD 1: STUDENTS
                  ====================================== */}
                  <motion.div
                    style={{ z: depth(85) }}
                    className="absolute top-5 left-2 z-20 sm:top-8 sm:-left-7"
                  >
                    <motion.div
                      animate={
                        shouldReduceMotion
                          ? undefined
                          : { y: [0, -10, 0], rotate: [0, -1, 0] }
                      }
                      transition={floatTransition}
                      whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
                      className="flex items-center gap-2.5 rounded-xl border border-white/85 bg-white/95 px-3 py-2.5 shadow-[0_22px_45px_-15px_rgba(37,99,235,0.35)] backdrop-blur-xl sm:gap-3 sm:p-3.5"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md shadow-blue-500/30 sm:size-10">
                        <Users size={18} />
                      </div>

                      <div>
                        <p className="text-xs leading-tight font-extrabold text-brand-text sm:text-sm">
                          250K+
                        </p>
                        <p className="text-[10px] font-medium text-brand-text-muted sm:text-[11px]">
                          Assisted Students
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* =====================================
                      FLOATING CARD 2: SKILL GROWTH
                  ====================================== */}
                  <div className="absolute top-1/2 right-2 z-20 -translate-y-1/2 sm:-right-6">
                    <motion.div style={{ z: depth(100) }}>
                      <motion.div
                        animate={
                          shouldReduceMotion
                            ? undefined
                            : { y: [0, 9, 0], rotate: [0, 1, 0] }
                        }
                        transition={{ ...floatTransition, duration: 5, delay: 0.5 }}
                        whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
                        className="w-[126px] rounded-xl border border-white/85 bg-white/95 p-2.5 shadow-[0_22px_45px_-15px_rgba(37,99,235,0.35)] backdrop-blur-xl sm:w-[166px] sm:p-4"
                      >
                        <div className="mb-2.5 flex items-center justify-between gap-1 sm:mb-3">
                          <span className="text-[10px] font-bold text-brand-text sm:text-[11px]">
                            Skill Growth
                          </span>

                          <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 sm:text-[11px]">
                            <TrendingUp size={12} />
                            +84%
                          </span>
                        </div>

                        <div className="flex h-10 items-end justify-between gap-1 sm:h-12 sm:gap-1.5">
                          {GROWTH_BARS.map((height, index) => (
                            <motion.div
                              key={height}
                              initial={shouldReduceMotion ? false : { scaleY: 0 }}
                              animate={{ scaleY: 1 }}
                              transition={{
                                duration: 0.65,
                                delay: 0.55 + index * 0.1,
                                ease: "easeOut",
                              }}
                              className={`w-full origin-bottom rounded-t ${
                                index === 4
                                  ? "bg-primary"
                                  : index === 3
                                    ? "bg-brand-accent"
                                    : "bg-blue-200"
                              }`}
                              style={{ height: `${height}%` }}
                            />
                          ))}
                        </div>

                        <p className="mt-2 hidden text-[10px] text-brand-text-muted sm:block">
                          Track your learning progress
                        </p>
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* =====================================
                      FLOATING CARD 3: ONLINE COURSES
                  ====================================== */}
                  <motion.div
                    style={{ z: depth(70) }}
                    className="absolute bottom-14 left-2 z-20 sm:bottom-16 sm:-left-6"
                  >
                    <motion.div
                      animate={
                        shouldReduceMotion
                          ? undefined
                          : { y: [0, -8, 0], rotate: [0, 1, 0] }
                      }
                      transition={{ ...floatTransition, duration: 4.5, delay: 0.8 }}
                      whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
                      className="flex items-center gap-2.5 rounded-xl border border-white/85 bg-white/95 px-3 py-2.5 shadow-[0_22px_45px_-15px_rgba(37,99,235,0.35)] backdrop-blur-xl sm:gap-3 sm:px-4 sm:py-3"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-primary sm:size-9">
                        <MonitorPlay size={16} />
                      </div>

                      <div>
                        <p className="text-[11px] font-extrabold text-brand-text sm:text-xs">
                          100% Online Courses
                        </p>
                        <p className="hidden text-[11px] text-brand-text-muted sm:block">
                          Self-paced & flexible
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Bottom Decorative Orb */}
                  <motion.div
                    style={{ z: depth(40) }}
                    className="pointer-events-none absolute right-8 -bottom-7 z-0 hidden sm:block"
                  >
                    <motion.div
                      animate={
                        shouldReduceMotion
                          ? undefined
                          : { y: [0, 10, 0], x: [0, 5, 0] }
                      }
                      transition={{ ...floatTransition, duration: 6 }}
                      className="size-14 rounded-full bg-gradient-to-br from-blue-300/60 to-indigo-400/40 blur-[1px]"
                    />
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </MotionReveal>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;