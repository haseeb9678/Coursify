import { Suspense } from "react";
import { notFound } from "next/navigation";
import { StudentLearningPage } from "@/features/commerce/StudentCommerce";
import StudentLearningSkeleton from "@/features/commerce/StudentLearningSkeleton";

type PageProps = { params: Promise<{ courseId: string }> };

async function Content({ params }: PageProps) {
  const { courseId } = await params;
  if (!/^[a-fA-F0-9]{8}(?:-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12}$/.test(courseId)) notFound();
  return <StudentLearningPage courseId={courseId} />;
}

export default function Page({ params }: PageProps) {
  return <Suspense fallback={<StudentLearningSkeleton />}><Content params={params} /></Suspense>;
}
