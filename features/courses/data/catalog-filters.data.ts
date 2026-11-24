
import { courseCategories } from "./catalog-courses.data";
import type { FilterGroupConfig } from "../types/catalog.types";

export const filterGroups: FilterGroupConfig[] = [
    {
        title: "Category",
        key: "categories",
        options: courseCategories.map((item) => ({
            label: item.label,
            count: item.count,
        })),
    },
    {
        title: "Skill Level",
        key: "levels",
        options: [
            { label: "Beginner" },
            { label: "Intermediate" },
            { label: "Advanced" },
        ],
    },
    {
        title: "Video Duration",
        key: "durations",
        options: [
            { label: "0–5 Hours" },
            { label: "5–15 Hours" },
            { label: "15+ Hours" },
        ],
    },
    {
        title: "Price",
        key: "prices",
        options: [
            { label: "Paid Courses" },
            { label: "Free Courses" },
        ],
    },
];
