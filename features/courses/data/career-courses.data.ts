
import type {
    CareerCourse,
    CareerTrack,
} from "@/features/courses/types/career-course.types";

export const careerTracks: CareerTrack[] = [
    { id: "1", name: "UI/UX Design", slug: "ui-ux-design" },
    { id: "2", name: "Web Development", slug: "web-development" },
    { id: "3", name: "Data Science", slug: "data-science" },
    { id: "4", name: "Digital Marketing", slug: "digital-marketing" },
    { id: "5", name: "Business", slug: "business" },
    { id: "6", name: "Mobile Development", slug: "mobile-development" },

];

export const careerCourses: CareerCourse[] = [
    {
        id: "1",
        slug: "complete-figma-design-systems",
        title: "Complete Figma & Design Systems Bootcamp",
        category: "UI/UX Design",
        categorySlug: "ui-ux-design",
        thumbnail:
            "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&q=80",
        lessonCount: 36,
        duration: "18h 30m",
        rating: 4.9,
        reviewCount: 1420,
        price: 49.99,
        originalPrice: 129,
        currency: "USD",
    },
    {
        id: "2",
        slug: "ux-research-prototyping",
        title: "User Experience Research & Prototyping",
        category: "UI/UX Design",
        categorySlug: "ui-ux-design",
        thumbnail:
            "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600&q=80",
        lessonCount: 28,
        duration: "14h 15m",
        rating: 4.8,
        reviewCount: 890,
        price: 39.99,
        originalPrice: 99,
        currency: "USD",
    },
    {
        id: "3",
        slug: "mobile-app-interface-design",
        title: "Mobile App Interface Design for iOS & Android",
        category: "UI/UX Design",
        categorySlug: "ui-ux-design",
        thumbnail:
            "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=600&q=80",
        lessonCount: 42,
        duration: "22h 00m",
        rating: 4.9,
        reviewCount: 1105,
        price: 54.99,
        originalPrice: 149,
        currency: "USD",
    },
    {
        id: "4",
        slug: "ux-case-study-portfolio",
        title: "UX Case Study & Portfolio Accelerator",
        category: "UI/UX Design",
        categorySlug: "ui-ux-design",
        thumbnail:
            "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80",
        lessonCount: 24,
        duration: "12h 45m",
        rating: 4.9,
        reviewCount: 640,
        price: 44.99,
        originalPrice: 110,
        currency: "USD",
    },
    {
        id: "5",
        slug: "full-stack-web-development",
        title: "Full-Stack Web Development Masterclass",
        category: "Web Development",
        categorySlug: "web-development",
        thumbnail:
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80",
        lessonCount: 65,
        duration: "35h 20m",
        rating: 4.9,
        reviewCount: 2100,
        price: 59.99,
        originalPrice: 149,
        currency: "USD",
    },
    {
        id: "6",
        slug: "python-data-science",
        title: "Python for Data Science and Analytics",
        category: "Data Science",
        categorySlug: "data-science",
        thumbnail:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
        lessonCount: 48,
        duration: "26h 10m",
        rating: 4.8,
        reviewCount: 970,
        price: 44.99,
        originalPrice: 119,
        currency: "USD",
    },
];
