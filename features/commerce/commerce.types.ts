import type { PaginationMeta } from "@/features/admin/types/management.types";

export const enrollmentStatuses = ["ACTIVE", "COMPLETED", "CANCELLED", "REVOKED"] as const;
export const enrollmentSources = ["FREE", "PAID", "ADMIN"] as const;
export const orderStatuses = ["PENDING", "PAID", "FAILED", "CANCELLED", "EXPIRED", "PARTIALLY_REFUNDED", "REFUNDED"] as const;
export const paymentStatuses = ["PENDING", "PROCESSING", "SUCCEEDED", "FAILED", "CANCELLED", "EXPIRED", "PARTIALLY_REFUNDED", "REFUNDED"] as const;
export const webhookStatuses = ["PENDING", "PROCESSING", "PROCESSED", "FAILED", "IGNORED"] as const;

export type EnrollmentStatus = typeof enrollmentStatuses[number];
export type OrderStatus = typeof orderStatuses[number];
export type PaymentStatus = typeof paymentStatuses[number];
type Person = { name: string; email?: string };

export interface CommerceFilter {
  search?: string;
  status?: string;
  source?: string;
  categoryId?: string;
  from?: string;
  to?: string;
  oldestFirst?: boolean;
}

export interface CommercePage<T> { items: T[]; meta: PaginationMeta }
export interface Pagination { page: number; limit: number }

export interface Enrollment {
  id: string;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnailUrl: string | null;
    instructor: Person;
    category: Person;
    status: string;
    categoryId?: string | null;
    level?: string | null;
    sectionCount?: number | null;
    lessonCount?: number | null;
    durationSeconds?: number | null;
  };
  user?: Person | null;
  order: { id: string; orderNumber: string } | null;
  status: EnrollmentStatus;
  source: typeof enrollmentSources[number];
  enrolledAt: string;
  completedAt: string | null;
  revokedAt: string | null;
  revocationReason: string | null;
}

export interface Quote {
  currency: string;
  subtotalMinorUnits: number;
  discountMinorUnits: number;
  totalMinorUnits: number;
  pendingOrderId: string | null;
  paymentsEnabled: boolean;
}

export interface CourseEnrollmentStatus {
  enrollmentStatus: EnrollmentStatus | null;
  canAccess: boolean;
  available: boolean;
  pendingOrderId: string | null;
  paymentsEnabled: boolean;
}

export interface CheckoutStatus {
  orderId: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus | null;
  enrollmentStatus: EnrollmentStatus | null;
  currency: string;
  amountMinorUnits: number;
  paidAt: string | null;
  canAccess: boolean;
  canResume: boolean;
  requiresReview: boolean;
  isTestMode: boolean;
}

interface MoneyEvent {
  id: string;
  amountMinorUnits: number;
  currency: string;
  status: string;
  reason: string | null;
  createdAt: string;
}

interface OrderRef {
  id: string;
  courseId: string;
  orderNumber: string;
  courseTitleSnapshot: string;
  status: OrderStatus;
  user?: Person | null;
  isTestMode: boolean;
  createdAt: string;
  enrollment: { id: string; status: EnrollmentStatus; source: string } | null;
}

export interface Payment {
  id: string;
  orderId: string;
  provider: "STRIPE";
  status: PaymentStatus;
  currency: string;
  amountMinorUnits: number;
  refundedMinorUnits: number;
  receiptUrl?: string | null;
  isTestMode: boolean;
  paidAt: string | null;
  expiresAt: string;
  createdAt: string;
  failureCode: string | null;
  failureMessage: string | null;
  reconciliationReason?: string | null;
  stripeCheckoutSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  stripeChargeId?: string | null;
  order?: OrderRef;
  refunds?: MoneyEvent[] | null;
  disputes?: MoneyEvent[] | null;
}

export interface Order extends OrderRef {
  course: {
    slug: string;
    thumbnailUrl?: string | null;
    publiclyAvailable?: boolean | null;
    learningAvailable?: boolean | null;
  };
  canResume?: boolean | null;
  paymentStatus?: PaymentStatus | null;
  currency: string;
  subtotalMinorUnits: number;
  discountMinorUnits: number;
  totalMinorUnits: number;
  paidAt: string | null;
  expiresAt: string;
  cancelledAt: string | null;
  reconciliationReason: string | null;
  payments: Payment[];
}

export interface WebhookRecord {
  id: string;
  stripeEventId: string;
  eventType: string;
  stripeObjectId: string | null;
  status: typeof webhookStatuses[number];
  attempts: number;
  lastError: string | null;
  isTestMode: boolean;
  receivedAt: string;
  processedAt: string | null;
}

export interface LearningLesson {
  id: string;
  title: string;
  description: string;
  type: "VIDEO" | "TEXT" | "PDF";
  content: string;
  videoUrl: string | null;
  documentUrl: string | null;
  durationSeconds?: number | null;
  hasManagedMedia?: boolean;
  resources: { id: string; title: string; type: string; url: string; hasManagedMedia?: boolean; fileName?: string | null; mimeType?: string | null }[];
}

export interface LearningContent {
  id: string;
  title: string;
  sections: { id: string; title: string; lessons: LearningLesson[] }[];
}

export interface LessonComment {
  id: string;
  body: string;
  createdAt: string;
  author: { name: string };
}

export interface EnrollmentStats { total: number; active: number; completed: number; revoked: number; free: number; paid: number }
export interface OrderStats { isTestMode: boolean; total: number; paid: number; pending: number }
export interface StudentCommerceStats {
  enrollments: EnrollmentStats;
  categories: { id: string; name: string }[];
  orders: (OrderStats & { currency: string; totalPaidMinorUnits: string })[];
  payments: PaymentStats;
}

export interface PaymentStats {
  counts: { isTestMode: boolean; successful: number; pending: number; failed: number }[];
  totals: { isTestMode: boolean; currency: string; grossMinorUnits: string; refundedMinorUnits: string; netMinorUnits: string }[];
}
