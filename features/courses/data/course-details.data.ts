
export interface CourseLesson {
    title: string;
    duration: string;
    preview?: boolean;
}

export interface CourseModule {
    title: string;
    duration: string;
    lessons: CourseLesson[];
}

export interface CourseReview {
    name: string;
    role: string;
    rating: number;
    comment: string;
}

export interface CourseDetails {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    category: string;
    level: string;
    thumbnail: string;
    previewImage: string;
    instructor: {
        name: string;
        role: string;
        image: string;
        bio: string;
        rating: number;
        students: string;
        courses: number;
    };
    rating: number;
    reviewCount: number;
    students: string;
    price: number;
    originalPrice: number;
    updatedAt: string;
    bestseller: boolean;
    duration: string;
    lessonsCount: number;
    resources: number;
    certificate: boolean;
    learningOutcomes: string[];
    modules: CourseModule[];
    reviews: CourseReview[];
}

export const sampleCourse: CourseDetails = {
    id: "figma-design-systems",

    title:
        "Complete Figma & Design Systems Bootcamp: Zero to Senior Product Designer",

    subtitle:
        "Master Figma, build scalable design systems, and create professional product experiences with industry-standard workflows.",

    description:
        "Modern product teams don't just design static screens — they build scalable design systems and reusable component libraries. In this hands-on course, you'll learn everything from Figma fundamentals to advanced variables, responsive layouts, interactive prototypes, and professional developer handoff workflows.",

    category: "UI/UX Design",

    level: "Intermediate",

    thumbnail:
        "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=1200&q=85",

    previewImage:
        "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=85",

    instructor: {
        name: "Sarah Jenkins",
        role: "Staff Product Designer & Design Systems Architect",
        image:
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=85",
        bio:
            "Sarah has spent over 10 years leading design systems teams at high-growth SaaS companies. She specializes in scalable UI architecture, design tokens, and helping designers build industry-ready portfolios.",
        rating: 4.9,
        students: "68,400+",
        courses: 12,
    },

    rating: 4.9,
    reviewCount: 1420,
    students: "14,820",

    price: 49.99,
    originalPrice: 129,

    updatedAt: "November 2026",
    bestseller: true,

    duration: "18.5 hours",
    lessonsCount: 36,
    resources: 24,
    certificate: true,

    learningOutcomes: [
        "Build scalable multi-brand design systems using Figma Variables.",
        "Master nested Auto Layout constraints for responsive interfaces.",
        "Create interactive prototypes and reusable component variants.",
        "Understand design tokens and professional developer handoff.",
        "Design complete SaaS web applications and mobile experiences.",
        "Build portfolio-ready case studies for product design roles.",
    ],

    modules: [
        {
            title: "Figma Workspace & Modern UI Foundations",
            duration: "2h 15m",
            lessons: [
                {
                    title: "Welcome & Course Project Walkthrough",
                    duration: "12:40",
                    preview: true,
                },
                {
                    title: "Responsive Grids & Spacing Scales",
                    duration: "28:15",
                    preview: true,
                },
                {
                    title: "Typography & Fluid Type Hierarchy",
                    duration: "34:10",
                },
                {
                    title: "Understanding Frames and Layers",
                    duration: "25:30",
                },
                {
                    title: "Building Your First Interface",
                    duration: "34:25",
                },
            ],
        },
        {
            title: "Mastering Auto Layout & Constraints",
            duration: "3h 45m",
            lessons: [
                {
                    title: "Hug, Fill & Fixed Sizing Deep Dive",
                    duration: "31:00",
                },
                {
                    title: "Nested Auto Layout Structures",
                    duration: "42:15",
                },
                {
                    title: "Responsive Components",
                    duration: "35:20",
                },
                {
                    title: "Advanced Constraints",
                    duration: "29:45",
                },
            ],
        },
        {
            title: "Components, Variants & Figma Variables",
            duration: "4h 20m",
            lessons: [
                {
                    title: "Creating Reusable Components",
                    duration: "32:10",
                },
                {
                    title: "Component Properties & Variants",
                    duration: "38:20",
                },
                {
                    title: "Multi-Mode Design Tokens",
                    duration: "42:15",
                },
                {
                    title: "Light and Dark Theme Architecture",
                    duration: "36:40",
                },
            ],
        },
        {
            title: "Interactive Prototyping & Micro-interactions",
            duration: "2h 50m",
            lessons: [
                {
                    title: "Prototype Connections & Navigation",
                    duration: "27:30",
                },
                {
                    title: "Smart Animate & Transitions",
                    duration: "35:20",
                },
                {
                    title: "Interactive Components",
                    duration: "41:10",
                },
            ],
        },
        {
            title: "Developer Handoff & Design Documentation",
            duration: "2h 40m",
            lessons: [
                {
                    title: "Figma Dev Mode",
                    duration: "32:00",
                },
                {
                    title: "Design Tokens & CSS Variables",
                    duration: "38:30",
                },
                {
                    title: "Documentation Best Practices",
                    duration: "29:15",
                },
            ],
        },
        {
            title: "Final Portfolio Project",
            duration: "2h 40m",
            lessons: [
                {
                    title: "Planning Your Design System",
                    duration: "30:00",
                },
                {
                    title: "Building the Final Product",
                    duration: "55:00",
                },
                {
                    title: "Presenting Your Case Study",
                    duration: "40:00",
                },
            ],
        },
    ],

    reviews: [
        {
            name: "Daniel K.",
            role: "Product Designer",
            rating: 5,
            comment:
                "The Figma Variables and design system modules are incredibly practical. The course is structured well and explains concepts with real-world examples.",
        },
        {
            name: "Priya M.",
            role: "UI Designer",
            rating: 5,
            comment:
                "Super structured, easy to follow, and full of useful assignments. I used the final project to improve my portfolio.",
        },
        {
            name: "Alex R.",
            role: "Frontend Developer",
            rating: 5,
            comment:
                "I finally understand how designers structure reusable components and hand off their work to developers. Highly recommended.",
        },
        {
            name: "Maria S.",
            role: "Junior Designer",
            rating: 4,
            comment:
                "Great explanations and a very useful learning path. The practical projects made the concepts easier to understand.",
        },
    ],
};

/**
 * Temporary data resolver.
 * Replace this function with an API request when the backend is ready.
 */
export async function getCourseById(
    id: string,
): Promise<CourseDetails | null> {
    if (!id) return null;

    // Later:
    // const response = await fetch(`${API_URL}/courses/${id}`);
    // if (!response.ok) return null;
    // return response.json();

    // Temporary fallback for any course URL.
    return {
        ...sampleCourse,
        id,
    };
}
