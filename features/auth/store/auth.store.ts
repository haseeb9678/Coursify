import { create } from "zustand";

import type { User } from "../types/auth.types";

interface AuthState {
    user: User | null;

    isAuthenticated: boolean;

    isInitialized: boolean;

    isLoading: boolean;

    isRefreshing: boolean;
    setRefreshing: (isRefreshing: boolean) => void;
    initialize: () => void;

    setUser: (user: User) => void;

    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    // Initial authentication state
    user: null,

    isAuthenticated: false,

    isInitialized: false,

    isLoading: true,
    isRefreshing: false,

    setRefreshing: (isRefreshing) => set({ isRefreshing }),

    initialize: () => set({ user: null, isAuthenticated: false, isInitialized: false, isLoading: true }),

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
            isRefreshing: false,
        }),
}));
