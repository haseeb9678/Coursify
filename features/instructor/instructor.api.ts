import type { PaginationMeta } from "@/features/admin/types/management.types";
import type { CourseStatus } from "@/features/admin/types/learning.types";
import type { AdminMedia, MediaPage, MediaRead } from "@/features/storage/storage.api";
import { graphqlClient } from "@/lib/graphql/client";

export type Pagination = { page: number; limit: number };
export type Page<T> = { items: T[]; meta: PaginationMeta };
export type ReportFilter = { courseId?: string; studentId?: string; search?: string; status?: string; decision?: string; from?: string; to?: string; oldestFirst?: boolean };
export type Enrollment = {
  id: string; studentId: string; studentName: string; avatar: string | null; courseId: string; courseTitle: string;
  lessonCount: number; status: string; enrolledAt: string; completedAt: string | null;
};
export type Review = { id: string; courseId: string; courseTitle: string; decision: string; feedback: string; createdAt: string };
export type Performance = { id: string; title: string; status: CourseStatus; thumbnailUrl: string | null; publishedAt: string | null;
  enrollments: number; completed: number; completionRate: number | null };
export type Analytics = {
  courseStatuses: { label: CourseStatus; count: number }[]; totalCourses: number; enrollments: number;
  students: number; completed: number; activeStudents: number; discussionParticipants: number;
  completionRate: number | null; trend: { period: string; enrollments: number; newStudents: number }[]; courses: Performance[];
};
export type Money = { currency: string; isTestMode: boolean; gross: string; refunded: string; disputed: string; net: string };
export type Sale = Money & { id: string; courseTitle: string; orderNumber: string; paidAt: string };
export type Sales = Page<Sale> & { totals: (Money & { orders: number })[]; trend: (Money & { period: string; orders: number })[] };

const meta = "meta { page limit total totalPages hasNext hasPrevious }";
const enrollment = "id studentId studentName avatar courseId courseTitle lessonCount status enrolledAt completedAt";
const money = "currency isTestMode gross refunded disputed net";

async function request<T>(field: string, document: string, variables?: Record<string, unknown>) {
  return (await graphqlClient.request<Record<string, T>>(document, variables))[field];
}

export const instructorApi = {
  readiness: (id: string) => request<string[]>("instructorCourseReadiness",
    "query($id:ID!){ instructorCourseReadiness(id:$id) }", { id }),
  analytics: (days: number, courseId?: string) => request<Analytics>("instructorAnalytics", `
    query($days:Int!, $courseId:ID) { instructorAnalytics(days:$days, courseId:$courseId) {
      totalCourses enrollments students completed activeStudents discussionParticipants completionRate
      courseStatuses { label count } trend { period enrollments newStudents }
      courses { id title status thumbnailUrl publishedAt enrollments completed completionRate }
    } }`, { days, courseId }),
  enrollments: (pagination: Pagination, filter: ReportFilter) => request<Page<Enrollment>>("instructorEnrollments",
    `query($pagination:PaginationInput!, $filter:InstructorReportFilter) {
      instructorEnrollments(pagination:$pagination, filter:$filter) { items { ${enrollment} } ${meta} }
    }`, { pagination, filter }),
  student: (pagination: Pagination, studentId: string) => request<Page<Enrollment>>("instructorStudent",
    `query($pagination:PaginationInput!, $studentId:ID!) {
      instructorStudent(pagination:$pagination, studentId:$studentId) { items { ${enrollment} } ${meta} }
    }`, { pagination, studentId }),
  reviews: (pagination: Pagination, filter: ReportFilter) => request<Page<Review>>("instructorReviews",
    `query($pagination:PaginationInput!, $filter:InstructorReportFilter) {
      instructorReviews(pagination:$pagination, filter:$filter) { items { id courseId courseTitle decision feedback createdAt } ${meta} }
    }`, { pagination, filter }),
  sales: (pagination: Pagination, days: number, courseId?: string) => request<Sales>("instructorSales",
    `query($pagination:PaginationInput!, $days:Int!, $courseId:ID) {
      instructorSales(pagination:$pagination, days:$days, courseId:$courseId) {
        items { id courseTitle orderNumber paidAt ${money} }
        totals { orders ${money} } trend { period orders ${money} } ${meta}
      }
    }`, { pagination, days, courseId }),
  media: (pagination: Pagination, search?: string, purpose?: string) => request<Omit<MediaPage, "items"> & { items: (AdminMedia & { inUse: boolean })[] }>("instructorMedia",
    `query($pagination:PaginationInput!, $filter:AdminMediaFilter) {
      instructorMedia(pagination:$pagination, filter:$filter) {
        items { id originalFileName mimeType sizeBytes status purpose createdAt publicUrl inUse } ${meta}
      }
    }`, { pagination, filter: { search, purpose } }),
  readMedia: (id: string) => request<MediaRead>("instructorMediaRead",
    "query($id:ID!){ instructorMediaRead(id:$id){ url expiresAt } }", { id }),
  deleteMedia: (id: string) => request<boolean>("instructorDeleteMedia",
    "mutation($id:ID!){ instructorDeleteMedia(id:$id) }", { id }),
};
