"use client";

import { Award, BookOpen, Eye, GraduationCap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { AdminStudent } from "@/features/admin/types/management.types";
import type { StudentDetailsTab } from "./StudentDetailsSheet";
import {
  AdminTableActionContent,
  AdminTableActionTrigger,
} from "@/components/layouts/admin/shared/AdminTableActionMenu";

interface StudentActionsProps {
  student: AdminStudent;
  onView: (student: AdminStudent, tab: StudentDetailsTab) => void;
}

export default function StudentActions({ student, onView }: StudentActionsProps) {
  return (
    <DropdownMenu>
      <AdminTableActionTrigger label={`Actions for ${student.name}`} />
      <AdminTableActionContent className="w-52">
        <DropdownMenuItem onClick={() => onView(student, "overview")}>
          <Eye size={15} aria-hidden="true" />
          View student details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onView(student, "enrollments")}>
          <BookOpen size={15} aria-hidden="true" />
          View enrollments
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onView(student, "progress")}>
          <GraduationCap size={15} aria-hidden="true" />
          View learning progress
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onView(student, "certificates")}>
          <Award size={15} aria-hidden="true" />
          View certificates
        </DropdownMenuItem>
      </AdminTableActionContent>
    </DropdownMenu>
  );
}
