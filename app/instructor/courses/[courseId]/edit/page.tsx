import CourseFormClient from "@/components/layouts/admin/courses/CourseFormClient";

export default async function Page({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  return <CourseFormClient mode="edit" courseId={courseId} />;
}
