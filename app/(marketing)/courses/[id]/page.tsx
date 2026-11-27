
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCourseById } from "@/features/courses/data/course-details.data";
import CourseDetailsClient from "@/components/layouts/marketing/course-details/CourseDetailsClient";

interface CourseDetailsPageProps {
  params: Promise<{ id: string }>;
}

async function CourseDetailsContent({
  params,
}: CourseDetailsPageProps) {
  const { id } = await params;

  const course = await getCourseById(id);

  if (!course) {
    notFound();
  }

  return <CourseDetailsClient course={course} />;
}

function CourseDetailsFallback() {
  return (
    <main className="min-h-screen animate-pulse bg-background">
      <div className="h-80 bg-brand-page-secondary" />

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <div className="h-8 w-2/3 rounded-lg bg-muted" />
          <div className="h-4 w-full rounded-lg bg-muted" />
          <div className="h-4 w-4/5 rounded-lg bg-muted" />
          <div className="h-64 rounded-2xl bg-muted" />
        </div>

        <div className="h-96 rounded-2xl bg-muted" />
      </div>
    </main>
  );
}

export default function CourseDetailsPage({
  params,
}: CourseDetailsPageProps) {
  return (
    <Suspense fallback={<CourseDetailsFallback />}>
      <CourseDetailsContent params={params} />
    </Suspense>
  );
}
