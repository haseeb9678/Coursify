"use client";

import { useQuery } from "@tanstack/react-query";

import { getMe } from "../api/auth.api";
import { authKeys } from "../constants/auth.keys";

import { isAuthenticationError } from "@/lib/graphql/error";
import { sessionTransport } from "@/lib/graphql/client";
import { useAuthStore } from "../store/auth.store";

export function useMe() {
    return useQuery({
        queryKey: authKeys.me(),

        queryFn: async ({ signal }) => {
            const identity = sessionTransport.identity();
            try {
                const user = await getMe(signal);
                if (!signal.aborted && sessionTransport.identity() === identity) {
                    useAuthStore.getState().setUser(user);
                }
                return user;
            } catch (error) {
                if (!signal.aborted && sessionTransport.isSignedOut() && isAuthenticationError(error)) {
                    useAuthStore.getState().clearAuth();
                    return null;
                }
                throw error;
            }
        },

        staleTime: 5 * 60 * 1000,

        gcTime: 10 * 60 * 1000,

        retry: (failureCount, error) => {
            if (isAuthenticationError(error)) {
                return false;
            }

            return failureCount < 2;
        },

        refetchOnWindowFocus: true,

        refetchOnReconnect: true,
    });
}
