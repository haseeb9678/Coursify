"use client";

import { toast } from "sonner";

import AdminConfirmDialog from "@/components/layouts/admin/shared/AdminConfirmDialog";
import { useAdminCourseAction, useUpdateCourseFeatured } from "@/features/admin/hooks/use-admin-learning";
import type { AdminCourse } from "@/features/admin/types/learning.types";
import { getCourseActionCopy, type CourseAdminAction } from "@/features/admin/utils/learning.utils";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";

export type PendingCourseAction = { course: AdminCourse; action: CourseAdminAction };

export default function CourseLifecycleDialog({
  pending,
  onClose,
  onComplete,
}: {
  pending: PendingCourseAction | null;
  onClose: () => void;
  onComplete?: (pending: PendingCourseAction) => void;
}) {
  const lifecycle = useAdminCourseAction();
  const featured = useUpdateCourseFeatured();
  const copy = pending && getCourseActionCopy(pending.action, pending.course);
  const isUnpublishing = pending?.action === "restore" && pending.course.status === "PUBLISHED";

  const confirm = async () => {
    if (!pending || !copy) return;
    const { course, action } = pending;
    try {
      if (action === "featured") {
        await featured.mutateAsync({ id: course.id, isFeatured: !course.isFeatured });
      } else {
        const updated = await lifecycle.mutateAsync({
          id: course.id,
          action,
          expectedStatus: action === "restore" ? course.status : undefined,
        });
        if (action === "restore" && updated?.status !== "DRAFT") {
          throw new Error("The server did not confirm that the course returned to draft.");
        }
      }
      toast.success(copy.success);
      onClose();
      onComplete?.(pending);
    } catch (error) {
      toast.error(getGraphQLErrorMessage(error));
    }
  };

  return (
    <AdminConfirmDialog
      open={pending !== null}
      onOpenChange={(open) => { if (!open) onClose(); }}
      title={copy ? `${copy.label}?` : "Confirm course action"}
      description={copy?.description ?? ""}
      confirmLabel={copy?.label ?? "Confirm"}
      isDestructive={isUnpublishing || pending?.action === "archive" || pending?.action === "delete"}
      onConfirm={confirm}
    />
  );
}
