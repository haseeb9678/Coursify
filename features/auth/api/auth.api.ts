import { graphqlClient } from "@/lib/graphql/client";

import {
    REGISTER_MUTATION,
    LOGIN_MUTATION,
    LOGOUT_MUTATION,
} from "../graphql/auth.mutations";

import { ME_QUERY } from "../graphql/auth.queries";

import type {
    RegisterInput,
    RegisterResponse,
    RegisterVariables,
    LoginInput,
    LoginResponse,
    LoginVariables,
    AuthResponse,
    MeResponse,
    User,
    LogoutResponse,
} from "../types/auth.types";

// Register user
export async function registerUser(
    input: RegisterInput,
): Promise<AuthResponse> {
    const response = await graphqlClient.request<
        RegisterResponse,
        RegisterVariables
    >(REGISTER_MUTATION, {
        input,
    });

    return response.register;
}

// Login user
export async function loginUser(
    input: LoginInput,
): Promise<AuthResponse> {
    const response = await graphqlClient.request<
        LoginResponse,
        LoginVariables
    >(LOGIN_MUTATION, {
        input,
    });

    return response.login;
}

// Get currently authenticated user
export async function getMe(): Promise<User> {
    const response = await graphqlClient.request<MeResponse>(
        ME_QUERY,
    );

    return response.me;
}

export async function logoutUser(): Promise<
    LogoutResponse["logout"]
> {
    const response =
        await graphqlClient.request<LogoutResponse>(
            LOGOUT_MUTATION,
        );

    return response.logout;
}