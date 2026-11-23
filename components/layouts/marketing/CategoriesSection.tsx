
"use client";

import Link from "next/link";
import { useCallback } from "react";
import type { PointerEvent } from "react";

import {
  ArrowRight,
  Sparkles,
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

const CategoryCard = ({
  category,
  index,
}: CategoryCardProps) => {
  const Icon = categoryIcons[category.iconName] ?? Code2;

  const shouldReduceMotion = useReducedMotion();

  // Mouse position
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  // Smooth 3D movement
  const springX = useSpring(pointerX, {
    stiffness: 180,
    damping: 22,
    mass: 0.5,
  });

  const springY = useSpring(pointerY, {
    stiffness: 180,
    damping: 22,
    mass: 0.5,
  });

  const rotateX = useTransform(springY, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-7, 7]);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (shouldReduceMotion || event.pointerType === "touch") return;

      const rect = event.currentTarget.getBoundingClientRect();

      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      pointerX.set(x);
      pointerY.set(y);
    },
    [pointerX, pointerY, shouldReduceMotion],
  );

  const handlePointerLeave = useCallback(() => {
    pointerX.set(0);
    pointerY.set(0);
  }, [pointerX, pointerY]);

  return (
    <MotionReveal delay={index * 0.07} variant="scale">
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
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        whileHover={shouldReduceMotion ? undefined : { y: -7 }}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
        transition={{
          type: "spring",
          stiffness: 180,
          damping: 18,
        }}
        className="group relative h-full [perspective:1000px]"
      >
        <Link
          href={`/courses?category=${encodeURIComponent(category.slug)}`}
          className="relative flex h-full min-w-0 items-center gap-4 overflow-hidden rounded-xl border border-brand-border bg-card p-4 shadow-sm transition-all duration-300 hover:border-brand-primary/40 hover:shadow-[0_20px_45px_-20px_rgba(37,99,235,0.35)] sm:p-5"
        >
          {/* Hover Background Glow */}
          <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-brand-soft opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

          {/* Decorative Corner */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="pointer-events-none absolute right-3 top-3 text-brand-primary/30"
          >
            <Sparkles size={16} />
          </motion.div>

          {/* Category Icon */}
          <motion.div
            whileHover={
              shouldReduceMotion
                ? undefined
                : {
                    rotateY: 180,
                    scale: 1.1,
                    z: 25,
                  }
            }
            transition={{
              duration: 0.5,
              ease: "easeInOut",
            }}
            className={`relative z-10 flex size-12 shrink-0 items-center justify-center rounded-xl shadow-sm transition-shadow duration-300 group-hover:shadow-lg sm:size-14 ${category.iconBackground} ${category.iconColor}`}
            style={{ transformStyle: "preserve-3d" }}
          >
            <Icon size={25} strokeWidth={1.8} />
          </motion.div>

          {/* Category Details */}
          <div className="relative z-10 min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-brand-text transition-colors duration-300 group-hover:text-brand-primary">
              {category.name}
            </h3>

            <p className="mt-0.5 truncate text-sm text-brand-text-muted">
              {category.description}
            </p>

            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-xs font-bold text-brand-primary">
                {category.courseCount.toLocaleString()}+ Courses
              </span>

              <span className="size-1 rounded-full bg-brand-primary/40" />

              <span className="text-[11px] font-medium text-brand-text-muted">
                Explore learning
              </span>
            </div>
          </div>

          {/* Arrow */}
          <motion.div
            animate={
              shouldReduceMotion
                ? undefined
                : { x: [0, 3, 0] }
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-primary opacity-0 transition-all duration-300 group-hover:opacity-100"
          >
            <ArrowRight size={16} />
          </motion.div>

          {/* Bottom Accent Line */}
          <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-brand-primary to-blue-300 transition-all duration-500 group-hover:w-full" />
        </Link>
      </motion.div>
    </MotionReveal>
  );
};

const CategoriesSection = ({
  categories,
}: CategoriesSectionProps) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="categories"
      className="relative isolate overflow-hidden py-16 sm:py-20"
    >
      {/* Background Decoration */}
      {!shouldReduceMotion && (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            animate={{
              x: [0, 20, 0],
              y: [0, -15, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -left-32 top-10 size-72 rounded-full bg-blue-100/50 blur-[100px]"
          />

          <motion.div
            animate={{
              x: [0, -20, 0],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -right-32 bottom-0 size-72 rounded-full bg-indigo-100/40 blur-[100px]"
          />
        </div>
      )}

      <div className="relative z-10 w-full px-4 sm:px-6">
        {/* Section Heading */}
        <div className="mb-9 flex flex-col items-center justify-between gap-4 sm:mb-12 sm:flex-row sm:items-end">
          <div className="text-center sm:text-left">
            <motion.span
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-primary"
            >
              <Sparkles size={13} />
              Top Categories
            </motion.span>

            <h2 className="mt-2 text-2xl font-extrabold leading-tight text-brand-text sm:text-3xl">
              Explore Courses by Categories
            </h2>

            <p className="mt-2 text-sm text-brand-text-muted">
              Discover the right learning path for your goals.
            </p>
          </div>

          <Link
            href="/courses"
            className="group inline-flex shrink-0 items-center justify-center gap-1.5 text-sm font-semibold text-brand-primary transition-colors hover:text-brand-primary-hover"
          >
            View All Categories

            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 [perspective:1200px] sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={index}
              />
            ))}
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
