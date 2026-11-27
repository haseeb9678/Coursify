"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";
import type { CourseDetails } from "@/features/courses/data/course-details.data";
import { commerceApi } from "./commerce.api";
import { commerceKeys, refreshCommerce } from "./commerce-cache";
import { commerceLogin } from "./return-path";

export function useCourseEnrollment(course: CourseDetails) {
  const { user, isInitialized } = useAuthStore();
  const student = user?.role === "STUDENT" && user.status === "ACTIVE";
  const router = useRouter();
  const queryClient = useQueryClient();
  const submitting = useRef(false);
  const isFree = course.pricing.type === "FREE";
  const status = useQuery({
    queryKey: [...commerceKeys.scope("student", user?.id), "course", course.id],
    queryFn: () => commerceApi.enrollmentStatus(course.id),
    enabled: student,
    retry: false,
    staleTime: 0,
  });

  const enrollment = useMutation({ mutationFn: commerceApi.enrollFree });
  async function enroll() {
    if (submitting.current) return;
    submitting.current = true;
    try {
      const result = await enrollment.mutateAsync(course.id);
      await refreshCommerce(queryClient, user?.id);
      toast.success("You are enrolled. Your course is ready.");
      router.push(`/student/learning/${result.course.id}`);
    } catch (error) {
      toast.error(getGraphQLErrorMessage(error));
    } finally {
      submitting.current = false;
    }
  }

  const current = status.data;
  if (!isInitialized || (student && (status.isPending || (!status.isFetchedAfterMount && status.isFetching)))) return { label: "Checking enrollment", busy: true, disabled: true };
  if (!user) return {
    label: isFree ? "Sign in to enroll" : "Sign in to purchase",
    href: commerceLogin(`/courses/${course.id}`),
  };
  if (!student) return { label: "Student account required", disabled: true };
  if (status.isError && !current) return {
    label: "Retry enrollment check", busy: status.isFetching, action: () => void status.refetch(),
  };
  if (current?.canAccess) return {
    label: current.enrollmentStatus === "COMPLETED" ? "Review course" : "Go to course",
    href: `/student/learning/${course.id}`,
  };
  if (current?.pendingOrderId) return {
    label: "Continue checkout",
    href: `/checkout/cancel?order=${encodeURIComponent(current.pendingOrderId)}`,
  };
  if (!current?.available || (!isFree && !current.paymentsEnabled)) return { label: "Currently unavailable", disabled: true };
  if (isFree) return { label: "Enroll for free", busy: enrollment.isPending, action: () => void enroll() };
  return { label: "Buy now", href: `/checkout/${course.id}` };
}
