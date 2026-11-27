"use client";

import Image from "next/image";
import Link from "next/link";

import { useEffect, useState, type ComponentProps } from "react";

import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

import { motion } from "motion/react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

import { useAccessibleMotion } from "@/features/accessibility/hooks/use-accessible-motion";

import type { HeroSettings } from "@/features/website/website-types";

import type { HeroSlide } from "@/features/home/types/hero-slide.types";

interface HeroSectionProps {
  slides: HeroSlide[];
  settings?: HeroSettings;
  preview?: "desktop" | "mobile";
}

function PreviewAction({ children, className }: Pick<ComponentProps<typeof Link>, "children" | "className">) {
  return <span className={className} aria-disabled="true">{children}</span>;
}

const navigationButtonClassName = `
  absolute z-20
  flex size-10 shrink-0 cursor-pointer
  items-center justify-center rounded-full
  border border-white/20
  bg-card/95 text-brand-text
  shadow-lg backdrop-blur-md
  transition-colors duration-200
  hover:border-primary
  hover:bg-primary hover:text-primary-foreground
  focus-visible:outline-none
  focus-visible:ring-2 focus-visible:ring-primary
  focus-visible:ring-offset-2
  disabled:cursor-not-allowed disabled:opacity-50
  motion-reduce:transition-none
  sm:size-11 lg:size-12
`;

