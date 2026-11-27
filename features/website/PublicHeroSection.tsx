"use client";

import HeroSection from "@/components/layouts/marketing/Hero";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicHero } from "./website-hooks";
import { PUBLIC_CONTENT_MAX_AGE_MS, toHeroSlide } from "./website-display";
import { usePublicationClock } from "./use-publication-clock";

export default function PublicHeroSection() {
  const query = usePublicHero();
  const data = query.data;
  const cacheEnd = data ? Date.parse(data.serverTime) + PUBLIC_CONTENT_MAX_AGE_MS : Infinity;
  const expirationTimes = [
    ...(data ? [new Date(cacheEnd).toISOString()] : []),
    ...(data?.slides ?? []).flatMap((slide) => slide.endsAt ? [slide.endsAt] : []),
  ].join(",");
  const clock = usePublicationClock(data, expirationTimes);
  const slides = (data?.slides ?? []).filter((slide) => !slide.endsAt || Date.parse(slide.endsAt) > clock);

  if (query.isPending) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8" role="status">
        <span className="sr-only">Loading featured banners</span>
        <Skeleton className="aspect-16/10 w-full rounded-2xl sm:aspect-16/8 lg:aspect-auto lg:h-[clamp(400px,32vw,600px)]" aria-hidden="true" />
      </div>
    );
  }
  if (query.isError || !data) return <HeroSection slides={[]} />;
  if (!data.settings.isEnabled) return null;
  if (clock >= cacheEnd) return <HeroSection slides={[]} />;
  return <HeroSection settings={data.settings} slides={slides.map(toHeroSlide)} />;
}
