import type { HeroSlide } from "../types/hero-slide.types";

export const heroSlides: HeroSlide[] = [
    {
        id: "learning-without-limits",

        src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1920&q=85",

        alt: "Students collaborating in a modern learning environment",

        eyebrow: "Learning without limits",

        title: "Your next big move starts here.",

        description:
            "Build in-demand skills, learn from industry experts, and unlock new opportunities at your own pace.",

        ctaLabel: "Explore courses",
        ctaHref: "/courses",

        imagePosition: "center",
    },

    {
        id: "career-growth",

        src: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1920&q=85",

        alt: "Professionals working together in a modern workspace",

        eyebrow: "Build your future",

        title: "Turn knowledge into opportunity.",

        description:
            "Master practical skills and take the next confident step toward your professional goals.",

        ctaLabel: "Start learning",
        ctaHref: "/courses",

        imagePosition: "center 40%",
    },

    {
        id: "expert-learning",

        src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1920&q=85",

        alt: "Professional learning using a laptop",

        eyebrow: "Learn from the best",

        title: "Invest in skills that matter.",

        description:
            "Discover expert-led courses designed to help you grow, innovate, and succeed in a changing world.",

        ctaLabel: "Discover courses",
        ctaHref: "/courses",

        secondaryCtaLabel: "Become an instructor",
        secondaryCtaHref: "/teach",

        imagePosition: "center",
    },
];