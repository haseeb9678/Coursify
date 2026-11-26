"use client";

import { useQuery } from "@tanstack/react-query";

import { getMe } from "../api/auth.api";
import { authKeys } from "../constants/auth.keys";

import { isAuthenticationError } from "@/lib/graphql/error";

export function useMe() {
    return useQuery({
        queryKey: authKeys.me(),

        queryFn: getMe,

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