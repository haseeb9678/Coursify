import Image from "next/image";
import { BookOpen, Star, Users } from "lucide-react";

import type { CourseDetails } from "@/features/courses/data/course-details.data";
import { InstructorStat } from "../CourseDetailUI";

export default function InstructorTab({ course }: { course: CourseDetails }) {
  return (
    <section className="space-y-5 rounded-2xl border border-brand-border bg-card p-5 sm:p-7">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
          Meet your instructor
        </span>

        <h2 className="mt-1 text-xl font-extrabold text-brand-text sm:text-2xl">
          Learn from the experts
        </h2>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl border border-primary/15 bg-brand-page-secondary">
          {course.instructor.image ? (
            <Image
              src={course.instructor.image}
              alt={course.instructor.name}
              fill
              unoptimized
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-primary" aria-hidden="true">
              <Users size={32} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-extrabold text-primary">
              {course.instructor.name}
            </h3>

            <p className="mt-1 text-xs font-medium text-brand-text-muted">
              {course.instructor.role}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <InstructorStat
              icon={<Star size={15} className="fill-amber-400 text-amber-400" />}
              value={`${course.instructor.rating ?? "—"} Rating`}
            />

            <InstructorStat
              icon={<Users size={15} className="text-primary" />}
              value={`${course.instructor.students ?? "—"} Students`}
            />

            <InstructorStat
              icon={<BookOpen size={15} className="text-primary" />}
              value={`${course.instructor.courses ?? "—"} Courses`}
            />
          </div>

          <p className="text-sm leading-7 text-brand-text-muted">
            {course.instructor.bio ?? "No instructor bio available."}
          </p>
        </div>
      </div>
    </section>
  );
}