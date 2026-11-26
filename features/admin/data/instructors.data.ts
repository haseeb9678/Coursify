import type {
  AdminInstructorProfile,
  InstructorApprovalStatus,
} from "@/features/admin/types/management.types";
import { sampleAdminUsers } from "./users.data";

const specializations = [
  "Web Development",
  "Product Design",
  "Data Science",
  "Digital Marketing",
  "Business",
  "Cybersecurity",
];

const approvalStatuses: InstructorApprovalStatus[] = [
  "APPROVED",
  "APPROVED",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "APPROVED",
];

export const sampleAdminInstructors: AdminInstructorProfile[] = sampleAdminUsers
  .filter((user) => user.role === "INSTRUCTOR")
  .map((user, index) => ({
    userId: user.id,
    specialization: specializations[index % specializations.length],
    bio: `${user.name.split(" ")[0]} teaches practical ${specializations[index % specializations.length].toLowerCase()} skills through project-based learning.`,
    courses: index % 3 === 0
      ? ["Foundations and Core Concepts", "Advanced Project Workshop"]
      : ["Professional Skills Masterclass"],
    studentsTaught: 180 + ((index * 137) % 2400),
    averageRating: index % 4 === 0 ? null : Number((4.1 + (index % 9) / 10).toFixed(1)),
    reviewCount: index % 4 === 0 ? 0 : 24 + index * 13,
    totalEarnings: 1450 + ((index * 1327) % 28400),
    approvalStatus: approvalStatuses[index % approvalStatuses.length],
    applicationSubmittedAt: new Date(
      Date.UTC(2025, 7, 1 + index * 19, 11),
    ).toISOString(),
  }));
