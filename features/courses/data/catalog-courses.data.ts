
export interface CatalogCourse {
    id: string;
    title: string;
    instructor: string;
    category: string;
    image: string;
    lessons: number;
    duration: number;
    rating: number;
    reviews: number;
    price: number;
    originalPrice: number;
    level: "Beginner" | "Intermediate" | "Advanced";
    popularity: number;
    createdAt: string;
    certificate: boolean;
}

export const catalogCourses: CatalogCourse[] = [
    {
        id: "1",
        title: "Complete Figma & Design Systems Masterclass 2026",
        instructor: "Sarah Jenkins",
        category: "UI/UX Design",
        image:
            "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=800&q=85",
        lessons: 48,
        duration: 22.5,
        rating: 4.9,
        reviews: 1420,
        price: 49.99,
        originalPrice: 129,
        level: "Intermediate",
        popularity: 98,
        createdAt: "2026-10-10",
        certificate: true,
    },
    {
        id: "2",
        title: "Full-Stack React, Next.js & TypeScript Bootcamp",
        instructor: "David Miller",
        category: "Web Development",
        image:
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=85",
        lessons: 64,
        duration: 31,
        rating: 4.9,
        reviews: 2180,
        price: 59.99,
        originalPrice: 149,
        level: "Advanced",
        popularity: 100,
        createdAt: "2026-09-15",
        certificate: true,
    },
    {
        id: "3",
        title: "Applied Machine Learning & Python Data Science",
        instructor: "Dr. Aris Thorne",
        category: "Data Science",
        image:
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=85",
        lessons: 52,
        duration: 26.5,
        rating: 4.8,
        reviews: 1890,
        price: 54.99,
        originalPrice: 139,
        level: "Intermediate",
        popularity: 94,
        createdAt: "2026-08-20",
        certificate: true,
    },
    {
        id: "4",
        title: "B2B SaaS Growth Marketing & Performance SEO",
        instructor: "Elena Rostova",
        category: "Digital Marketing",
        image:
            "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=85",
        lessons: 34,
        duration: 15,
        rating: 4.8,
        reviews: 920,
        price: 39.99,
        originalPrice: 99,
        level: "Beginner",
        popularity: 87,
        createdAt: "2026-07-12",
        certificate: true,
    },
    {
        id: "5",
        title: "Product Management & Agile Roadmapping",
        instructor: "Marcus Vance",
        category: "Business",
        image:
            "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=85",
        lessons: 40,
        duration: 19.5,
        rating: 4.9,
        reviews: 1150,
        price: 44.99,
        originalPrice: 119,
        level: "Intermediate",
        popularity: 91,
        createdAt: "2026-06-18",
        certificate: true,
    },
    {
        id: "6",
        title: "User Research, Usability Testing & Wireframing",
        instructor: "Claire Sterling",
        category: "UI/UX Design",
        image:
            "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=85",
        lessons: 28,
        duration: 14,
        rating: 4.7,
        reviews: 675,
        price: 34.99,
        originalPrice: 89,
        level: "Beginner",
        popularity: 82,
        createdAt: "2026-05-10",
        certificate: true,
    },
    {
        id: "7",
        title: "Scalable Cloud APIs with Node.js, Docker & AWS",
        instructor: "Liam O'Connor",
        category: "Web Development",
        image:
            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=85",
        lessons: 45,
        duration: 21,
        rating: 4.9,
        reviews: 1310,
        price: 54.99,
        originalPrice: 139,
        level: "Advanced",
        popularity: 96,
        createdAt: "2026-04-25",
        certificate: true,
    },
    {
        id: "8",
        title: "SQL, Tableau & Executive Business Intelligence",
        instructor: "Priya Nair",
        category: "Data Science",
        image:
            "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=85",
        lessons: 30,
        duration: 16,
        rating: 4.8,
        reviews: 940,
        price: 42.99,
        originalPrice: 109,
        level: "Intermediate",
        popularity: 89,
        createdAt: "2026-03-15",
        certificate: true,
    },
    {
        id: "9",
        title: "Engineering & Design Leadership Foundations",
        instructor: "Jonathan Brooks",
        category: "Business",
        image:
            "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=85",
        lessons: 22,
        duration: 11.5,
        rating: 4.9,
        reviews: 780,
        price: 39.99,
        originalPrice: 99,
        level: "Beginner",
        popularity: 85,
        createdAt: "2026-02-10",
        certificate: true,
    },
];

export const courseCategories = [
    { label: "UI/UX Design", count: 420 },
    { label: "Web Development", count: 680 },
    { label: "Data Science", count: 290 },
    { label: "Digital Marketing", count: 310 },
    { label: "Business", count: 540 },
];
