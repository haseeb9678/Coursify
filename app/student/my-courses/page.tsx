import type { Metadata } from "next";
import StudentCourses from "@/features/commerce/StudentCourses";

export const metadata: Metadata = { title: "My Courses | Coursify" };

export default function Page() {
  return <StudentCourses />;
}
