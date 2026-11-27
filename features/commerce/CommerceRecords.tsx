"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, CreditCard, Eye, Globe, type LucideIcon } from "lucide-react";
import { AdminTableActionContent, AdminTableActionTrigger } from "@/components/layouts/admin/shared/AdminTableActionMenu";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { commerceDate, commerceMoney, paymentReference, safeMaterialUrl, statusLabel } from "./commerce-format";
import type { Enrollment, Order, Payment, WebhookRecord } from "./commerce.types";
import { CommerceLink, CommerceStatus } from "./CommerceUi";

export function RecordFields({ fields }: { fields: Array<[string, ReactNode]> }) {
  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      {fields.map(([label, value]) => (
        <div className="min-w-0" key={label}>
          <dt className="text-xs text-brand-text-muted">{label}</dt>
          <dd className="mt-0.5 break-all text-brand-text">{value ?? "?"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function EnrollmentRecord({ enrollment }: { enrollment: Enrollment }) {
  return <RecordFields fields={[
    ["Course", enrollment.course.title], ["Student", enrollment.user?.name], ["Email", enrollment.user?.email],
    ["Status", <CommerceStatus key="status" value={enrollment.status} />], ["Source", statusLabel(enrollment.source)],
    ["Enrolled", commerceDate(enrollment.enrolledAt)], ["Completed", commerceDate(enrollment.completedAt)],
    ["Order", enrollment.order?.orderNumber], ["Access revoked", commerceDate(enrollment.revokedAt)],
    ["Reason", statusLabel(enrollment.revocationReason)],
  ]} />;
}

export function OrderRecord({ order, student = false }: { order: Order; student?: boolean }) {
  const studentFields: Array<[string, ReactNode]> = [
    ["Payment status", <CommerceStatus key="payment-status" value={order.paymentStatus ?? order.payments[0]?.status} />],
    ["Payment provider", statusLabel(order.payments[0]?.provider)],
  ];
  return (
    <div className="space-y-4">
      {student && order.course.thumbnailUrl && (
        <Image src={order.course.thumbnailUrl} alt="" width={240} height={135} unoptimized
          className="aspect-video w-full max-w-60 rounded-lg object-cover" />
      )}
      <RecordFields fields={[
        ["Order number", order.orderNumber], ["Course", order.courseTitleSnapshot],
        ...(!student ? [["Student", order.user?.name], ["Email", order.user?.email]] as Array<[string, ReactNode]> : []),
        ["Status", <CommerceStatus key="status" value={order.status} />], ["Environment", order.isTestMode ? "Sandbox" : "Live"],
        ...(student ? studentFields : []),
        ["Subtotal", commerceMoney(order.subtotalMinorUnits, order.currency)], ["Discount", commerceMoney(order.discountMinorUnits, order.currency)],
        ["Total", commerceMoney(order.totalMinorUnits, order.currency)], ["Created", commerceDate(order.createdAt)],
        ["Paid", commerceDate(order.paidAt)], ["Checkout expires", commerceDate(order.expiresAt)],
        ["Enrollment", <CommerceStatus key="enrollment" value={order.enrollment?.status} />],
        ...(!student ? [["Reconciliation", statusLabel(order.reconciliationReason)]] as Array<[string, ReactNode]> : []),
      ]} />
      {student && <StudentOrderActions order={order} />}
      <div className="space-y-2">
        <h3 className="font-semibold text-brand-text">Payment attempts</h3>
        {order.payments.length ? order.payments.map((payment) => (
          <div className="rounded-lg border border-brand-border p-3" key={payment.id}>
            <PaymentRecord student={student} payment={payment} />
          </div>
        )) : <p className="text-sm text-brand-text-muted">No payment attempts yet.</p>}
      </div>
    </div>
  );
}

export function StudentOrderActions({ order, inTable = false }: { order: Order; inTable?: boolean }) {
  const enrollment = order.enrollment?.status;
  const actions: { href: string; label: string; icon: LucideIcon; primary?: boolean }[] = [];

  if (inTable) {
    actions.push({ href: `/student/purchase-history/${order.id}`, label: "View order details", icon: Eye });
  }
  if (order.status === "PENDING" && order.canResume) {
    actions.push({ href: `/checkout/cancel?order=${order.id}`, label: "Continue checkout", icon: CreditCard });
  }
  if (order.course.publiclyAvailable) {
    actions.push({ href: `/courses/${encodeURIComponent(order.course.slug)}`, label: "View course", icon: Globe });
  }
  if (order.course.learningAvailable && (enrollment === "ACTIVE" || enrollment === "COMPLETED")) {
    actions.push({
      href: `/student/learning/${order.courseId}`,
      label: enrollment === "COMPLETED" ? "Review course" : "Start learning",
      icon: BookOpen,
      primary: true,
    });
  }

  if (inTable) {
    return <DropdownMenu>
      <AdminTableActionTrigger label={`Actions for order ${order.orderNumber}`} />
      <AdminTableActionContent className="w-52">
        {actions.map(({ href, label, icon: Icon }) => (
          <DropdownMenuItem key={href} render={<Link href={href} />} nativeButton={false}>
            <Icon aria-hidden="true" />
            {label}
          </DropdownMenuItem>
        ))}
      </AdminTableActionContent>
    </DropdownMenu>;
  }

  return <div className="flex flex-wrap gap-2">
    {actions.map(({ href, label, primary }) => <CommerceLink key={href} href={href} primary={primary}>{label}</CommerceLink>)}
  </div>;
}

export function PaymentRecord({ payment, student = false }: { payment: Payment; student?: boolean }) {
  const receipt = safeMaterialUrl(payment.receiptUrl);
  return (
    <div className="space-y-4">
      <RecordFields fields={[
        [student ? "Transaction reference" : "Payment ID", student ? paymentReference(payment.id) : payment.id], ["Order number", payment.order?.orderNumber],
        ["Course", payment.order?.courseTitleSnapshot],
        ...(!student ? [["Student", payment.order?.user?.name]] as Array<[string, ReactNode]> : []),
        ["Provider", statusLabel(payment.provider)], ["Status", <CommerceStatus key="status" value={payment.status} />],
        ["Amount", commerceMoney(payment.amountMinorUnits, payment.currency)], ["Refunded", commerceMoney(payment.refundedMinorUnits, payment.currency)],
        ["Environment", payment.isTestMode ? "Sandbox" : "Live"], ["Paid", commerceDate(payment.paidAt)],
        ["Created", commerceDate(payment.createdAt)], ["Expires", commerceDate(payment.expiresAt)],
        ["Failure", payment.failureMessage],
        ...(!student ? [["Failure code", payment.failureCode]] as Array<[string, ReactNode]> : []),
        ...(!student && (payment.stripeCheckoutSessionId || payment.stripePaymentIntentId || payment.stripeChargeId || payment.reconciliationReason) ? [
          ["Checkout session", payment.stripeCheckoutSessionId], ["Payment intent", payment.stripePaymentIntentId],
          ["Charge", payment.stripeChargeId], ["Reconciliation", statusLabel(payment.reconciliationReason)],
        ] as Array<[string, ReactNode]> : []),
        ...(payment.order ? [["Enrollment", <CommerceStatus key="enrollment" value={payment.order.enrollment?.status} />]] as Array<[string, ReactNode]> : []),
      ]} />
      {student && payment.order && <CommerceLink href={`/student/purchase-history/${payment.order.id}`}>View order</CommerceLink>}
      {receipt?.startsWith("https://pay.stripe.com/receipts/payment/") && (
        <a href={receipt} target="_blank" rel="noreferrer" className="text-sm text-primary underline">View Stripe receipt</a>
      )}
      <MoneyEvents title="Refunds" events={payment.refunds} />
      <MoneyEvents title="Disputes" events={payment.disputes} />
    </div>
  );
}

function MoneyEvents({ title, events }: { title: string; events: Payment["refunds"] }) {
  if (!events?.length) return null;
  return <section className="space-y-1">
    <h4 className="text-sm font-medium text-brand-text">{title}</h4>
    <ul className="space-y-1">
      {events.map((event) => <li key={event.id} className="text-sm text-brand-text-muted">
        {commerceMoney(event.amountMinorUnits, event.currency)} ? {statusLabel(event.status)} ? {commerceDate(event.createdAt)}
        {event.reason && ` ? ${statusLabel(event.reason)}`}
      </li>)}
    </ul>
  </section>;
}

export function WebhookRecordDetails({ event }: { event: WebhookRecord }) {
  return <RecordFields fields={[
    ["Stripe event", event.stripeEventId], ["Event type", event.eventType], ["Stripe object", event.stripeObjectId],
    ["Status", <CommerceStatus key="status" value={event.status} />], ["Attempts", event.attempts], ["Environment", event.isTestMode ? "Sandbox" : "Live"],
    ["Received", commerceDate(event.receivedAt)], ["Processed", commerceDate(event.processedAt)], ["Last error", statusLabel(event.lastError)],
  ]} />;
}
