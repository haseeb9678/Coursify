import { sampleAdminInstructors } from "./instructors.data";
import { sampleAdminStudents } from "./students.data";
import { sampleAdminUsers } from "./users.data";
import type { AdminDemoSnapshot } from "@/features/admin/types/management.types";

export const initialAdminDemoSnapshot: AdminDemoSnapshot = {
  users: sampleAdminUsers,
  students: sampleAdminStudents,
  instructors: sampleAdminInstructors,
};
