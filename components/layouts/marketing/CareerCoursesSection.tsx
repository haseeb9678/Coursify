
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Clock3,
  ArrowRight,
  Star,
} from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import MotionReveal from "@/components/layouts/marketing/MotionReveal";

import type {
  CareerCourse,
  CareerTrack,
} from "@/features/courses/types/career-course.types";

interface CareerCoursesSectionProps {
  courses: CareerCourse[];
  tracks: CareerTrack[];
}

const CareerCoursesSection = ({
  courses,
  tracks,
}: CareerCoursesSectionProps) => {
  const [selectedTrack, setSelectedTrack] = useState("all");
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  // Filter courses according to the selected career track.
  const filteredCourses = useMemo(() => {
    if (selectedTrack === "all") return courses;

    return courses.filter(
      (course) => course.categorySlug === selectedTrack,
    );
  }, [courses, selectedTrack]);

  // Synchronize carousel position and pagination dots.
  useEffect(() => {
    if (!api) return;

    const updateCarousel = () => {
      setSelectedIndex(api.selectedScrollSnap());
      setSnapCount(api.scrollSnapList().length);
    };

    updateCarousel();

    api.on("select", updateCarousel);
    api.on("reInit", updateCarousel);

    return () => {
      api.off("select", updateCarousel);
      api.off("reInit", updateCarousel);
    };
  }, [api]);

  const handleTrackChange = (slug: string) => {
    setSelectedTrack(slug);
    setSelectedIndex(0);
    setSnapCount(0);
  };

  return (
    <section
      id="career-courses"
      className=" py-16 sm:py-20"
    >
      <div className="w-full px-4 sm:px-6">

        {/* Section heading */}
        <div className="mb-8 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
            Career Tracks
          </span>

          <h2 className="mt-1 text-2xl font-extrabold leading-tight text-brand-text sm:text-3xl lg:text-[34px]">
            Launch Your New Career in Just a Few Months
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-brand-text-muted sm:text-base">
            Build in-demand skills with expert-led courses designed
            to help you move forward in your career.
          </p>
        </div>

        {/* Career track filter tabs */}
        <div
          className="mb-8 flex items-center gap-6 overflow-x-auto border-b border-brand-border sm:gap-8"
          role="tablist"
          aria-label="Filter courses by career track"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedTrack === "all"}
            onClick={() => handleTrackChange("all")}
            className={`shrink-0 border-b-2 pb-3.5 text-sm font-semibold transition-colors ${
              selectedTrack === "all"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-brand-text-muted hover:text-brand-text"
            }`}
          >
            All Courses
          </button>

          {tracks.map((track) => {
            const isActive = selectedTrack === track.slug;

            return (
              <button
                key={track.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTrackChange(track.slug)}
                className={`shrink-0 border-b-2 pb-3.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-brand-primary text-brand-primary"
                    : "border-transparent text-brand-text-muted hover:text-brand-text"
                }`}
              >
                {track.name}
              </button>
            );
          })}
        </div>

        {/* Course carousel */}
        {filteredCourses.length > 0 ? (
          <>
            <Carousel
              key={selectedTrack}
              setApi={setApi}
              opts={{
                align: "start",
                loop: false,
                containScroll: "trimSnaps",
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-3 sm:-ml-4">
                {filteredCourses.map((course, index) => (
                  <CarouselItem
                    key={course.id}
                    className="basis-full pl-3 sm:basis-1/2 sm:pl-4 md:basis-1/3 xl:basis-1/4"
                  >
                    <MotionReveal className="h-full" delay={index * 0.05} hover>
                      <CareerCourseCard course={course} />
                    </MotionReveal>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Carousel pagination */}
            {snapCount > 1 && (
              <div
                className="mt-8 flex items-center justify-center gap-2"
                aria-label="Course carousel pagination"
              >
                {Array.from({ length: snapCount }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => api?.scrollTo(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={
                      selectedIndex === index ? "true" : undefined
                    }
                    className={`h-2 rounded-full transition-all duration-300 ${
                      selectedIndex === index
                        ? "w-6 bg-brand-primary"
                        : "w-2 bg-slate-300 hover:bg-brand-primary/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-brand-border bg-card px-4 text-center">
            <BookOpen
              size={32}
              className="mb-3 text-brand-text-muted"
            />

            <h3 className="font-bold text-brand-text">
              No courses available
            </h3>

            <p className="mt-1 text-sm text-brand-text-muted">
              There are currently no courses in this career track.
            </p>

            <button
              type="button"
              onClick={() => handleTrackChange("all")}
              className="mt-4 text-sm font-semibold text-brand-primary hover:underline"
            >
              Browse all courses
            </button>
          </div>
        )}

        {/* Explore all courses */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-7 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-primary-hover hover:shadow-md"
          >
            Explore All Courses
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

// Reusable career course card
function CareerCourseCard({ course }: { course: CareerCourse }) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: course.currency,
  }).format(course.price);

  const formattedOriginalPrice =
    course.originalPrice !== undefined
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: course.currency,
        }).format(course.originalPrice)
      : null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-brand-border bg-card shadow-sm transition-all duration-300 hover:shadow-lg">

      {/* Course thumbnail */}
      <Link
        href={`/courses/${course.slug}`}
        className="relative block h-44 overflow-hidden"
        aria-label={`View ${course.title}`}
      >
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 hover:scale-105"
        />

        {/* Category badge */}
        <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-bold text-brand-primary shadow-sm backdrop-blur-sm">
          {course.category}
        </span>
      </Link>

      {/* Course information */}
      <div className="flex flex-1 flex-col justify-between space-y-5 p-4 sm:p-5">

        <div className="space-y-3">

          {/* Lessons and duration */}
          <div className="flex items-center justify-between gap-2 text-xs text-brand-text-muted">
            <span className="flex items-center gap-1.5">
              <BookOpen size={14} className="shrink-0 text-brand-primary" />
              {course.lessonCount} Lessons
            </span>

            <span className="flex items-center gap-1.5">
              <Clock3 size={14} className="shrink-0 text-brand-primary" />
              {course.duration}
            </span>
          </div>

          {/* Course title */}
          <Link href={`/courses/${course.slug}`}>
            <h3 className="line-clamp-2 min-h-11 text-base font-bold leading-snug text-brand-text transition-colors hover:text-brand-primary">
              {course.title}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <Star
              size={14}
              fill="currentColor"
              className="text-amber-400"
            />

            <span className="font-bold text-brand-text">
              {course.rating.toFixed(1)}
            </span>

            <span className="text-brand-text-muted">
              ({course.reviewCount.toLocaleString()})
            </span>
          </div>
        </div>

        {/* Price and enrollment */}
        <div className="flex items-center justify-between gap-2 border-t border-brand-border pt-3">
          <div className="min-w-0">
            <p className="text-lg font-extrabold text-brand-primary">
              {formattedPrice}
            </p>

            {formattedOriginalPrice && (
              <p className="text-xs text-brand-text-muted line-through">
                {formattedOriginalPrice}
              </p>
            )}
          </div>

          <Link
            href={`/courses/${course.slug}`}
            className="shrink-0 rounded-md bg-brand-soft px-3 py-2 text-xs font-bold text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
          >
            Enroll Now
          </Link>
        </div>
      </div>
    </article>
  );
}

export default CareerCoursesSection;
