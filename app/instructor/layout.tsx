import type { ReactNode } from "react";
import InstructorLayoutClient from "@/components/layouts/instructor/InstructorLayoutClient";
import AuthGuard from "@/features/auth/guards/auth-guard";
import { InstructorCourseWorkspace } from "@/features/instructor/course-workspace";

export const instant = false;

export default function InstructorLayout({ children }: { children: ReactNode }) {
  return <AuthGuard allowedRoles={["INSTRUCTOR"]}>
    <InstructorCourseWorkspace>
      <InstructorLayoutClient>{children}</InstructorLayoutClient>
    </InstructorCourseWorkspace>
  </AuthGuard>;
}
