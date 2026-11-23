
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Quote,
  Star,
} from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import MotionReveal from "@/components/layouts/marketing/MotionReveal";

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  review: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export default function TestimonialsSection({
  testimonials,
}: TestimonialsSectionProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [snapCount, setSnapCount] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) return;

    const updateCarousel = () => {
      setSelectedIndex(api.selectedScrollSnap());
      setSnapCount(api.scrollSnapList().length);
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    updateCarousel();

    api.on("select", updateCarousel);
    api.on("reInit", updateCarousel);

    return () => {
      api.off("select", updateCarousel);
      api.off("reInit", updateCarousel);
    };
  }, [api]);

  if (!testimonials.length) return null;

  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div className="w-full px-4 sm:px-6">

        {/* Section Header */}
        <div className="mb-8 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
              Testimonials
            </span>

            <h2 className="mt-2 text-2xl font-extrabold leading-tight text-brand-text sm:text-3xl">
              What Our Students Say
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-brand-text-muted">
              Discover how our learning experience helps students build
              practical skills and move closer to their career goals.
            </p>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => api?.scrollPrev()}
              disabled={!canScrollPrev}
              aria-label="Previous testimonials"
              className="flex size-10 items-center justify-center rounded-full border border-brand-border bg-white text-brand-text transition-all duration-200 hover:border-brand-primary hover:bg-brand-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-brand-border disabled:hover:bg-white disabled:hover:text-brand-text"
            >
              <ArrowLeft size={17} />
            </button>

            <button
              type="button"
              onClick={() => api?.scrollNext()}
              disabled={!canScrollNext}
              aria-label="Next testimonials"
              className="flex size-10 items-center justify-center rounded-full bg-brand-primary text-white transition-all duration-200 hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowRight size={17} />
            </button>
          </div>
        </div>

        {/* Testimonials Carousel */}
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: false,
            containScroll: "trimSnaps",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {testimonials.map((testimonial, index) => (
              <CarouselItem
                key={testimonial.id}
                className="min-w-0 basis-full pl-4 sm:basis-1/2 lg:basis-1/3"
              >
                <MotionReveal
                  className="h-full"
                  delay={index * 0.05}
                  variant="scale"
                  hover
                >
                  <TestimonialCard testimonial={testimonial} />
                </MotionReveal>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Pagination Dots */}
        {snapCount > 1 && (
          <div
            className="mt-8 flex items-center justify-center gap-2"
            aria-label="Testimonial slides"
          >
            {Array.from({ length: snapCount }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => api?.scrollTo(index)}
                aria-label={`Go to testimonial slide ${index + 1}`}
                aria-current={selectedIndex === index ? "true" : undefined}
                className={`h-2 rounded-full transition-all duration-300 ${
                  selectedIndex === index
                    ? "w-7 bg-brand-primary"
                    : "w-2 bg-brand-border hover:bg-brand-primary/50"
                }`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

/* -------------------------------------------------------
   Reusable Testimonial Card
------------------------------------------------------- */

function TestimonialCard({
  testimonial,
}: {
  testimonial: Testimonial;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  const initials = testimonial.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <article className="group flex h-full min-h-[280px] flex-col justify-between rounded-xl border border-brand-soft-border/80 bg-brand-soft p-5 transition-all duration-300 hover:border-brand-primary/20 hover:shadow-lg hover:shadow-brand-primary/5 sm:p-6">

      <div>
        {/* Student Information */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-brand-primary/10 text-sm font-bold text-brand-primary shadow-sm">
            {!imageFailed ? (
              <Image
                src={testimonial.avatar}
                alt={testimonial.name}
                fill
                sizes="48px"
                className="object-cover"
                onError={() => setImageFailed(true)}
              />
            ) : (
              initials
            )}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-brand-text">
              {testimonial.name}
            </h3>

            <p className="mt-0.5 text-xs leading-relaxed text-brand-text-muted">
              {testimonial.role} at {testimonial.company}
            </p>
          </div>
        </div>

        {/* Rating */}
        <div
          className="mt-5 flex items-center gap-1"
          aria-label={`${testimonial.rating} out of 5 stars`}
        >
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              size={15}
              className={
                index < testimonial.rating
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-300"
              }
            />
          ))}
        </div>

        {/* Review */}
        <p className="mt-4 text-sm leading-7 text-[#374151]">
          “{testimonial.review}”
        </p>
      </div>

      {/* Decorative Quote Icon */}
      <div className="mt-5 flex justify-end">
        <Quote
          size={25}
          className="fill-brand-primary/10 text-brand-primary/30"
        />
      </div>
    </article>
  );
}
