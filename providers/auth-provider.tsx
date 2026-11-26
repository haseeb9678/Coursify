"use client";

import { useEffect, type ReactNode } from "react";


import { isAuthenticationError } from "@/lib/graphql/error";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useMe } from "@/features/auth/hooks/use-me";

interface AuthProviderProps {
    children: ReactNode;
}

export default function AuthProvider({
    children,
}: AuthProviderProps) {
    const setUser = useAuthStore(
        (state) => state.setUser,
    );

    const clearAuth = useAuthStore(
        (state) => state.clearAuth,
    );

    const {
        data: user,
        isSuccess,
        isError,
        error,
        refetch,
    } = useMe();

    useEffect(() => {
        // Valid authentication session
        if (isSuccess && user) {
            setUser(user);
            return;
        }

        // Invalid or expired authentication session
        if (
            isError &&
            isAuthenticationError(error)
        ) {
            clearAuth();
        }
    }, [
        user,
        isSuccess,
        isError,
        error,
        setUser,
        clearAuth,
    ]);

    // Temporary network or server error
    if (isError && !isAuthenticationError(error)) {
        return (
            <div
                role="alert"
                className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center"
            >
                <p className="text-sm text-brand-text-muted">
                    Unable to verify your session.
                    Please check your connection.
                </p>

                <button
                    type="button"
                    onClick={() => void refetch()}
                    className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white"
                >
                    Try again
                </button>
            </div>
        );
    }

    return <>{children}</>;
}