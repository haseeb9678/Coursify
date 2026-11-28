import AdminPageHeader from "@/components/layouts/admin/shared/AdminPageHeader";
import { InstructorStudentsPanel } from "@/features/instructor/InstructorReporting";
import { InstructorPage } from "@/features/instructor/InstructorUI";

export default function Page() {
  return <InstructorPage><AdminPageHeader title="Enrolled students" description="Search students and track enrollment status across your courses." />
    <InstructorStudentsPanel />
  </InstructorPage>;
}
