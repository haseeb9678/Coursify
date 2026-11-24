import { Star } from "lucide-react";

import type { CourseDetails } from "@/features/courses/data/course-details.data";

export default function ReviewsTab({ course }: { course: CourseDetails }) {
  const ratingDistribution = [
    { rating: 5, percentage: "85%" },
    { rating: 4, percentage: "10%" },
    { rating: 3, percentage: "3%" },
    { rating: 2, percentage: "1%" },
    { rating: 1, percentage: "1%" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
          Student feedback
        </span>

        <h2 className="mt-1 text-xl font-extrabold text-brand-text sm:text-2xl">
          What students are saying
        </h2>
      </div>

      <div className="flex flex-col gap-5 rounded-2xl border border-brand-border bg-brand-page-secondary/70 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="text-center sm:min-w-36">
          <p className="text-5xl font-extrabold tracking-tight text-brand-text">
            {course.rating.toFixed(1)}
          </p>

          <div className="mt-2 flex justify-center gap-0.5 text-amber-400">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} size={15} className="fill-current" />
            ))}
          </div>

          <p className="mt-1 text-[10px] text-brand-text-muted">
            {course.reviewCount.toLocaleString()} ratings
          </p>
        </div>

        <div className="h-px flex-1 bg-brand-border sm:h-20 sm:w-px sm:flex-none" />

        <div className="flex-1 space-y-2">
          {ratingDistribution.map(({ rating, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <span className="w-3 text-xs font-semibold text-brand-text-muted">
                {rating}
              </span>

              <Star size={12} className="fill-amber-400 text-amber-400" />

              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-border">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: percentage }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {course.reviews.map((review) => (
          <article
            key={review.name}
            className="rounded-2xl border border-brand-border bg-card p-5 transition-colors hover:border-primary/20"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-brand-text">
                  {review.name}
                </h3>

                <p className="mt-0.5 text-[10px] text-brand-text-muted">
                  {review.role}
                </p>
              </div>

              <div className="flex shrink-0 gap-0.5 text-amber-400">
                {Array.from({ length: review.rating }).map((_, index) => (
                  <Star key={index} size={12} className="fill-current" />
                ))}
              </div>
            </div>

            <p className="mt-4 text-xs leading-6 text-brand-text-muted">
              {review.comment}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}