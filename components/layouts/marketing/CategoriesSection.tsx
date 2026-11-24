"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import type { PointerEvent } from "react";

import {
  ArrowRight,
  PenTool,
  Code2,
  Megaphone,
  BriefcaseBusiness,
  Camera,
  ChartNoAxesColumn,
  type LucideIcon,
} from "lucide-react";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

import MotionReveal from "@/components/layouts/marketing/MotionReveal";

import type {
  CourseCategory,
  CategoryIconName,
} from "@/features/courses/types/category.types";

interface CategoriesSectionProps {
  categories: CourseCategory[];
}

interface CategoryCardProps {
  category: CourseCategory;
  index: number;
}

// Resolve serializable icon names into Lucide components.
// This mapping stays inside the Client Component.
const categoryIcons: Record<CategoryIconName, LucideIcon> = {
  PenTool,
  Code2,
  Megaphone,
  BriefcaseBusiness,
  Camera,
  ChartNoAxesColumn,
};

// On mobile each slide holds two stacked cards.
const CARDS_PER_SLIDE = 2;

const CategoryCard = ({ category, index }: CategoryCardProps) => {
  const Icon = categoryIcons[category.iconName] ?? Code2;

  const shouldReduceMotion = useReducedMotion();

  // Mouse position
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  // Smooth 3D movement
  const springConfig = { stiffness: 180, damping: 22, mass: 0.5 };
  const springX = useSpring(pointerX, springConfig);
  const springY = useSpring(pointerY, springConfig);

  const rotateX = useTransform(springY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8]);

  // Soft light that follows the cursor
  const glareX = useTransform(springX, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(springY, [-0.5, 0.5], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(220px circle at ${glareX}% ${glareY}%, rgba(37,99,235,0.09), transparent 70%)`;
  const glareOpacity = useSpring(0, { stiffness: 140, damping: 24 });

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (shouldReduceMotion || event.pointerType === "touch") return;

      const rect = event.currentTarget.getBoundingClientRect();

      pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
      pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
      glareOpacity.set(1);
    },
    [pointerX, pointerY, glareOpacity, shouldReduceMotion],
  );

  const handlePointerLeave = useCallback(() => {
    pointerX.set(0);
    pointerY.set(0);
    glareOpacity.set(0);
  }, [pointerX, pointerY, glareOpacity]);

  const depth = (value: number) => (shouldReduceMotion ? 0 : value);

  return (
    <MotionReveal
      delay={(index % CARDS_PER_SLIDE) * 0.07}
      variant="scale"
      className="h-full snap-start"
    >
      <motion.div
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
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        whileHover={shouldReduceMotion ? undefined : { y: -5 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="group relative h-full"
      >
        <Link
          href={`/courses?category=${encodeURIComponent(category.slug)}`}
          style={{ transformStyle: "preserve-3d" }}
          className="relative flex h-full min-w-0 items-center gap-4 rounded-xl border border-brand-border bg-card p-4 transition-[border-color,box-shadow] duration-300 hover:border-brand-primary/40 hover:shadow-[0_18px_40px_-22px_rgba(37,99,235,0.45)] focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none sm:p-5"
        >
          {/* Clipped backdrop: category watermark + cursor light */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
            <Icon
              strokeWidth={1.2}
              className={`absolute -right-5 -bottom-6 size-28 -rotate-12 opacity-[0.07] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 ${category.iconColor}`}
            />

            <motion.div
              style={{ background: glare, opacity: glareOpacity }}
              className="absolute inset-0"
            />
          </div>

          {/* Category Icon (lifts off the card) */}
          <motion.div
            style={{ z: depth(28), transformStyle: "preserve-3d" }}
            whileHover={
              shouldReduceMotion ? undefined : { scale: 1.08, rotate: -4 }
            }
            transition={{ type: "spring", stiffness: 300, damping: 16 }}
            className={`relative flex size-12 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ring-black/5 sm:size-14 ${category.iconBackground} ${category.iconColor}`}
          >
            <Icon size={25} strokeWidth={1.8} />
          </motion.div>

          {/* Category Details */}
          <motion.div
            style={{ z: depth(14) }}
            className="relative min-w-0 flex-1"
          >
            <h3 className="truncate text-base font-bold text-brand-text transition-colors duration-300 group-hover:text-brand-primary">
              {category.name}
            </h3>

            <p className="mt-0.5 truncate text-sm text-brand-text-muted">
              {category.description}
            </p>

            <p className="mt-2 text-xs font-semibold text-brand-primary">
              {category.courseCount.toLocaleString()}+ courses
            </p>
          </motion.div>

          {/* Arrow (always visible on touch, appears on hover for desktop) */}
          <motion.div
            style={{ z: depth(20) }}
            className="relative shrink-0"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-brand-soft text-brand-primary transition-all duration-300 group-hover:bg-brand-primary group-hover:text-white sm:-translate-x-1.5 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-x-0 sm:group-focus-within:opacity-100">
              <ArrowRight size={16} />
            </span>
          </motion.div>
        </Link>
      </motion.div>
    </MotionReveal>
  );
};

const CategoriesSection = ({ categories }: CategoriesSectionProps) => {
  const shouldReduceMotion = useReducedMotion();

  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const slideCount = Math.ceil(categories.length / CARDS_PER_SLIDE);

  // Keep the pagination dots in sync with the swipe position.
  const handleScroll = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || slideCount <= 1) return;

    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    if (maxScroll <= 0) return;

    setActiveSlide(
      Math.round((scroller.scrollLeft / maxScroll) * (slideCount - 1)),
    );
  }, [slideCount]);

  const goToSlide = useCallback(
    (slideIndex: number) => {
      const target = scrollerRef.current?.children[
        slideIndex * CARDS_PER_SLIDE
      ] as HTMLElement | undefined;

      target?.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",
        inline: "start",
        block: "nearest",
      });
    },
    [shouldReduceMotion],
  );

  return (
    <section
      id="categories"
      className="relative isolate overflow-hidden py-8"
    >
      {/* Quiet dotted texture, fades out at the top and bottom edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-70 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(37,99,235,0.14) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative z-10 flex w-full flex-col gap-10 px-4 sm:gap-12 sm:px-6 xl:px-10 2xl:px-15">
        {/* Section Heading */}
        <MotionReveal className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div className="max-w-xl space-y-3">
            <h2 className="text-2xl leading-tight font-extrabold tracking-tight text-brand-text sm:text-3xl lg:text-4xl">
              Explore courses by{" "}
              
              <span className="bg-gradient-to-r from-brand-primary to-indigo-500 bg-clip-text text-transparent">
      category
    </span>
            </h2>
            <p className="text-sm leading-relaxed text-brand-text-muted sm:text-base">
              From design to data, pick a field and learn at your own pace.
            </p>
          </div>

          <Link
            href="/courses"
            className="group inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none"
          >
            Browse all courses
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </MotionReveal>

        {/* Categories: swipeable slides on mobile, grid from sm up */}
        {categories.length > 0 ? (
          <div>
            <div
              ref={scrollerRef}
              onScroll={handleScroll}
              className="-mx-4 -my-3 hide-scrollbar grid auto-cols-[85%] grid-flow-col grid-rows-2 gap-3 snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-pl-4 px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:my-0 sm:auto-cols-auto sm:grid-flow-row sm:grid-rows-none sm:grid-cols-2 sm:gap-5 sm:snap-none sm:overflow-visible sm:p-0 lg:grid-cols-3 lg:gap-6"
            >
              {categories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  index={index}
                />
              ))}
            </div>

            {/* Slide indicators (mobile only) */}
            {/* {slideCount > 1 && (
              <div className="mt-5 flex items-center justify-center gap-1.5 sm:hidden">
                {Array.from({ length: slideCount }).map((_, slideIndex) => (
                  <button
                    key={slideIndex}
                    type="button"
                    onClick={() => goToSlide(slideIndex)}
                    aria-label={`Go to slide ${slideIndex + 1} of ${slideCount}`}
                    aria-current={activeSlide === slideIndex ? "true" : undefined}
                    className={`h-1.5 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:outline-none ${
                      activeSlide === slideIndex
                        ? "w-6 bg-brand-primary"
                        : "w-1.5 bg-brand-text-muted/30"
                    }`}
                  />
                ))}
              </div>
            )} */}
          </div>
        ) : (
          <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-brand-border bg-card/50 text-sm text-brand-text-muted">
            No categories available right now.
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoriesSection;