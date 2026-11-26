export type AdminDashboardPeriod = "weekly" | "monthly" | "yearly";

export type AdminMetricTrend = "positive" | "negative" | "neutral";

export type AdminDashboardMetricId =
  | "totalUsers"
  | "activeStudents"
  | "instructors"
  | "publishedCourses"
  | "totalEnrollments"
  | "totalRevenue";

export interface AdminDashboardMetric {
  value: number | null;
  percentageChange: number | null;
  trend: AdminMetricTrend | null;
  comparisonPeriod: string;
  description?: string;
}

export interface AdminDashboardStats {
  totalUsers: AdminDashboardMetric;
  activeStudents: AdminDashboardMetric;
  instructors: AdminDashboardMetric;
  publishedCourses: AdminDashboardMetric;
  totalEnrollments: AdminDashboardMetric;
  totalRevenue: AdminDashboardMetric;
}

export interface EnrollmentAnalyticsPoint {
  label: string;
  newEnrollments: number;
  completedEnrollments: number;
}

export interface RevenueAnalyticsPoint {
  label: string;
  revenue: number;
}

export interface PeriodAnalytics<T> {
  weekly: T[];
  monthly: T[];
  yearly: T[];
}

export interface RevenueAnalytics
  extends PeriodAnalytics<RevenueAnalyticsPoint> {
  growthPercent: Record<AdminDashboardPeriod, number | null>;
}

export type AdminUserRole = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export interface UserDistributionItem {
  role: AdminUserRole;
  count: number;
}

export interface CoursePerformanceItem {
  courseId: string;
  courseName: string;
  enrollmentCount: number;
  completionRate?: number | null;
  averageRating?: number | null;
}

export type EnrollmentStatus = "active" | "completed" | "cancelled";

export interface RecentEnrollment {
  id: string;
  studentName: string;
  studentAvatarUrl?: string | null;
  courseName: string;
  enrolledAt: string;
  status: EnrollmentStatus;
}

export type AdminActivityType =
  | "user_registered"
  | "course_published"
  | "student_enrolled"
  | "instructor_application"
  | "payment_received"
  | "course_approved";

export interface AdminActivity {
  id: string;
  type: AdminActivityType;
  title: string;
  description?: string | null;
  createdAt?: string | null;
  status?: string | null;
}

export type PendingApprovalType =
  | "instructor_application"
  | "course_publication"
  | "flagged_review"
  | "other";

export interface PendingApproval {
  id: string;
  type: PendingApprovalType;
  title: string;
  description: string;
  pendingCount: number;
  href?: string | null;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  enrollmentAnalytics: PeriodAnalytics<EnrollmentAnalyticsPoint>;
  revenueAnalytics: RevenueAnalytics;
  userDistribution: UserDistributionItem[];
  coursePerformance: CoursePerformanceItem[];
  recentEnrollments: RecentEnrollment[];
  recentActivity: AdminActivity[];
  pendingApprovals: PendingApproval[];
  currency: {
    code: string;
    locale: string;
  };
}
