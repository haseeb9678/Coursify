import type { FilterGroupConfig } from "@/features/courses/types/catalog.types";

export const filterGroups: FilterGroupConfig[] = [
  {
    title: "Skill level",
    key: "levels",
    options: [
      { value: "BEGINNER", label: "Beginner" },
      { value: "INTERMEDIATE", label: "Intermediate" },
      { value: "ADVANCED", label: "Advanced" },
    ],
  },
  {
    title: "Price",
    key: "prices",
    options: [
      { value: "PAID", label: "Paid courses" },
      { value: "FREE", label: "Free courses" },
    ],
  },
];
