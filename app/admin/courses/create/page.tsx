import CourseFormClient from "@/components/layouts/admin/courses/CourseFormClient";

export const instant = false;

export default function CreateCoursePage() {
  return <CourseFormClient mode="create" />;
}
