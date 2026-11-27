import AdminCourseApprovalsClient from "@/components/layouts/admin/courses/AdminCourseApprovalsClient";

export const instant = false;

export default async function AdminCourseApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string | string[] }>;
}) {
  const { courseId } = await searchParams;
  const selectedCourseId = typeof courseId === "string" ? courseId : undefined;
  return <AdminCourseApprovalsClient key={selectedCourseId} initialCourseId={selectedCourseId} />;
}
