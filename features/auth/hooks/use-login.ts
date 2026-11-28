"use client";

import {
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { loginUser } from "../api/auth.api";
import { authKeys } from "../constants/auth.keys";
import { useAuthStore } from "../store/auth.store";
import { commerceKeys } from "@/features/commerce/commerce-cache";
import { sessionTransport } from "@/lib/graphql/client";
import type { LoginInput } from "../types/auth.types";

export function useLogin() {
    const queryClient = useQueryClient();

    const setUser = useAuthStore(
        (state) => state.setUser,
    );

    return useMutation({
        mutationKey: ["auth", "login"],

        mutationFn: async (input: LoginInput) => {
            const { result, identity } = await loginUser(input);

            await queryClient.cancelQueries({
                queryKey: authKeys.me(),
            });
            if (sessionTransport.identity() !== identity) throw new Error("The session changed. Please try again.");

            if (useAuthStore.getState().user?.id !== result.user.id) {
                queryClient.removeQueries({ queryKey: commerceKeys.all });
            }

            queryClient.setQueryData(
                authKeys.me(),
                result.user,
            );

            setUser(result.user);
            return result;
        },

        retry: false,
        gcTime: 0,
    });
}
