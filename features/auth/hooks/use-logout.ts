"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { logoutUser } from "../api/auth.api";
import { authKeys } from "../constants/auth.keys";
import { useAuthStore } from "../store/auth.store";

import { getGraphQLErrorMessage } from "@/lib/graphql/error";
import { sessionTransport } from "@/lib/graphql/client";

export function useLogout() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const clearAuth = useAuthStore(
        (state) => state.clearAuth,
    );

    return useMutation({
        mutationKey: ["auth", "logout"],

        mutationFn: logoutUser,

        retry: false,

        onSuccess: async ({ result, identity }) => {
            // Cancel pending queries to prevent stale
            // authenticated data from being restored.
            await queryClient.cancelQueries();
            if (sessionTransport.identity() !== identity) return;

            // Replace the cached authenticated user.
            queryClient.setQueryData(
                authKeys.me(),
                null,
            );

            // Clear global authentication state.
            clearAuth();

            // Remove cached application data.
            queryClient.clear();

            // Display success notification.
            toast.success(result.message);

            // Redirect to login.
            router.replace("/login");

            // Refresh Next.js server component data.
            router.refresh();
        },

        onError: (error) => {
            toast.error(
                getGraphQLErrorMessage(error),
            );
        },
    });
}
