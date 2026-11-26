import type { AdminStudentProfile } from "@/features/admin/types/management.types";
import { sampleAdminUsers } from "./users.data";

const courses = [
  "Complete Web Development",
  "Product Design Fundamentals",
  "Practical Data Analysis",
  "Digital Marketing Strategy",
  "Business Communication",
  "Python for Beginners",
];

export const sampleAdminStudents: AdminStudentProfile[] = sampleAdminUsers
  .filter((user) => user.role === "STUDENT")
  .map((user, studentIndex) => {
    const enrollmentCount = 1 + (studentIndex % 5);
    const enrollments = Array.from({ length: enrollmentCount }, (_, index) => {
      const progress = (studentIndex * 11 + index * 23) % 101;
      return {
        courseId: `course-${(studentIndex + index) % courses.length + 1}`,
        courseName: courses[(studentIndex + index) % courses.length],
        progress,
        status: progress === 100 ? "COMPLETED" as const : "IN_PROGRESS" as const,
        enrolledAt: new Date(
          Date.UTC(2025, 5, 1 + ((studentIndex * 13 + index * 9) % 500), 10),
        ).toISOString(),
      };
    });

    return {
      userId: user.id,
      enrollments,
      certificates: enrollments
        .filter((enrollment) => enrollment.status === "COMPLETED")
        .map((enrollment) => `${enrollment.courseName} Certificate`),
      lastActivityAt:
        studentIndex % 8 === 0
          ? null
          : new Date(
              Date.UTC(2026, 10, 25 - (studentIndex % 40), 14),
            ).toISOString(),
    };
  });
