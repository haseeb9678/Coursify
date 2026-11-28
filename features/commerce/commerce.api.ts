import { graphqlClient } from "@/lib/graphql/client";
import type {
  CheckoutStatus, CommerceFilter, CommercePage, CourseEnrollmentStatus, Enrollment, EnrollmentStats,
  LearningContent, LessonComment, Order, OrderStats, Pagination, Payment, PaymentStats, Quote, StudentCommerceStats, WebhookRecord,
} from "./commerce.types";

const meta = "meta { page limit total totalPages hasNext hasPrevious }";
const student = "user { name email }";
const enrollmentFields = `id status source enrolledAt completedAt revokedAt revocationReason
  course { id title slug status thumbnailUrl instructor { name } category { name } }
  order { id orderNumber }`;
const studentEnrollmentFields = `id status source enrolledAt completedAt revokedAt revocationReason
  course { id title slug status thumbnailUrl instructor { name } category { name }
    categoryId level sectionCount lessonCount durationSeconds }
  order { id orderNumber }`;
const orderRef = "id courseId orderNumber courseTitleSnapshot status isTestMode createdAt enrollment { id status source }";
const paymentFields = "id orderId provider status currency amountMinorUnits refundedMinorUnits isTestMode paidAt expiresAt createdAt failureCode failureMessage";
const providerRefs = "stripeCheckoutSessionId stripePaymentIntentId stripeChargeId reconciliationReason";
const refundFields = "refunds { id amountMinorUnits currency status reason createdAt }";
const disputeFields = "disputes { id amountMinorUnits currency status reason createdAt }";
const orderFields = `${orderRef} currency subtotalMinorUnits discountMinorUnits totalMinorUnits paidAt expiresAt cancelledAt reconciliationReason course { slug }`;
const studentOrderFields = `${orderRef} currency subtotalMinorUnits discountMinorUnits totalMinorUnits paidAt expiresAt cancelledAt
  canResume paymentStatus course { slug thumbnailUrl publiclyAvailable learningAvailable }`;
const checkoutFields = "orderId courseId courseSlug courseTitle orderNumber status paymentStatus enrollmentStatus currency amountMinorUnits paidAt canAccess canResume requiresReview isTestMode";
const lessonCommentFields = "id body createdAt author { name }";

type Var = Record<string, unknown>;
async function request<K extends string, T>(operation: K, document: string, variables?: Var): Promise<T> {
  const data = await graphqlClient.request<Record<K, T>>(document, variables);
  return data[operation];
}

function pageRequest<T>(operation: string, filterType: string, fields: string, pagination: Pagination, filter: CommerceFilter) {
  return request<string, CommercePage<T>>(operation,
    `query ($pagination: PaginationInput!, $filter: ${filterType}) {
      ${operation}(pagination: $pagination, filter: $filter) { items { ${fields} } ${meta} }
    }`, { pagination, filter });
}

function detailRequest<T>(operation: string, fields: string, id: string) {
  return request<string, T>(operation, `query ($id: ID!) { ${operation}(id: $id) { ${fields} } }`, { id });
}

