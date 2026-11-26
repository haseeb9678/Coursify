
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  ArrowDown,
  ArrowUpRight,
  Award,
  FileText,
  Heart,
  Infinity,
  Play,
  Video,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";

import type { CourseDetails } from "@/features/courses/data/course-details.data";
import { IncludedItem } from "./CourseDetailUI";

interface CourseEnrollmentCardProps {
  course: CourseDetails;
  isWishlisted: boolean;
  onWishlistToggle: () => void;
  onPreview: () => void;
}

export default function CourseEnrollmentCard({
  course,
  isWishlisted,
  onWishlistToggle,
  onPreview,
}: CourseEnrollmentCardProps) {
  const pricingRef = useRef<HTMLDivElement>(null);

  const highlightTimeout = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const [isPricingVisible, setIsPricingVisible] =
    useState(true);

  const [isHighlighted, setIsHighlighted] =
    useState(false);

  const shouldReduceMotion = useReducedMotion();

  const discount =
    course.originalPrice > course.price
      ? Math.round(
          ((course.originalPrice - course.price) /
            course.originalPrice) *
            100,
        )
      : 0;

  const formattedPrice = `$${course.price.toFixed(2)}`;

  const formattedOriginalPrice = `$${course.originalPrice.toFixed(2)}`;

  const enrollmentHref = `/signup?course=${encodeURIComponent(course.id)}`;

  // Observe enrollment controls.
  useEffect(() => {
    const element = pricingRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPricingVisible(
          entry.intersectionRatio >= 0.6,
        );
      },
      {
        threshold: 0.6,
        rootMargin: "-96px 0px -90px 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  // Clean up highlight timeout.
  useEffect(() => {
    return () => {
      if (highlightTimeout.current) {
        clearTimeout(highlightTimeout.current);
      }
    };
  }, []);

  // Scroll to the main enrollment controls.
  const handleScrollToEnrollment = () => {
    pricingRef.current?.scrollIntoView({
      behavior: shouldReduceMotion ? "instant" : "smooth",
      block: "start",
    });

    setIsHighlighted(true);

    if (highlightTimeout.current) {
      clearTimeout(highlightTimeout.current);
    }

    highlightTimeout.current = setTimeout(() => {
      setIsHighlighted(false);
    }, 1800);
  };

  const includedItems = [
    {
      icon: Video,
      label: `${course.duration} of on-demand video`,
    },
    {
      icon: Infinity,
      label: "Full lifetime access",
    },
    ...(course.resources > 0
      ? [
          {
            icon: FileText,
            label: `${course.resources} downloadable resources`,
          },
        ]
      : []),
    ...(course.certificate
      ? [
          {
            icon: Award,
            label: "Certificate of completion",
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Main Enrollment Card */}
      <div
        id="course-enrollment"
        className={`relative w-full scroll-mt-28 rounded-2xl border bg-card transition-[border-color,box-shadow] duration-500 lg:max-h-[calc(100dvh-120px)] lg:overflow-y-auto lg:[scrollbar-width:thin] ${
          isHighlighted
            ? "border-primary/50 ring-4 ring-primary/10"
            : "border-brand-border shadow-xl shadow-primary/[0.05]"
        }`}
      >
        {/* Course Preview */}
        <button
          type="button"
          onClick={onPreview}
          aria-label="Preview this course"
          className="group relative block aspect-video w-full cursor-pointer overflow-hidden rounded-t-2xl bg-brand-page-secondary"
        >
          <Image
            src={course.previewImage}
            alt={`${course.title} preview`}
            fill
            sizes="(max-width: 1023px) 100vw, 440px"
            className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transform-none"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-black/10" />

          {/* Preview Controls */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="flex size-16 items-center justify-center rounded-full border border-white/25 bg-white/15 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 motion-reduce:transform-none">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <Play
                  size={21}
                  strokeWidth={1.5}
                  className="ml-0.5 fill-current"
                />
              </span>
            </span>

            <span className="text-xs font-semibold tracking-wide text-white sm:text-sm">
              Preview this course
            </span>
          </div>
        </button>

        {/* Card Content */}
        <div className="space-y-5 p-5">
          {/* Pricing & Actions */}
          <div
            ref={pricingRef}
            className="scroll-mt-28 space-y-4"
          >
            {/* Price */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-3xl font-extrabold leading-none tracking-tight text-brand-text tabular-nums sm:text-4xl">
                {formattedPrice}
              </span>

              {discount > 0 && (
                <>
                  <span className="text-sm font-medium text-brand-text-muted line-through">
                    {formattedOriginalPrice}
                  </span>

                  <span className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-bold tracking-wide text-primary">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Enrollment Actions */}
            <div className="flex items-center gap-2.5">
              <Link
                href={enrollmentHref}
                className="group relative flex h-12 min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-md shadow-primary/15 transition-all duration-300 hover:bg-brand-primary-hover hover:shadow-lg active:scale-[0.98] motion-reduce:transform-none"
              >
                {/* Shine Effect */}
                <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100" />

                <span className="relative">
                  Enroll Now
                </span>

                <ArrowUpRight
                  size={17}
                  className="relative transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
                />
              </Link>

              {/* Wishlist */}
              <button
                type="button"
                onClick={onWishlistToggle}
                aria-pressed={isWishlisted}
                aria-label={
                  isWishlisted
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
                title={
                  isWishlisted
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
                className={`flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border transition-all duration-300 active:scale-95 motion-reduce:transform-none ${
                  isWishlisted
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-brand-border bg-card text-brand-text-muted hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                }`}
              >
                <Heart
                  size={20}
                  strokeWidth={1.8}
                  className={
                    isWishlisted ? "fill-current" : ""
                  }
                />
              </button>
            </div>
          </div>

          {/* Essential Course Information */}
          <div className="space-y-3.5 border-t border-brand-border pt-4">
            <h3 className="text-sm font-bold tracking-tight text-brand-text">
              This course includes
            </h3>

            <div className="space-y-3">
              {includedItems.map(({ icon: Icon, label }) => (
                <IncludedItem
                  key={label}
                  icon={
                    <Icon
                      size={16}
                      strokeWidth={1.8}
                    />
                  }
                  label={label}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Enrollment Bar */}
      <AnimatePresence initial={false}>
        {!isPricingVisible && (
          <motion.div
            initial={
              shouldReduceMotion
                ? false
                : { y: 100, opacity: 0 }
            }
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : {
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }
            }
            className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-border bg-card/95 px-4 pt-3 shadow-[0_-6px_30px_-10px_rgba(0,0,0,0.15)] backdrop-blur-xl lg:hidden"
            style={{
              paddingBottom:
                "max(12px, env(safe-area-inset-bottom))",
            }}
          >
            <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
              {/* Compact Price */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-2xl font-extrabold leading-none tracking-tight text-brand-text tabular-nums">
                    {formattedPrice}
                  </span>

                  {discount > 0 && (
                    <span className="text-xs font-medium text-brand-text-muted line-through">
                      {formattedOriginalPrice}
                    </span>
                  )}
                </div>

                <p className="mt-1.5 text-[11px] font-medium text-brand-text-muted">
                  {discount > 0 ? (
                    <span className="font-semibold text-primary">
                      {discount}% OFF
                    </span>
                  ) : (
                    "Lifetime access"
                  )}
                </p>
              </div>

              {/* Scroll to Enrollment */}
              <button
                type="button"
                onClick={handleScrollToEnrollment}
                className="group flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/15 transition-all duration-300 hover:bg-brand-primary-hover active:scale-95 motion-reduce:transform-none sm:px-7"
              >
                Enroll Now

                <ArrowDown
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-y-0.5 motion-reduce:transform-none"
                />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
