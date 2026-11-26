import { GraphQLClient } from "graphql-request";

const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL;

if (!endpoint) {
    throw new Error("GraphQL endpoint is not configured");
}

export const graphqlClient = new GraphQLClient(endpoint, {
    credentials: "include",

    headers: {
        "Content-Type": "application/json",
    },
});