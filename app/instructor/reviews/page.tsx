import AdminPageHeader from "@/components/layouts/admin/shared/AdminPageHeader";
import { InstructorReviewsPanel } from "@/features/instructor/InstructorReporting";
import { InstructorPage } from "@/features/instructor/InstructorUI";

export default function Page() {
  return <InstructorPage><AdminPageHeader title="Review feedback" description="See publication decisions and revision requests from the course review team." />
    <InstructorReviewsPanel />
  </InstructorPage>;
}
