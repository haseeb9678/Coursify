import type { User } from "@/features/auth/types/auth.types";

// Student header props
export interface StudentHeaderProps {
    notificationCount?: number;
}

// Student profile menu props
export interface StudentProfileMenuProps {
    student: User;
    onLogout: () => void;
    isLoggingOut?: boolean;
}