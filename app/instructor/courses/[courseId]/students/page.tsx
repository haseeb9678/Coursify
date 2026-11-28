import AdminPageHeader from "@/components/layouts/admin/shared/AdminPageHeader";
import { InstructorStudentsPanel } from "@/features/instructor/InstructorReporting";
import { InstructorPage } from "@/features/instructor/InstructorUI";

export default async function Page({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  return <InstructorPage><AdminPageHeader title="Course students" description="View enrollments for this course." />
    <InstructorStudentsPanel courseId={courseId} />
  </InstructorPage>;
}
