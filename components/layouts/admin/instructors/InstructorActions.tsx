"use client";

import {
  Check,
  Eye,
  FileSearch,
  MoreHorizontal,
  Presentation,
  Star,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdminInstructor } from "@/features/admin/types/management.types";
import type { InstructorDetailsTab } from "./InstructorDetailsSheet";

interface InstructorActionsProps {
  instructor: AdminInstructor;
  onView: (instructor: AdminInstructor, tab: InstructorDetailsTab) => void;
  onApprove: (instructor: AdminInstructor) => void;
  onReject: (instructor: AdminInstructor) => void;
}

export default function InstructorActions({
  instructor,
  onView,
  onApprove,
  onReject,
}: InstructorActionsProps) {
  const canApprove = instructor.approvalStatus !== "APPROVED";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${instructor.name}`}
          />
        }
      >
        <MoreHorizontal size={17} aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => onView(instructor, "overview")}>
          <Eye size={15} aria-hidden="true" />
          View instructor details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onView(instructor, "courses")}>
          <Presentation size={15} aria-hidden="true" />
          View courses
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onView(instructor, "performance")}>
          <Star size={15} aria-hidden="true" />
          Teaching performance
        </DropdownMenuItem>
        {instructor.approvalStatus !== "APPROVED" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onView(instructor, "application")}>
              <FileSearch size={15} aria-hidden="true" />
              Review application
            </DropdownMenuItem>
            {canApprove && (
              <DropdownMenuItem onClick={() => onApprove(instructor)}>
                <Check size={15} aria-hidden="true" />
                Approve application
              </DropdownMenuItem>
            )}
            {instructor.approvalStatus === "PENDING" && (
              <DropdownMenuItem
                onClick={() => onReject(instructor)}
                className="text-destructive focus:text-destructive"
              >
                <X size={15} aria-hidden="true" />
                Reject application
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
