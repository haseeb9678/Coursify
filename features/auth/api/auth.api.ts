import { graphqlClient, sessionTransport } from "@/lib/graphql/client";

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
export function loginUser(input: LoginInput) {
    return sessionTransport.runIdentityAction("login", async () => {
        const response = await graphqlClient.request<LoginResponse, LoginVariables>({
            document: LOGIN_MUTATION,
            variables: { input },
            signal: AbortSignal.timeout(15_000),
        });
        return response.login;
    });
}

// Get currently authenticated user
export async function getMe(signal?: AbortSignal): Promise<User> {
    const response = await graphqlClient.request<MeResponse>({ document: ME_QUERY, signal });

    return response.me;
}

export function logoutUser() {
    return sessionTransport.runIdentityAction("logout", async () => {
        const { logout } = await graphqlClient.request<LogoutResponse>({
            document: LOGOUT_MUTATION,
            signal: AbortSignal.timeout(15_000),
        });
        if (!logout.success) throw new Error(logout.message);
        return logout;
    });
}
