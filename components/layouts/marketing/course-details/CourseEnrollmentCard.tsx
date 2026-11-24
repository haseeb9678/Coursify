"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Award,
  FileText,
  Heart,
  Infinity,
  Video,
} from "lucide-react";

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
  const discount =
    course.originalPrice > course.price
      ? Math.round(
          ((course.originalPrice - course.price) / course.originalPrice) * 100,
        )
      : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-border bg-card shadow-xl shadow-primary/[0.06] lg:sticky lg:top-28">
      <button
        type="button"
        onClick={onPreview}
        aria-label="Preview this course"
        className="group relative block h-52 w-full overflow-hidden bg-brand-page-secondary sm:h-64 lg:h-52"
      >
        <Image
          src={course.previewImage}
          alt={`${course.title} preview`}
          fill
          sizes="(max-width: 1023px) 100vw, 400px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/10" />

        <span className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <span className="flex size-14 items-center justify-center rounded-full bg-white text-primary shadow-xl transition-transform duration-300 group-hover:scale-110">
            <Video size={22} className="fill-current" />
          </span>

          <span className="text-xs font-bold tracking-wide text-white">
            Preview this course
          </span>
        </span>

        <span className="absolute bottom-3 right-3 rounded-md bg-black/50 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
          Course preview
        </span>
      </button>

      <div className="space-y-5 p-5 sm:p-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-3xl font-extrabold tracking-tight text-brand-text">
              ${course.price.toFixed(2)}
            </span>

            {discount > 0 && (
              <>
                <span className="text-sm text-brand-text-muted line-through">
                  ${course.originalPrice.toFixed(2)}
                </span>

                <span className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-extrabold text-primary">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          <p className="mt-1 text-[11px] text-brand-text-muted">
            One-time payment · Lifetime access
          </p>
        </div>

        <div className="space-y-2.5">
          <Link
            href={`/signup?course=${encodeURIComponent(course.id)}`}
            className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-primary-hover hover:shadow-lg"
          >
            <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100" />

            <span className="relative">Enroll Now</span>

            <ArrowUpRight
              size={17}
              className="relative transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>

          <button
            type="button"
            onClick={onWishlistToggle}
            aria-pressed={isWishlisted}
            className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl border text-sm font-bold transition-all ${
              isWishlisted
                ? "border-primary/30 bg-primary/5 text-primary"
                : "border-brand-border bg-background text-brand-text hover:border-primary/30 hover:bg-brand-soft hover:text-primary"
            }`}
          >
            <Heart
              size={17}
              className={isWishlisted ? "fill-current" : ""}
            />

            {isWishlisted ? "Added to Wishlist" : "Add to Wishlist"}
          </button>
        </div>

        <p className="text-center text-[11px] text-brand-text-muted">
          Secure enrollment · Start learning at your own pace
        </p>

        <div className="space-y-4 border-t border-brand-border pt-5">
          <h3 className="text-xs font-extrabold uppercase tracking-[0.12em] text-brand-text">
            This course includes
          </h3>

          <div className="space-y-3">
            <IncludedItem
              icon={<Video size={16} />}
              label={`${course.duration} on-demand video`}
            />

            <IncludedItem
              icon={<FileText size={16} />}
              label={`${course.resources} downloadable resources`}
            />

            <IncludedItem
              icon={<Infinity size={16} />}
              label="Full lifetime access"
            />

            <IncludedItem
              icon={<Award size={16} />}
              label={
                course.certificate
                  ? "Certificate of completion"
                  : "No certificate included"
              }
            />

            <IncludedItem
              icon={<Video size={16} />}
              label="Access on desktop and mobile"
            />
          </div>
        </div>

        <div className="rounded-xl bg-brand-page-secondary p-3 text-center">
          <p className="text-[11px] leading-relaxed text-brand-text-muted">
            Learn from industry experts and build skills that move your career
            forward.
          </p>
        </div>
      </div>
    </div>
  );
}