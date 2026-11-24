
import CourseCatalog from "@/components/layouts/marketing/courses/CourseCatalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Courses",
  description:
    "Explore professional courses, learn new skills, and discover your next learning opportunity with Coursify.",
};

export default function CoursesPage() {
  return <CourseCatalog />;
}
