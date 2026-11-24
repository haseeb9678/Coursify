export interface StudentProfile {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
}

export interface StudentHeaderProps {
    student?: StudentProfile | null;
    notificationCount?: number;
    onLogout?: () => void | Promise<void>;
}