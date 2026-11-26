import CourseDetailsClient from "@/components/layouts/admin/courses/CourseDetailsClient";

export const instant = false;

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <CourseDetailsClient courseId={courseId} />;
}
