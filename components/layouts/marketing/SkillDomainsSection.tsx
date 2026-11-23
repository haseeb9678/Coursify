
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

import type { SkillDomain } from "@/features/courses/types/skill-domain.types";

interface SkillDomainsSectionProps {
  domains: SkillDomain[];
}

export default function SkillDomainsSection({
  domains,
}: SkillDomainsSectionProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Keep arrow button states synchronized with carousel.
  useEffect(() => {
    if (!api) return;

    const updateButtons = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    updateButtons();

    api.on("select", updateButtons);
    api.on("reInit", updateButtons);

    return () => {
      api.off("select", updateButtons);
      api.off("reInit", updateButtons);
    };
  }, [api]);

  if (!domains.length) return null;

  return (
    <section className="py-16 sm:py-20">
      <div className="w-full px-4 sm:px-6">

        {/* Section Heading */}
        <div className="mb-10 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">
            Trending Domains
          </span>

          <h2 className="mt-1 text-2xl font-extrabold text-brand-text sm:text-3xl">
            Unlock Your New Skills
          </h2>
        </div>

        {/* Carousel Wrapper */}
        <div className="relative px-0 md:px-5">

          {/* Previous Arrow */}
          <button
            type="button"
            onClick={() => api?.scrollPrev()}
            disabled={!canScrollPrev}
            aria-label="Previous skill domains"
            className="absolute -left-5 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-brand-border bg-card text-brand-text shadow-md transition-colors hover:border-brand-primary hover:bg-brand-primary hover:text-white disabled:pointer-events-none disabled:opacity-40 md:flex"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Skills Carousel */}
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: false,
              containScroll: "trimSnaps",
            }}
            className="w-full min-w-0"
          >
            <CarouselContent className="-ml-3 sm:-ml-4">
              {domains.map((domain) => (
                <CarouselItem
                  key={domain.id}
                  className="min-w-0 basis-1/2 pl-3 sm:basis-1/3 sm:pl-4 lg:basis-1/5"
                >
                  <Link
                    href={`/courses?category=${encodeURIComponent(domain.slug)}`}
                    className="group relative block h-[190px] overflow-hidden rounded-xl shadow-sm sm:h-[210px] lg:h-[230px]"
                    aria-label={`Explore ${domain.name} courses`}
                  >
                    {/* Background Image */}
                    <Image
                      src={domain.image}
                      alt={domain.name}
                      fill
                      sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 20vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-colors duration-300 group-hover:from-black/90" />

                    {/* Domain Name */}
                    <div className="absolute inset-x-0 bottom-4 px-2 text-center">
                      <span className="text-sm font-bold tracking-wide text-white sm:text-base">
                        {domain.name}
                      </span>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Next Arrow */}
          <button
            type="button"
            onClick={() => api?.scrollNext()}
            disabled={!canScrollNext}
            aria-label="Next skill domains"
            className="absolute -right-5 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-brand-border bg-card text-brand-text shadow-md transition-colors hover:border-brand-primary hover:bg-brand-primary hover:text-white disabled:pointer-events-none disabled:opacity-40 md:flex"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
