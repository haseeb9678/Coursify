export type UserRole = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: UserRole;
    status: UserStatus;
    isEmailVerified: boolean;
    lastLoginAt?: string | null;
    createdAt: string;
    updatedAt?: string;
}

// Register
export interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

// Login
export interface LoginInput {
    email: string;
    password: string;
}

// Common authentication response
export interface AuthResponse {
    success: boolean;
    message: string;
    user: User;
}

// Register response
export interface RegisterResponse {
    register: AuthResponse;
}

// Login response
export interface LoginResponse {
    login: AuthResponse;
}

// Me response
export interface MeResponse {
    me: User;
}

// GraphQL variables
export type RegisterVariables = {
    input: RegisterInput;
};

export type LoginVariables = {
    input: LoginInput;
};

export interface LogoutResponse {
    logout: {
        success: boolean;
        message: string;
    };
}