export const commerceApi = {
  enrollmentStatus: (courseId: string) => request<"courseEnrollmentStatus", CourseEnrollmentStatus>(
    "courseEnrollmentStatus", `query ($courseId: ID!) { courseEnrollmentStatus(courseId: $courseId) {
      enrollmentStatus canAccess available pendingOrderId paymentsEnabled } }`, { courseId }),
  enrollFree: (courseId: string) => request<"enrollInFreeCourse", Enrollment>(
    "enrollInFreeCourse", `mutation ($courseId: ID!) { enrollInFreeCourse(courseId: $courseId) { ${enrollmentFields} } }`, { courseId }),
  quote: (courseId: string) => request<"checkoutQuote", Quote>(
    "checkoutQuote", `query ($courseId: ID!) { checkoutQuote(courseId: $courseId) {
      currency subtotalMinorUnits discountMinorUnits totalMinorUnits pendingOrderId paymentsEnabled } }`, { courseId }),
  createCheckout: (input: { courseId: string; currency: string; amountMinorUnits: number }) =>
    request<"createCheckoutSession", { orderId: string; orderNumber: string; checkoutUrl: string | null }>(
      "createCheckoutSession", `mutation ($input: CheckoutStartInput!) {
        createCheckoutSession(input: $input) { orderId orderNumber checkoutUrl } }`, { input }),
  status: (orderId: string) => request<"checkoutStatus", CheckoutStatus>(
    "checkoutStatus", `query ($orderId: ID!) { checkoutStatus(orderId: $orderId) { ${checkoutFields} } }`, { orderId }),
  reconcile: (input: { orderId: string; sessionId?: string }) => request<"reconcileCheckout", CheckoutStatus>(
    "reconcileCheckout", `mutation ($input: CheckoutReconcileInput!) { reconcileCheckout(input: $input) { ${checkoutFields} } }`, { input }),
  learning: (courseId: string) => request<"myCourseLearningContent", LearningContent>(
    "myCourseLearningContent", `query ($courseId: ID!) { myCourseLearningContent(courseId: $courseId) {
      id title sections { id title lessons { id title description type content videoUrl documentUrl durationSeconds hasManagedMedia resources { id title type url hasManagedMedia fileName mimeType } } }
    } }`, { courseId }),
  lessonComments: (courseId: string, lessonId: string, pagination: Pagination) =>
    request<"lessonComments", CommercePage<LessonComment>>("lessonComments", `query ($courseId: ID!, $lessonId: ID!, $pagination: PaginationInput!) {
      lessonComments(courseId: $courseId, lessonId: $lessonId, pagination: $pagination) { items { ${lessonCommentFields} } ${meta} }
    }`, { courseId, lessonId, pagination }),
  postLessonComment: (courseId: string, lessonId: string, body: string) =>
    request<"postLessonComment", LessonComment>("postLessonComment", `mutation ($courseId: ID!, $lessonId: ID!, $body: String!) {
      postLessonComment(courseId: $courseId, lessonId: $lessonId, body: $body) { ${lessonCommentFields} }
    }`, { courseId, lessonId, body }),
  enrollments: (admin: boolean, pagination: Pagination, filter: CommerceFilter) =>
    pageRequest<Enrollment>(admin ? "adminEnrollments" : "myEnrollments", "CommerceEnrollmentFilter",
      admin ? `${enrollmentFields} ${student}` : studentEnrollmentFields, pagination, filter),
  enrollment: (admin: boolean, id: string) =>
    detailRequest<Enrollment>(admin ? "adminEnrollment" : "myEnrollment", admin ? `${enrollmentFields} ${student}` : studentEnrollmentFields, id),
  orders: (admin: boolean, pagination: Pagination, filter: CommerceFilter) =>
    pageRequest<Order>(admin ? "adminOrders" : "myOrders", "CommerceOrderFilter",
      `${admin ? `${orderFields} ${student}` : studentOrderFields} payments { ${paymentFields} }`, pagination, filter),
  order: (admin: boolean, id: string) => detailRequest<Order>(admin ? "adminOrder" : "myOrder",
    `${admin ? `${orderFields} ${student}` : studentOrderFields} payments { ${paymentFields} receiptUrl ${refundFields} ${admin ? disputeFields : ""} }`, id),
  payments: (admin: boolean, pagination: Pagination, filter: CommerceFilter) =>
    pageRequest<Payment>(admin ? "adminPayments" : "myPayments", "CommercePaymentFilter",
      `${paymentFields} ${admin ? providerRefs : ""} order { ${orderRef} ${admin ? student : ""} }`, pagination, filter),
  payment: (admin: boolean, id: string) => detailRequest<Payment>(admin ? "adminPayment" : "myPayment",
    `${paymentFields} receiptUrl ${refundFields} ${admin ? providerRefs + " " + disputeFields : ""} order { ${orderRef} ${admin ? student : ""} }`, id),
  webhooks: (pagination: Pagination, filter: CommerceFilter) =>
    pageRequest<WebhookRecord>("adminCommerceWebhooks", "CommerceWebhookFilter",
      "id stripeEventId eventType stripeObjectId status attempts lastError isTestMode receivedAt processedAt", pagination, filter),
  studentStats: () => request<"myCommerceStats", StudentCommerceStats>(
    "myCommerceStats", `query { myCommerceStats {
      enrollments { total active completed revoked free paid }
      categories { id name }
      orders { isTestMode currency total paid pending totalPaidMinorUnits }
      payments {
        counts { isTestMode successful pending failed }
        totals { isTestMode currency grossMinorUnits refundedMinorUnits netMinorUnits }
      }
    } }`),
  enrollmentStats: () => request<"adminEnrollmentStats", EnrollmentStats>("adminEnrollmentStats",
    "query { adminEnrollmentStats { total active completed revoked free paid } }"),
  orderStats: () => request<"adminOrderStats", OrderStats[]>("adminOrderStats",
    "query { adminOrderStats { isTestMode total paid pending } }"),
  paymentStats: () => request<"adminPaymentStats", PaymentStats>("adminPaymentStats",
    "query { adminPaymentStats { counts { isTestMode successful pending failed } totals { isTestMode currency grossMinorUnits refundedMinorUnits netMinorUnits } } }"),
};
