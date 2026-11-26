import type {
  User,
  UserRole,
  UserStatus,
} from "@/features/auth/types/auth.types";

export type AdminUser = User;
export type AccountStatus = UserStatus;
export type AdminRole = UserRole;
export type InstructorApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type SortDirection = "asc" | "desc";
export const ADMIN_PAGE_SIZES = [10, 20, 50, 100] as const;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface TableSorting {
  column: string;
  direction: SortDirection;
}

export interface AdminStudentProfile {
  userId: string;
  enrollments: {
    courseId: string;
    courseName: string;
    progress: number;
    status: "IN_PROGRESS" | "COMPLETED";
    enrolledAt: string;
  }[];
  certificates: string[];
  lastActivityAt: string | null;
}

export interface AdminInstructorProfile {
  userId: string;
  specialization: string;
  bio: string;
  courses: string[];
  studentsTaught: number;
  averageRating: number | null;
  reviewCount: number;
  totalEarnings: number;
  approvalStatus: InstructorApprovalStatus;
  applicationSubmittedAt: string;
  rejectionReason?: string;
}

export type AdminStudent = AdminUser & AdminStudentProfile & {
  averageProgress: number;
};

export type AdminInstructor = AdminUser & AdminInstructorProfile;

export interface UsersFilters {
  search: string;
  role: UserRole | "ALL";
  status: UserStatus | "ALL";
  verification: "ALL" | "VERIFIED" | "UNVERIFIED";
  registeredWithin: "ALL" | "30_DAYS" | "12_MONTHS";
}

export interface StudentsFilters {
  search: string;
  status: UserStatus | "ALL";
  activity: "ALL" | "ACTIVE" | "INACTIVE";
  enrollment: "ALL" | "ENROLLED" | "NOT_ENROLLED";
  progress: "ALL" | "LOW" | "MEDIUM" | "HIGH";
}

export interface InstructorsFilters {
  search: string;
  approvalStatus: InstructorApprovalStatus | "ALL";
  accountStatus: UserStatus | "ALL";
  specialization: string;
  rating: "ALL" | "RATED" | "UNRATED" | "4_PLUS";
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
}

export type UpdateUserInput = Partial<CreateUserInput>;

export interface AdminDemoSnapshot {
  users: AdminUser[];
  students: AdminStudentProfile[];
  instructors: AdminInstructorProfile[];
}
