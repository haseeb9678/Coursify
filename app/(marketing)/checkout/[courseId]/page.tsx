import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CheckoutSummary } from "@/features/commerce/CheckoutViews";
import { CommerceLoading } from "@/features/commerce/CommerceUi";
import { getCourseById } from "@/features/courses/data/course-details.data";

export const metadata = { title: "Checkout | Coursify", robots: { index: false, follow: false } };

async function CheckoutContent({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = await getCourseById(courseId);
  if (!course) notFound();
  return <CheckoutSummary course={course} />;
}

export default function CheckoutPage({ params }: { params: Promise<{ courseId: string }> }) {
  return <Suspense fallback={<div className="mx-auto max-w-5xl px-4 py-10"><CommerceLoading label="Loading checkout" /></div>}>
    <CheckoutContent params={params} />
  </Suspense>;
}
