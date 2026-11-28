"use client";

import { useEffect, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { sessionTransport } from "@/lib/graphql/client";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { authKeys } from "@/features/auth/constants/auth.keys";
import { useMe } from "@/features/auth/hooks/use-me";

interface AuthProviderProps {
    children: ReactNode;
}

export default function AuthProvider({
    children,
}: AuthProviderProps) {
    const queryClient = useQueryClient();
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const { isError, refetch } = useMe();

    useEffect(() => {
        const unsubscribe = sessionTransport.subscribe((event) => {
            const auth = useAuthStore.getState();
            if (event === "refresh-start" || event === "refresh-end") {
                auth.setRefreshing(event === "refresh-start");
                return;
            }

            const identity = sessionTransport.identity();
            if (event === "signed-out") auth.clearAuth();
            else auth.initialize();
            void queryClient.cancelQueries().then(() => {
                if (sessionTransport.identity() !== identity) return;
                queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== authKeys.me()[0] });
                queryClient.setQueryData(authKeys.me(), null);
                if (event === "identity-changed") void refetch();
            });
        });
        const activity = () => {
            if (document.visibilityState === "visible" && useAuthStore.getState().isAuthenticated) {
                sessionTransport.activity();
            }
        };
        window.addEventListener("storage", sessionTransport.onStorage);
        window.addEventListener("focus", activity);
        window.addEventListener("online", activity);
        window.addEventListener("pointerdown", activity, { passive: true });
        window.addEventListener("keydown", activity);
        document.addEventListener("visibilitychange", activity);
        return () => {
            unsubscribe();
            window.removeEventListener("storage", sessionTransport.onStorage);
            window.removeEventListener("focus", activity);
            window.removeEventListener("online", activity);
            window.removeEventListener("pointerdown", activity);
            window.removeEventListener("keydown", activity);
            document.removeEventListener("visibilitychange", activity);
        };
    }, [queryClient, refetch]);

    if (isError && !isInitialized) {
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
