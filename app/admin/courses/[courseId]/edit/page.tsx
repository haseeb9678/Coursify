import CourseFormClient from "@/components/layouts/admin/courses/CourseFormClient";

export const instant = false;

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <CourseFormClient mode="edit" courseId={courseId} />;
}
