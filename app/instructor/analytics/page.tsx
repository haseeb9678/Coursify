import AdminPageHeader from "@/components/layouts/admin/shared/AdminPageHeader";
import { InstructorAnalyticsPanel } from "@/features/instructor/InstructorReporting";
import { InstructorPage } from "@/features/instructor/InstructorUI";

export default function Page() {
  return <InstructorPage><AdminPageHeader title="Analytics" description="Explore enrollment, completion, and discussion activity." />
    <InstructorAnalyticsPanel />
  </InstructorPage>;
}
