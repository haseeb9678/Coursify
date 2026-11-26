"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { loginUser } from "../api/auth.api";
import { authKeys } from "../constants/auth.keys";
import { useAuthStore } from "../store/auth.store";

export function useLogin() {
    const queryClient = useQueryClient();

    const setUser = useAuthStore(
        (state) => state.setUser,
    );

    return useMutation({
        mutationKey: ["auth", "login"],

        mutationFn: loginUser,

        retry: false,

        gcTime: 0,

        onSuccess: async (response) => {
            // Cancel any previous me request
            await queryClient.cancelQueries({
                queryKey: authKeys.me(),
            });

            // Update TanStack Query cache
            queryClient.setQueryData(
                authKeys.me(),
                response.user,
            );

            // Update Zustand authentication state
            setUser(response.user);
        },
    });
}