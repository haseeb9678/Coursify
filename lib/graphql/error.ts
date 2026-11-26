import { ClientError } from "graphql-request";

export function getGraphQLErrorMessage(
    error: unknown,
): string {
    if (error instanceof ClientError) {
        return (
            error.response.errors?.[0]?.message ??
            "Something went wrong."
        );
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "An unexpected error occurred.";
}

export function getGraphQLErrorCode(
    error: unknown,
): string | undefined {
    if (error instanceof ClientError) {
        const code =
            error.response.errors?.[0]?.extensions?.code;

        return typeof code === "string"
            ? code
            : undefined;
    }

    return undefined;
}

export function isAuthenticationError(
    error: unknown,
): boolean {
    const code = getGraphQLErrorCode(error);

    return (
        code === "UNAUTHENTICATED" ||
        code === "FORBIDDEN"
    );
}