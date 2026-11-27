"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LockKeyhole } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { CourseDetails } from "@/features/courses/data/course-details.data";
import { getGraphQLErrorMessage } from "@/lib/graphql/error";
import { commerceApi } from "./commerce.api";
import { commerceKeys, refreshCommerce } from "./commerce-cache";
import { commerceDate, commerceMoney, openStripeCheckout, statusLabel } from "./commerce-format";
import { CommerceLink, CommerceLoading, CommerceMessage, StudentCheckoutGate } from "./CommerceUi";
import type { CheckoutStatus } from "./commerce.types";

const paidStates = ["PAID", "PARTIALLY_REFUNDED", "REFUNDED"];

export function CheckoutSummary({ course }: { course: CourseDetails }) {
  return (
    <main className="mx-auto max-w-5xl space-y-5 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-brand-text">Checkout</h1>
      <StudentCheckoutGate path={`/checkout/${course.id}`}>
        <CheckoutSummaryForm course={course} />
      </StudentCheckoutGate>
    </main>
  );
}

function CheckoutSummaryForm({ course }: { course: CourseDetails }) {
  const userId = useAuthStore((state) => state.user?.id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const inProgress = useRef(false);
  const quote = useQuery({
    queryKey: [...commerceKeys.scope("student", userId), "quote", course.id],
    queryFn: () => commerceApi.quote(course.id),
    retry: false,
    staleTime: 0,
  });
  const start = useMutation({ mutationFn: commerceApi.createCheckout });
  const price = quote.data;

  async function proceed() {
    if (inProgress.current || !price?.paymentsEnabled) return;
    inProgress.current = true;
    try {
      const session = await start.mutateAsync({
        courseId: course.id, currency: price.currency, amountMinorUnits: price.totalMinorUnits,
      });
      void queryClient.invalidateQueries({ queryKey: commerceKeys.scope("student", userId) });
      if (session.checkoutUrl) openStripeCheckout(session.checkoutUrl);
      else router.push(`/checkout/success?order=${encodeURIComponent(session.orderId)}`);
    } catch (error) {
      toast.error(getGraphQLErrorMessage(error));
      void quote.refetch();
      inProgress.current = false;
    }
  }

  if (quote.isPending) return <CommerceLoading label="Loading checkout summary" />;
  if (quote.isError || !price) {
    return <CommerceMessage title="Checkout unavailable" message={getGraphQLErrorMessage(quote.error)}
      actions={<><Button variant="outline" busy={quote.isFetching} onClick={() => void quote.refetch()}>Try again</Button>
        <CommerceLink href={`/courses/${course.id}`}>Return to course</CommerceLink></>} />;
  }

  return (
    <div className="grid gap-5 md:grid-cols-[1.2fr_1fr]">
      <section className="overflow-hidden rounded-xl border border-brand-border bg-card">
        {course.previewImage && <Image src={course.previewImage} alt="" width={720} height={405} unoptimized
          className="aspect-video w-full object-cover" />}
        <div className="space-y-2 p-5">
          <p className="text-sm text-brand-text-muted">{course.category} ? {course.level}{course.duration ? ` ? ${course.duration}` : ""}</p>
          <h2 className="text-xl font-semibold text-brand-text">{course.title}</h2>
          <p className="text-sm text-brand-text-muted">{course.instructor.name}</p>
          <CommerceLink href={`/courses/${course.id}`}>Return to course</CommerceLink>
        </div>
      </section>
      <section className="space-y-4 self-start rounded-xl border border-brand-border bg-card p-5">
        <h2 className="text-lg font-semibold text-brand-text">Order summary</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-2"><dt>Original price</dt><dd>{commerceMoney(price.subtotalMinorUnits, price.currency)}</dd></div>
          <div className="flex justify-between gap-2"><dt>Discount</dt><dd>{commerceMoney(price.discountMinorUnits, price.currency)}</dd></div>
          <div className="flex justify-between gap-2 border-t border-brand-border pt-3 font-semibold">
            <dt>Total ? {price.currency}</dt><dd>{commerceMoney(price.totalMinorUnits, price.currency)}</dd>
          </div>
        </dl>
        <p className="flex items-center gap-2 text-sm text-brand-text-muted"><LockKeyhole className="size-4" aria-hidden /> Secure card payment through Stripe</p>
        <p className="rounded-md bg-brand-soft p-3 text-sm text-brand-text">
          Stripe Sandbox. Use a Stripe test card. {price.paymentsEnabled ? "" : "Checkout is unavailable until the site administrator configures Sandbox credentials."}
        </p>
        <Button type="button" className="h-10 w-full" busy={start.isPending} disabled={!price.paymentsEnabled || quote.isFetching} onClick={() => void proceed()}>
          {price.pendingOrderId ? "Continue checkout" : "Proceed to payment"}
        </Button>
      </section>
    </div>
  );
}

interface CheckoutResultProps { orderId: string; sessionId?: string; returnedAfterCancel: boolean }

export function CheckoutResult(props: CheckoutResultProps) {
  const route = props.returnedAfterCancel ? "/checkout/cancel" : "/checkout/success";
  const returnPath = props.orderId
    ? `${route}?order=${encodeURIComponent(props.orderId)}${props.sessionId ? "&session_id=" + encodeURIComponent(props.sessionId) : ""}`
    : route;

  return (
    <main className="mx-auto max-w-3xl space-y-5 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-brand-text">Checkout status</h1>
      <StudentCheckoutGate path={returnPath}>
        {props.orderId
          ? <OrderVerification key={props.orderId} {...props} />
          : <CommerceMessage title="Order reference is missing" actions={<CommerceLink href="/courses">Browse courses</CommerceLink>} />}
      </StudentCheckoutGate>
    </main>
  );
}

function OrderVerification({ orderId, sessionId, returnedAfterCancel }: CheckoutResultProps) {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const key = [...commerceKeys.scope("student", userId), "checkout", orderId] as const;
  const [startTime] = useState(() => Date.now());
  const checked = useRef(false);
  const status = useQuery({
    queryKey: key, queryFn: () => commerceApi.status(orderId), retry: false, staleTime: 0,
    refetchInterval: (query) => query.state.data?.status === "PENDING" && Date.now() - startTime < 60_000 ? 3_500 : false,
  });
  const { mutate: reconcile, isPending: reconciling } = useMutation({
    mutationFn: commerceApi.reconcile,
    onSuccess: (confirmed) => queryClient.setQueryData(key, confirmed),
    onError: (error) => toast.error(getGraphQLErrorMessage(error)),
  });
  const current = status.data;

  useEffect(() => {
    if (current?.status === "PENDING" && !checked.current) {
      checked.current = true;
      reconcile({ orderId, sessionId });
    }
  }, [current?.status, orderId, reconcile, sessionId]);

  const orderStatus = current?.status;
  useEffect(() => {
    if (orderStatus && orderStatus !== "PENDING") void refreshCommerce(queryClient, userId);
  }, [orderStatus, queryClient, userId]);

  if (status.isPending) return <CommerceLoading label="Verifying payment" />;
  if (!current) {
    return <CommerceMessage title="Unable to verify payment" message={getGraphQLErrorMessage(status.error)}
      actions={<Button variant="outline" busy={status.isFetching} onClick={() => void status.refetch()}>Refresh status</Button>} />;
  }
  const canRetry = current.status === "EXPIRED" || current.status === "FAILED" || current.status === "CANCELLED";
  return (
    <section className="space-y-4 rounded-xl border border-brand-border bg-card p-5">
      <h2 className="text-xl font-semibold text-brand-text" role="status">
        {resultTitle(current, returnedAfterCancel, reconciling)}
      </h2>
      <p className="text-sm text-brand-text-muted">{current.courseTitle} ? {current.orderNumber}</p>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="text-brand-text-muted">{current.paidAt ? "Paid amount" : "Order total"}</dt><dd>{commerceMoney(current.amountMinorUnits, current.currency)}</dd></div>
        <div><dt className="text-brand-text-muted">Paid date</dt><dd>{commerceDate(current.paidAt)}</dd></div>
        <div><dt className="text-brand-text-muted">Payment status</dt><dd>{statusLabel(current.paymentStatus)}</dd></div>
        <div><dt className="text-brand-text-muted">Enrollment</dt><dd>{statusLabel(current.enrollmentStatus)}</dd></div>
      </dl>
      {current.requiresReview && current.canAccess && <p className="text-sm text-brand-text-muted">This payment is flagged for review.</p>}
      {current.isTestMode && <p className="text-sm text-brand-text-muted">Stripe Sandbox transaction</p>}
      <div className="flex flex-wrap gap-2">
        {current.canAccess && <CommerceLink href={`/student/learning/${current.courseId}`} primary>Start learning</CommerceLink>}
        {(current.canResume || canRetry) && <CommerceLink href={`/checkout/${current.courseId}`} primary>
          {current.canResume ? "Continue checkout" : "Retry checkout"}
        </CommerceLink>}
        <Button type="button" variant="outline" busy={reconciling || status.isFetching}
          onClick={() => reconcile({ orderId, sessionId })}>Refresh status</Button>
        <CommerceLink href={`/courses/${current.courseSlug}`}>Return to course</CommerceLink>
        <CommerceLink href="/courses">Browse courses</CommerceLink>
        <CommerceLink href="/student/my-learning">My courses</CommerceLink>
        <CommerceLink href="/student/purchase-history">Purchase history</CommerceLink>
      </div>
    </section>
  );
}

function resultTitle(status: CheckoutStatus, returnedAfterCancel: boolean, checking: boolean) {
  if (status.requiresReview && !status.canAccess) return "Payment requires review";
  if (status.status === "REFUNDED") return "Payment refunded";
  if (paidStates.includes(status.status)) return status.canAccess ? "Payment confirmed ? Enrollment active" : "Payment confirmed ? Access unavailable";
  if (status.status === "PENDING") {
    if (checking) return "Verifying payment";
    if (returnedAfterCancel && status.canResume) return "Checkout is still open";
    return "Payment confirmation pending";
  }
  return `Checkout ${statusLabel(status.status).toLowerCase()}`;
}
