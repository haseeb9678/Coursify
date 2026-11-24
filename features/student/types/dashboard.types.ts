import type { z } from "zod";

import {
    studentDashboardSchema,
    dashboardStatsSchema,
    learningActivitySchema,
    learningCourseSchema,
    recentActivitySchema,
} from "@/validation/student/dashboard.schema";

export type StudentDashboardData = z.infer<
    typeof studentDashboardSchema
>;

export type DashboardStatsData = z.infer<
    typeof dashboardStatsSchema
>;

export type LearningActivity = z.infer<
    typeof learningActivitySchema
>;

export type LearningCourse = z.infer<
    typeof learningCourseSchema
>;

export type RecentActivityItem = z.infer<
    typeof recentActivitySchema
>;

export type DashboardPeriod = "weekly" | "monthly";

export type DashboardDataSource =
    | "api"
    | "demo"
    | "fallback";

export interface DashboardResponse {
    data: StudentDashboardData;
    source: DashboardDataSource;
}