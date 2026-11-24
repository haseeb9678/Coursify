import { FooterColumn, SocialLink } from "../types/footer.types";

export const footerColumns: FooterColumn[] = [
    {
        id: "company",
        title: "Company",
        links: [
            { id: "about", label: "About Us", href: "/about" },
            { id: "careers", label: "Careers", href: "/careers" },
            { id: "press", label: "Press & Media", href: "/press" },
            { id: "partners", label: "Partners", href: "/partners" },
            { id: "affiliates", label: "Affiliates", href: "/affiliates" },
        ],
    },
    {
        id: "support",
        title: "Support",
        links: [
            { id: "help", label: "Help Center", href: "/help" },
            { id: "contact", label: "Contact Us", href: "/contact" },
            { id: "status", label: "System Status", href: "/status" },
            { id: "privacy", label: "Privacy Policy", href: "/privacy-policy" },
            { id: "terms", label: "Terms of Service", href: "/terms" },
        ],
    },
    {
        id: "categories",
        title: "Categories",
        links: [
            { id: "design", label: "UI/UX Design", href: "/courses?category=design" },
            { id: "development", label: "Web Development", href: "/courses?category=web-development" },
            { id: "data-science", label: "Data Science", href: "/courses?category=data-science" },
            { id: "marketing", label: "Digital Marketing", href: "/courses?category=digital-marketing" },
            { id: "business", label: "Business", href: "/courses?category=business" },
        ],
    },
    {
        id: "resources",
        title: "Resources",
        links: [
            { id: "blog", label: "Blog & Articles", href: "/blog" },
            { id: "ebooks", label: "Free E-Books", href: "/resources/ebooks" },
            { id: "stories", label: "Student Stories", href: "/stories" },
            { id: "verify", label: "Verify Certificate", href: "/verify-certificate" },
            { id: "mobile", label: "Mobile App", href: "/mobile-app" },
        ],
    },
];

// Add your actual social profile URLs here when available.
export const socialLinks: SocialLink[] = [
    // Example:
    // { id: "facebook", label: "Facebook", href: "https://..." },
    // { id: "twitter", label: "Twitter", href: "https://..." },
    // { id: "linkedin", label: "LinkedIn", href: "https://..." },
];
