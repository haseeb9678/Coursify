"use client";

import { Award, BookOpen, Eye, GraduationCap, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminStudent } from "@/features/admin/types/management.types";
import type { StudentDetailsTab } from "./StudentDetailsSheet";

interface StudentActionsProps {
  student: AdminStudent;
  onView: (student: AdminStudent, tab: StudentDetailsTab) => void;
}

export default function StudentActions({ student, onView }: StudentActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${student.name}`}
          />
        }
      >
        <MoreHorizontal size={17} aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
