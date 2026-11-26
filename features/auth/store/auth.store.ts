import { create } from "zustand";

import type { User } from "../types/auth.types";

interface AuthState {
    user: User | null;

    isAuthenticated: boolean;

    isInitialized: boolean;

    isLoading: boolean;

    setLoading: (isLoading: boolean) => void;

    setUser: (user: User) => void;

    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    // Initial authentication state
    user: null,

    isAuthenticated: false,

    isInitialized: false,

    isLoading: true,

    // Update authentication loading state
    setLoading: (isLoading) =>
        set({
            isLoading,
        }),

    // Set authenticated user
    setUser: (user) =>
        set({
            user,
            isAuthenticated: true,
            isInitialized: true,
            isLoading: false,
        }),

    // Clear authentication state
    clearAuth: () =>
        set({
            user: null,
            isAuthenticated: false,
            isInitialized: true,
            isLoading: false,
        }),
}));