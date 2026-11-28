import AdminPageHeader from "@/components/layouts/admin/shared/AdminPageHeader";
import { InstructorStudentsPanel } from "@/features/instructor/InstructorReporting";
import { InstructorPage } from "@/features/instructor/InstructorUI";

export default async function Page({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  return <InstructorPage><AdminPageHeader title="Student details" description="Enrollment history for courses you teach." />
    <InstructorStudentsPanel studentId={studentId} />
  </InstructorPage>;
}
