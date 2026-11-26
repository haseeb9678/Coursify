import CurriculumBuilderClient from "@/components/layouts/admin/courses/CurriculumBuilderClient";

export const instant = false;

export default async function CourseCurriculumPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <CurriculumBuilderClient courseId={courseId} />;
}
