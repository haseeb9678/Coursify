
export interface CareerTrack {
    id: string;
    name: string;
    slug: string;
}

export interface CareerCourse {
    id: string;
    slug: string;
    title: string;
    category: string;
    categorySlug: string;
    thumbnail: string;
    lessonCount: number;
    duration: string;
    rating: number;
    reviewCount: number;
    price: number;
    originalPrice?: number;
    currency: string;
}
