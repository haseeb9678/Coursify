"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import MotionReveal from "@/components/layouts/marketing/MotionReveal";
import type { FeaturedCourse } from "@/features/courses/types/course.types";
import { ArrowUpRight, Flame, Star } from "lucide-react";
import { motion } from "motion/react";

interface FeaturedCoursesSectionProps {
  courses: FeaturedCourse[];
}

const FeaturedCoursesSection = ({
  courses,
}: FeaturedCoursesSectionProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

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

  return (
    <section className="hide-scrollbar border-y border-brand-border/60 bg-brand-page-secondary py-6">
      <div className="w-full px-4 sm:px-6 xl:px-10 2xl:px-15">
        <div className="grid grid-cols-1 items-center gap-8 lg:gap-10">

          {/* Section Introduction */}
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <span className="flex items-center justify-center gap-2 rounded-full border border-primary/30 bg-brand-soft px-6 py-3 text-sm font-extrabold uppercase tracking-[0.1em] text-brand-primary">
              <Flame className="h-5 w-5" />
              Top Rated Courses
            </span>

            <h2 className="max-w-2xl text-2xl font-extrabold leading-tight tracking-tight text-brand-text sm:text-3xl lg:text-4xl">
              We provide you the{" "}
              <span className="bg-gradient-to-r from-brand-primary to-indigo-500 bg-clip-text text-transparent">
                best courses
              </span>
            </h2>
          </div>

          {/* Course Carousel */}
          <div className="min-w-0">
            {courses.length > 0 ? (
              <>
                <Carousel
                  setApi={setApi}
                  opts={{
                    align: "center",
                    loop: false,
                    containScroll: "trimSnaps",
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-3 px-2 py-5">
                    {courses.map((course, index) => (
                      <CarouselItem
                        key={course.id}
                        className="basis-full pl-3 sm:basis-1/2 sm:pl-5 xl:basis-1/3 xl:pl-7"
                      >
                        <MotionReveal
                          className="h-full"
                          delay={index * 0.05}
                          hover
                        >
                          <CourseCard course={course} rank={index + 1} />
                        </MotionReveal>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>

                {/* Navigation Dots */}
                {snapCount > 1 && (
                  <div
                    className="mt-5 flex items-center justify-center gap-2"
                    aria-label="Course carousel navigation"
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
                            : "w-2 bg-brand-border hover:bg-brand-primary/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-brand-border text-sm text-brand-text-muted">
                No featured courses available right now.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

/* Reusable Featured Course Card */
function CourseCard({
  course,
  rank,
}: {
  course: FeaturedCourse;
  rank: number;
}) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group relative flex h-full min-h-[154px] flex-row overflow-hidden rounded-xl border border-primary/30 bg-white/90 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 sm:min-h-0 sm:flex-col sm:bg-white/70 sm:p-5 sm:hover:shadow-primary/20 lg:p-6"
    >
      {/* Decorative Background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-64 bg-gradient-to-b from-brand-primary/[0.10] via-brand-accent/[0.05] to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100 sm:block" />

      <div className="pointer-events-none absolute -right-16 -top-20 hidden size-48 rounded-full bg-brand-accent/[0.10] blur-[70px] transition-all duration-500 group-hover:bg-brand-accent/[0.16] sm:block" />

      {/* Thumbnail */}
      <Link
        href={`/courses/${course.id}`}
        className="relative block min-h-[154px] w-[116px] shrink-0 overflow-hidden bg-brand-page-secondary sm:h-48 sm:min-h-0 sm:w-full sm:rounded-xl lg:h-56"
      >
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          sizes="(max-width: 639px) 116px, (max-width: 1023px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Category */}
        <span className="absolute left-1.5 top-1.5 max-w-[calc(100%-12px)] truncate rounded-full border border-white/30 bg-white/95 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-brand-primary shadow-sm sm:left-3 sm:top-3 sm:px-3 sm:py-1.5 sm:text-[10px]">
          {course.category}
        </span>
      </Link>

      {/* Course Information */}
      <div className="relative flex min-w-0 flex-1 flex-col justify-between p-3 sm:p-0 sm:pt-5 lg:pt-6">

        <div className="min-w-0 space-y-1.5 sm:space-y-3">

          {/* Category for Mobile */}
          <span className="block truncate text-[9px] font-bold uppercase tracking-wider text-brand-primary sm:hidden">
            {course.category}
          </span>

          {/* Course Title */}
          <Link href={`/courses/${course.id}`}>
            <h3 className="line-clamp-2 text-[12px] font-bold leading-4 text-card-foreground transition-colors group-hover:text-brand-primary sm:min-h-12 sm:text-lg sm:leading-6 lg:text-xl">
              {course.title}
            </h3>
          </Link>

          {/* Instructor */}
          <p className="truncate text-[10px] text-brand-text-muted sm:text-xs">
            By {course.instructor}
          </p>

          {/* Rating */}
          <div className="flex flex-wrap items-center gap-1 text-[10px] sm:gap-1.5 sm:text-sm">
            <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400 sm:h-4 sm:w-4" />

            <span className="font-bold text-card-foreground">
              {course.rating.toFixed(1)}
            </span>

            <span className="text-brand-text-muted">
              ({course.reviewCount.toLocaleString()})
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-2 border-t border-brand-border/70 pt-2 sm:mt-5 sm:border-0 sm:pt-0">
          <motion.span
            whileTap={{ scale: 0.98 }}
            className="relative flex w-full max-w-max items-center justify-center gap-1.5 overflow-hidden rounded-lg border border-primary/50 px-2.5 py-2 text-[10px] font-semibold text-primary transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/20 sm:gap-2 sm:px-5 sm:py-3.5 sm:text-sm"
          >
            {/* Hover Light Sweep */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/25 opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
            />

            <span className="relative">Check course</span>

            <ArrowUpRight className="relative h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:h-[17px] sm:w-[17px]" />
          </motion.span>
        </div>

        {/* Rank counter (bottom of card) */}
      <span
  aria-label={`Rank ${rank}`}
  className="pointer-events-none absolute bottom-2 right-3 select-none
    bg-gradient-to-br from-primary via-indigo-500 to-violet-800
    bg-clip-text text-3xl font-black leading-none text-transparent
    opacity-70 transition-all duration-300
    group-hover:opacity-100 group-hover:scale-110
    sm:bottom-0 sm:right-0 sm:text-5xl"
>
  {String(rank).padStart(2, "0")}
</span>
      </div>
    </motion.article>
  );
}

export default FeaturedCoursesSection;