export default function HeroSection({
  slides,
  settings,
  preview,
}: HeroSectionProps) {
  const shouldReduceMotion = useAccessibleMotion();

  const displayedSlides = slides;
  const autoplayDelay = settings?.autoplayDelayMs ?? 6000;
  const loop = settings?.loopEnabled ?? true;
  const showArrows = settings?.showNavigationArrows ?? true;
  const showDots = settings?.showPaginationDots ?? true;
  const ActionLink = preview ? PreviewAction : Link;
  const [paused, setPaused] = useState(false);
  const [failedPreviewImage, setFailedPreviewImage] = useState("");

  const slideCount = displayedSlides.length;

  const [carouselApi, setCarouselApi] =
    useState<CarouselApi>();

  const [activeSlide, setActiveSlide] = useState(0);

  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);

  // Synchronize the active slide.
  useEffect(() => {
    if (!carouselApi) return;

    const synchronizeSlide = () => {
      setActiveSlide(carouselApi.selectedScrollSnap());
    };

    synchronizeSlide();

    carouselApi.on("select", synchronizeSlide);
    carouselApi.on("reInit", synchronizeSlide);

    return () => {
      carouselApi.off("select", synchronizeSlide);
      carouselApi.off("reInit", synchronizeSlide);
    };
  }, [carouselApi]);

  // Pause autoplay when the browser tab is inactive.
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    handleVisibilityChange();

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, []);

  const safeActiveSlide = Math.max(
    0,
    Math.min(activeSlide, slideCount - 1),
  );

  const allowAutoplay = !preview && slideCount > 1 && (settings?.autoplayEnabled ?? true) && !shouldReduceMotion;
  const canAutoplay = allowAutoplay && !paused && isPageVisible &&
    (!isHovered || settings?.pauseOnHover === false) && (!isFocused || settings?.pauseOnFocus === false) &&
    (loop || safeActiveSlide < slideCount - 1);

  // Automatic slide navigation.
  useEffect(() => {
    if (!carouselApi || !canAutoplay) return;

    const timeout = window.setTimeout(() => {
      if (carouselApi.canScrollNext()) {
        carouselApi.scrollNext();
      } else if (loop) {
        carouselApi.scrollTo(0);
      }
    }, autoplayDelay);

    return () => window.clearTimeout(timeout);
  }, [carouselApi, canAutoplay, safeActiveSlide, autoplayDelay, loop]);

  const goToPreviousSlide = () => {
    if (!carouselApi) return;

    if (carouselApi.canScrollPrev()) {
      carouselApi.scrollPrev(shouldReduceMotion);
    } else if (loop) {
      carouselApi.scrollTo(
        slideCount - 1,
        shouldReduceMotion,
      );
    }
  };

  const goToNextSlide = () => {
    if (!carouselApi) return;

    if (carouselApi.canScrollNext()) {
      carouselApi.scrollNext(shouldReduceMotion);
    } else if (loop) {
      carouselApi.scrollTo(0, shouldReduceMotion);
    }
  };

  // Empty state.
  if (slideCount === 0) {
    return (
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-2xl border border-brand-border bg-brand-soft p-8 text-center">
          <GraduationCap
            size={48}
            strokeWidth={1.5}
            className="text-primary"
          />

          <h1 className="text-3xl font-bold tracking-tight text-brand-text">
            Your learning journey starts here.
          </h1>

          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Explore courses
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Featured learning opportunities"
      aria-roledescription="carousel"
      className="relative w-full bg-background"
    >
      <div className="mx-auto w-full max-w-480 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* Carousel Container */}
        <div
          className="relative isolate min-w-0 overflow-hidden rounded-2xl sm:rounded-3xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocusCapture={(event) => {
            setIsFocused(true);
            if (event.target.matches(":focus-visible")) setPaused(true);
          }}
          onBlurCapture={(event) => {
            if (
              !event.currentTarget.contains(
                event.relatedTarget as Node | null,
              )
            ) {
              setIsFocused(false);
            }
          }}
        >
          <Carousel
            setApi={setCarouselApi}
            opts={{
              align: "start",
              loop: loop && slideCount > 1,
              duration: shouldReduceMotion ? 0 : 28,
              slidesToScroll: 1,
            }}
            className="w-full"
          >
            <CarouselContent className="ml-0">
              {displayedSlides.map((slide, index) => {
                const isActive =
                  index === safeActiveSlide;

                const title =
                  slide.title ??
                  slide.label ??
                  "Build skills for your future.";

                const Heading = preview ? "h3" : index === 0 ? "h1" : "h2";
                const imageSource = preview === "mobile" ? slide.mobileSrc || slide.src : slide.src;

                return (
                  <CarouselItem
                    key={slide.id}
                    className="min-w-0 basis-full pl-0"
                    aria-hidden={!isActive}
                    inert={!isActive}
                  >
                    <div
                      className={`
                        relative isolate flex h-full min-w-0
                        flex-col overflow-hidden
                        rounded-2xl border border-brand-border/60
                        bg-brand-soft sm:rounded-3xl
                        ${preview === "desktop" ? "min-h-100 justify-center" : preview === "mobile" ? "" : "lg:min-h-[clamp(400px,32vw,600px)] lg:justify-center"}
                        ${slideCount > 1 ? "pb-16" : ""}
                      `}
                    >
                      {/* Background Image */}
                      <div className={`w-full overflow-hidden bg-brand-soft ${preview === "desktop" ? "absolute inset-0 h-full" : preview === "mobile" ? "relative aspect-16/10" : "relative aspect-16/10 sm:aspect-16/8 lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"}`}>
                        {imageSource && (!preview || failedPreviewImage !== imageSource) && (
                          <picture key={slide.src + (slide.mobileSrc ?? "")}>
                            {!preview && slide.mobileSrc && <source media="(max-width: 639px)" srcSet={slide.mobileSrc} />}
                            <Image
                              src={imageSource}
                              unoptimized
                              onError={(event) => {
                                event.currentTarget.hidden = true;
                                if (preview) setFailedPreviewImage(imageSource);
                              }}
                              alt={slide.alt}
                              fill
                              priority={!preview && index === 0}
                              sizes="(max-width: 768px) 100vw, (max-width: 1920px) 96vw, 1920px"
                              className="object-cover"
                              style={{ objectPosition: slide.imagePosition ?? "center" }}
                            />
                          </picture>
                        )}

                        {preview && imageSource && failedPreviewImage === imageSource && (
                          <p role="status" className="relative z-10 p-3 text-sm text-brand-text-muted">The image could not be loaded.</p>
                        )}

                        {/* Desktop Image Overlay */}
                        <div
                          aria-hidden="true"
                          className={`pointer-events-none absolute inset-0 bg-linear-to-r from-black/25 via-black/5 to-transparent ${preview === "desktop" ? "block" : preview === "mobile" ? "hidden" : "hidden lg:block"}`}
                        />
                      </div>

                      {/* Slide Content */}
                      <div className={`relative z-10 flex w-full flex-1 items-center ${preview === "desktop" ? "px-[7%] py-9" : preview === "mobile" ? "p-3" : "p-3 sm:p-5 lg:px-[7%] lg:py-12"}`}>
                        <motion.div
                          initial={false}
                          animate={{
                            opacity: isActive ? 1 : 0.8,
                            y:
                              shouldReduceMotion || isActive
                                ? 0
                                : 12,
                          }}
                          transition={{
                            duration: shouldReduceMotion
                              ? 0
                              : 0.4,
                            ease: "easeOut",
                          }}
                          className="
                            w-full min-w-0
                            rounded-xl border border-brand-border/60
                            bg-card p-5 shadow-sm
                            sm:rounded-2xl sm:p-7
                            lg:max-w-120 lg:p-8
                            lg:shadow-[0_16px_50px_-15px_rgba(0,0,0,0.18)]
                            xl:max-w-135 xl:p-10
                          "
                        >
                          {/* Eyebrow */}
                          {slide.eyebrow && (
                            <div className="mb-4 flex items-center gap-2">
                              <span
                                aria-hidden="true"
                                className="size-1.5 shrink-0 rounded-full bg-primary"
                              />

                              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary sm:text-xs">
                                {slide.eyebrow}
                              </span>
                            </div>
                          )}

                          {/* Heading */}
                          <Heading className="text-3xl leading-[1.12] font-bold tracking-[-0.035em] text-brand-text text-balance sm:text-4xl xl:text-[2.75rem]">
                            {title}
                          </Heading>

                          {/* Description */}
                          <p className="mt-4 max-w-lg text-sm leading-relaxed text-brand-text-muted sm:text-base">
                            {slide.description ??
                              "Discover expert-led courses and build practical skills at your own pace."}
                          </p>

                          {/* CTA Buttons */}
                          <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-7">
                            <ActionLink
                              href={slide.ctaHref ?? "/courses"}
                              className="
                                group inline-flex min-h-12
                                items-center justify-center gap-2.5
                                rounded-lg bg-primary
                                px-5 py-3 text-sm font-semibold
                                text-primary-foreground
                                transition-colors duration-200
                                hover:bg-primary-hover
                                focus-visible:outline-none
                                focus-visible:ring-2
                                focus-visible:ring-primary
                                focus-visible:ring-offset-2
                                motion-reduce:transition-none
                                sm:px-6
                              "
                            >
                              {slide.ctaLabel ??
                                "Explore courses"}

                              <ArrowUpRight
                                size={18}
                                strokeWidth={1.8}
                                aria-hidden="true"
                                className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none"
                              />
                            </ActionLink>

                            {slide.secondaryCtaLabel &&
                              slide.secondaryCtaHref && (
                                <ActionLink
                                  href={slide.secondaryCtaHref}
                                  className="
                                    inline-flex min-h-12
                                    items-center justify-center
                                    rounded-lg border border-brand-border
                                    bg-background px-5 py-3
                                    text-sm font-semibold text-brand-text
                                    transition-colors
                                    hover:border-primary/40
                                    hover:bg-brand-soft
                                    hover:text-primary
                                    focus-visible:outline-none
                                    focus-visible:ring-2
                                    focus-visible:ring-primary
                                  "
                                >
                                  {slide.secondaryCtaLabel}
                                </ActionLink>
                              )}
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>

          {/* Carousel Navigation */}
          {slideCount > 1 && !preview && (
            <>
              {showArrows && <>
              {/* Previous Slide */}
              <button
                type="button"
                onClick={goToPreviousSlide}
                disabled={!carouselApi || (!loop && safeActiveSlide === 0)}
                aria-label="Previous slide"
                className={`
                  ${navigationButtonClassName}
                  left-2 top-[clamp(3rem,29vw,14rem)]
                  -translate-y-1/2
                  sm:left-3 sm:top-[22vw]
                  lg:left-4 lg:top-1/2
                `}
              >
                <ChevronLeft
                  size={22}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </button>

              {/* Next Slide */}
              <button
                type="button"
                onClick={goToNextSlide}
                disabled={!carouselApi || (!loop && safeActiveSlide === slideCount - 1)}
                aria-label="Next slide"
                className={`
                  ${navigationButtonClassName}
                  right-2 top-[clamp(3rem,29vw,14rem)]
                  -translate-y-1/2
                  sm:right-3 sm:top-[22vw]
                  lg:right-4 lg:top-1/2
                `}
              >
                <ChevronRight
                  size={22}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </button>

              </>}

              {/* Bottom Center Pagination */}
              {(showDots || allowAutoplay) && <div
                role="group"
                aria-label="Slide pagination"
                className="
                  absolute bottom-3 left-1/2 z-20
                  flex max-w-[calc(100%-2rem)]
                  -translate-x-1/2 items-center gap-1
                  overflow-x-auto
                  rounded-full border border-white/15
                  bg-black/35 px-3 py-1
                  shadow-sm backdrop-blur-md
                  sm:bottom-4 sm:px-4
                  lg:bottom-5
                "
              >
                {showDots && displayedSlides.map((slide, index) => {
                  const isActive =
                    safeActiveSlide === index;

                  return (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() =>
                        carouselApi?.scrollTo(
                          index,
                          shouldReduceMotion,
                        )
                      }
                      disabled={!carouselApi}
                      aria-label={`Go to slide ${index + 1}`}
                      aria-current={
                        isActive ? "true" : undefined
                      }
                      className="
                        group flex h-7 min-w-6 shrink-0
                        cursor-pointer items-center
                        justify-center rounded-full
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-white
                        disabled:cursor-default
                      "
                    >
                      <span
                        className={`
                          relative h-1.5 overflow-hidden
                          rounded-full
                          transition-all duration-300
                          motion-reduce:transition-none
                          ${
                            isActive
                              ? "w-8 bg-white/30 sm:w-10"
                              : "w-2 bg-white/50 group-hover:bg-white/90"
                          }
                        `}
                      >
                        {isActive && (
                          <motion.span
                            key={`${slide.id}-${canAutoplay}`}
                            initial={{
                              width: canAutoplay
                                ? "0%"
                                : "100%",
                            }}
                            animate={{
                              width: "100%",
                            }}
                            transition={{
                              duration: canAutoplay
                                ? autoplayDelay / 1000
                                : 0,
                              ease: "linear",
                            }}
                            className="absolute inset-y-0 left-0 rounded-full bg-white"
                          />
                        )}
                      </span>
                    </button>
                  );
                })}
                {allowAutoplay && (
                  <button type="button" onClick={() => setPaused((value) => !value)} className="rounded-full px-2 py-1 text-xs font-semibold text-white focus-visible:ring-2 focus-visible:ring-white">
                    {paused ? "Play" : "Pause"}<span className="sr-only"> slides</span>
                  </button>
                )}
              </div>}
            </>
          )}
        </div>
      </div>
    </section>
  );
}