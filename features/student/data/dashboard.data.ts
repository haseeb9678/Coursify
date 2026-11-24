import type { StudentDashboardData } from "../types/dashboard.types";

export const sampleDashboardData = {
    student: {
        id: "demo-student",
        name: "Student",
    },

    stats: {
        enrolledCourses: 8,
        completedCourses: 4,
        inProgressCourses: 2,
        learningHours: 32.5,
        certificates: 3,
    },

    learningActivity: {
        weekly: [
            { label: "Mon", hours: 1 },
            { label: "Tue", hours: 2.5 },
            { label: "Wed", hours: 0.5 },
            { label: "Thu", hours: 3 },
            { label: "Fri", hours: 1.5 },
            { label: "Sat", hours: 2.5 },
            { label: "Sun", hours: 1.5 },
        ],

        monthly: [
            { label: "Week 1", hours: 4.5 },
            { label: "Week 2", hours: 6 },
            { label: "Week 3", hours: 9.5 },
            { label: "Week 4", hours: 12.5 },
        ],
    },

    weeklyGoal: {
        completedHours: 12.5,
        targetHours: 15,
        streakDays: 5,
    },

    continueLearning: [
        {
            id: "web-development",
            title: "Complete Web Development",
            category: "Development",
            instructor: "Alex Morgan",
            thumbnail: null,
            progress: 65,
            completedLessons: 26,
            totalLessons: 40,
            currentLesson: "React Hooks and State Management",
        },

        {
            id: "ui-ux-design",
            title: "UI/UX Design Fundamentals",
            category: "Design",
            instructor: "Sarah Johnson",
            thumbnail: null,
            progress: 40,
            completedLessons: 12,
            totalLessons: 30,
            currentLesson: "Understanding Design Systems",
        },
    ],

    recentActivity: [
        {
            id: "activity-1",
            type: "lesson_completed",
            title: "Lesson completed",
            description: "Introduction to React",
            createdAt: "2026-11-24T09:00:00Z",
        },
        {
            id: "activity-2",
            type: "certificate_earned",
            title: "Certificate earned",
            description: "JavaScript Essentials",
            createdAt: "2026-11-23T10:00:00Z",
        },
        {
            id: "activity-3",
            type: "course_started",
            title: "New course started",
            description: "UI/UX Design Fundamentals",
            createdAt: "2026-11-22T10:30:00Z",
        },
    ],
} satisfies StudentDashboardData;