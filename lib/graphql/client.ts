import { GraphQLClient } from "graphql-request";
import { createSessionTransport } from "./session-transport";

const server = typeof window === "undefined";
const endpoint = server
    ? process.env.GRAPHQL_URL ?? process.env.NEXT_PUBLIC_GRAPHQL_URL
    : new URL("/api/graphql", window.location.origin).href;

if (!endpoint) {
    throw new Error("GraphQL endpoint is not configured");
}

const storage = server ? undefined : {
    getItem: (key: string) => window.localStorage.getItem(key),
    setItem: (key: string, value: string) => window.localStorage.setItem(key, value),
};

export const sessionTransport = createSessionTransport({
    endpoint,
    fetch: (input, init) => globalThis.fetch(input, init),
    storage,
    locks: server ? undefined : navigator.locks,
});

export const graphqlClient = new GraphQLClient(endpoint, {
    credentials: server ? "omit" : "include",
    fetch: server ? (input, init) => globalThis.fetch(input, init) : sessionTransport.fetch,

    headers: {
        "Content-Type": "application/json",
    },
});
