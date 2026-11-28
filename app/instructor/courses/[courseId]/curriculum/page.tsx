import CurriculumBuilderClient from "@/components/layouts/admin/courses/CurriculumBuilderClient";

export default async function Page({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  return <CurriculumBuilderClient courseId={courseId} />;
}
