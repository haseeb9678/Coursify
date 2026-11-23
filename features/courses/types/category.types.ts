
export type CategoryIconName =
    | "PenTool"
    | "Code2"
    | "Megaphone"
    | "BriefcaseBusiness"
    | "Camera"
    | "ChartNoAxesColumn";

export interface CourseCategory {
    id: string;
    name: string;
    slug: string;
    description: string;
    courseCount: number;
    iconName: CategoryIconName;
    iconBackground: string;
    iconColor: string;
}
