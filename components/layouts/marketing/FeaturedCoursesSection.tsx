
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
import { ArrowUpRight } from "lucide-react";

import {
  motion,
  
} from "motion/react";

interface FeaturedCoursesSectionProps {
  courses: FeaturedCourse[];
}

const FeaturedCoursesSection = ({
  courses,
}: FeaturedCoursesSectionProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  // Synchronize carousel position and navigation dots.
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
    <section className="border-y border-brand-border/60 bg-brand-page-secondary py-12">
      <div className="w-full px-4 sm:px-6 xl:px-10 2xl:px-15">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-1 lg:gap-10">

          {/* Section introduction */}
         <div className="flex flex-col items-center justify-center gap-4 text-center">

  {/* Section Label */}
            <span className=" rounded-full border border-primary/30 bg-brand-soft px-6
  py-3 text-sm font-extrabold uppercase tracking-[0.1em] text-brand-primary">
    Top Rated Courses
  </span>

  {/* Main Heading */}
  <h2 className="max-w-2xl text-2xl leading-tight font-extrabold tracking-tight text-brand-text sm:text-3xl lg:text-4xl">
    We provide you the{" "}
    <span className="bg-gradient-to-r from-brand-primary to-indigo-500 bg-clip-text text-transparent">
      best courses
    </span>
  </h2>

          </div>

          {/* Responsive course carousel */}
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
                  <CarouselContent className="-ml-3 py-5 px-2">
                    {courses.map((course, index) => (
                      <CarouselItem
                        key={course.id}
                        className="basis-full pl-10 md:basis-1/2 xl:basis-1/3"
                      >
                        <MotionReveal className="h-full" delay={index * 0.05} hover>
                          <CourseCard course={course} />
                        </MotionReveal>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>

                {/* Navigation dots */}
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

// Reusable course card
function CourseCard({ course }: { course: FeaturedCourse }) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="group relative isolate block h-full overflow-hidden rounded-xl border border-primary/30
     hover:border-primary/50
        bg-white/70 px-8 py-8 shadow-sm backdrop-blur-xl min-h-140
        transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:shadow-primary/20"
    >
      {/* Subtle top gradient glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80
          bg-gradient-to-b from-brand-primary/[0.10] via-brand-accent/[0.05] to-transparent
          opacity-80 transition-opacity duration-300 group-hover:opacity-100"
      />

      {/* Soft ambient glow */}
      <div
        className="pointer-events-none absolute -right-16 -top-20 -z-10 size-48
          rounded-full bg-brand-accent/[0.10] blur-[70px]
          transition-all duration-500 group-hover:bg-brand-accent/[0.16]"
      />

      {/* Thumbnail */}
      <div className="relative mx-auto h-70 overflow-hidden rounded-xl">
        <Image
          src={course.thumbnail}
          alt={course.title}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
          className="rounded-xl object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Course information */}
      <div className="relative mt-5 space-y-2">
        <span className="inline-block max-w-full truncate rounded-full border border-primary/20 bg-brand-soft px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-brand-primary">
          {course.category}
        </span>

        <h3 className="line-clamp-1 font-bold text-card-foreground text-xl 2xl:text-2xl">
          {course.title}
        </h3>

        <p className="truncate text-sm text-brand-text-muted">
          By {course.instructor}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 pt-1 text-md md:text-lg font-bold text-card-foreground mt-7">
          <span className="text-amber-400">★★★★★</span>
          <span>{course.rating.toFixed(1)}</span>

          <span className="font-normal text-brand-text-muted">
            ({course.reviewCount.toLocaleString()})
          </span>
        </div>

          <motion.span
  whileTap={{ scale: 0.98 }}
          className="relative mt-auto flex w-full items-center justify-center gap-2 max-w-max
  overflow-hidden rounded-lg border border-primary/60 px-5 py-3.5 text-sm font-semibold text-primary 
  transition-colors duration-300 group-hover:border-primary group-hover:bg-primary
   group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/20 sm:mt-6"
>
  {/* Light sweep on hover */}
  <span
    aria-hidden
    className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/25 opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100"
  />

  <span className="relative">Check course</span>

  <ArrowUpRight
    size={17}
    className="relative transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
  />
</motion.span>

      </div>
    </Link>
  );
}

export default FeaturedCoursesSection;
