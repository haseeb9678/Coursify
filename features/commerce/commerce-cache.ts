import type { QueryClient } from "@tanstack/react-query";

export const commerceKeys = {
  all: ["commerce"] as const,
  scope: (role: "student" | "admin", userId: string | undefined) =>
    [...commerceKeys.all, role, userId] as const,
};

export function refreshCommerce(client: QueryClient, userId: string | undefined) {
  return Promise.all([
    client.invalidateQueries({ queryKey: commerceKeys.scope("student", userId) }),
    client.invalidateQueries({ queryKey: [...commerceKeys.all, "admin"] }),
  ]);
}
