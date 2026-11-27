import { z } from "zod";

const countSchema = z.number().int().nonnegative();
const hoursSchema = z.number().finite().nonnegative();

export const dashboardStatsSchema = z.object({
    enrolledCourses: countSchema,
    completedCourses: countSchema,
    inProgressCourses: countSchema,
    learningHours: hoursSchema,
    certificates: countSchema,
});

export const learningActivitySchema = z.object({
    label: z.string(),
    hours: hoursSchema,
});

export const learningCourseSchema = z.object({
    id: z.string(),
    title: z.string(),
    category: z.string(),
    instructor: z.string(),
    thumbnail: z.string().nullable().optional(),

    progress: z.number().min(0).max(100),

    completedLessons: countSchema,
    totalLessons: countSchema,

    currentLesson: z.string(),
}).refine(
    (course) =>
        course.completedLessons <= course.totalLessons,
    {
        message: "Completed lessons cannot exceed total lessons",
    },
);

export const recentActivitySchema = z.object({
    id: z.string(),

    type: z.enum([
        "lesson_completed",
        "course_started",
        "course_enrolled",
        "certificate_earned",
        "course_completed",
    ]),

    title: z.string(),
    description: z.string(),
    createdAt: z.string().datetime({ offset: true }),
});

export const studentDashboardSchema = z.object({
    student: z.object({
        id: z.string(),
        name: z.string(),
    }),

    stats: dashboardStatsSchema,

    learningActivity: z.object({
        weekly: z.array(learningActivitySchema),
        monthly: z.array(learningActivitySchema),
    }),

    weeklyGoal: z.object({
        completedHours: hoursSchema,
        targetHours: hoursSchema,
        streakDays: countSchema,
    }),

    continueLearning: z.array(learningCourseSchema),

    recentActivity: z.array(recentActivitySchema),
}).refine(
    ({ stats }) =>
        stats.completedCourses + stats.inProgressCourses <=
        stats.enrolledCourses,
    {
        message: "Invalid course statistics",
    },
);