
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
      <div className="w-full px-4 sm:px-6 xl:px-10 2xl:px-15 flex flex-col gap-10">

        {/* Section heading */}
          <div className="flex flex-col items-center justify-center gap-4 text-center">

  {/* Section Label */}
            <span className=" rounded-full border border-primary/30 bg-brand-soft px-6
  py-3 text-sm font-extrabold uppercase tracking-[0.1em] text-brand-primary">
    Career Tracks
  </span>

  {/* Main Heading */}
  <h2 className="max-w-xl text-2xl leading-tight font-extrabold tracking-tight text-brand-text sm:text-3xl lg:text-4xl">
   Launch Your New Career in Just a Few Months
  </h2>

          </div>

        {/* Career track filter tabs */}
        <div
          className="mx-auto 2xl:min-w-[60%] flex items-center justify-between gap-6 
          overflow-x-auto border-b border-brand-border sm:gap-8"
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
              className="w-full xl:px-8"
            >
              <CarouselContent className="-ml-3 sm:-ml-4 py-5">
                {filteredCourses.map((course, index) => (
                  <CarouselItem
                    key={course.id}
                    className="pl-3 md:pl-6 basis-1/2 sm:pl-4 md:basis-1/3 xl:basis-1/4"
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
                className="mt-1 flex items-center justify-center gap-2"
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
            <div className="flex min-h-64 xl:min-w-200 xl:max-w-250 xl:mx-auto xl:p-15 flex-col items-center justify-center 
          rounded-xl border-2 border-dashed border-brand-border bg-card px-4 text-center">
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
<div className="mt-3 flex justify-center">
  <Link
    href="/courses"
    className="group relative inline-flex items-center gap-2 overflow-hidden rounded-md bg-primary px-7 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-primary-hover hover:shadow-lg hover:shadow-primary/20"
  >
    {/* Light sweep */}
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
    />

    <span className="relative">Explore All Courses</span>

    <ArrowRight
      size={16}
      className="relative transition-transform duration-300 group-hover:translate-x-1"
    />
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
    <article className="flex h-full flex-col overflow-hidden rounded-xl border
     border-brand-border hover:border-primary/70
    bg-card shadow-sm transition-all duration-300 hover:shadow-lg">

      {/* Course thumbnail */}
      <Link
        href={`/courses/${course.slug}`}
        className="relative block h-55 overflow-hidden"
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
        <span className="absolute left-3 top-3 rounded-md bg-white/80 px-2.5 py-1 
        text-[11px] font-bold text-brand-primary shadow-sm backdrop-blur-sm">
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
            <h3 className="line-clamp-2 min-h-11 text-base font-bold leading-snug text-brand-text 
            transition-colors hover:text-brand-primary">
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
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-border pt-3">
          <div className="min-w-0">
            <p className="text-xl font-extrabold text-brand-primary">
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
