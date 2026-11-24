import StudentDashboardClient from "@/components/layouts/student/dashboard/StudentDashboardClient";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Student Dashboard | Coursify",
  description:
    "Track your learning progress and achieve your learning goals.",
};

export default function StudentDashboardPage() {
  return <StudentDashboardClient />;
}