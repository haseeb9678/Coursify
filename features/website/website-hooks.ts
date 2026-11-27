"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actOnWebsiteContent, getHeroSettings, getPublicHero, getPublicPopups, getWebsiteContent, getWebsiteStats,
  listWebsiteContent, saveWebsiteContent, updateHeroSettings, type WebsiteAction,
} from "./website-api";
import type { WebsiteKind, WebsiteListInput } from "./website-types";

export const websiteKeys = {
  admin: (kind: WebsiteKind) => ["website", "admin", kind] as const,
  settings: ["website", "admin", "settings"] as const,
  public: (kind: WebsiteKind) => ["website", "public", kind] as const,
};

export function useWebsiteList(kind: WebsiteKind, input: WebsiteListInput) {
  return useQuery({ queryKey: [...websiteKeys.admin(kind), "list", input], queryFn: () => listWebsiteContent(kind, input) });
}

export function useWebsiteItem(kind: WebsiteKind, id?: string) {
  return useQuery({
    queryKey: [...websiteKeys.admin(kind), "item", id],
    queryFn: () => getWebsiteContent(kind, id ?? ""),
    enabled: Boolean(id),
    refetchOnMount: "always",
  });
}

export function useWebsiteStats(kind: WebsiteKind) {
  return useQuery({
    queryKey: [...websiteKeys.admin(kind), "stats"],
    queryFn: () => getWebsiteStats(kind),
    refetchInterval: 30_000,
  });
}

export function useHeroSettings(enabled: boolean) {
  return useQuery({ queryKey: websiteKeys.settings, queryFn: getHeroSettings, enabled });
}

function useInvalidateWebsite(kind: WebsiteKind) {
  const client = useQueryClient();
  return () => Promise.all([
    client.invalidateQueries({ queryKey: websiteKeys.admin(kind) }),
    client.invalidateQueries({ queryKey: websiteKeys.public(kind) }),
  ]);
}

export function useSaveWebsiteContent(kind: WebsiteKind) {
  const invalidate = useInvalidateWebsite(kind);
  return useMutation({ mutationFn: saveWebsiteContent, onSuccess: invalidate });
}

export function useWebsiteAction(kind: WebsiteKind) {
  const invalidate = useInvalidateWebsite(kind);
  return useMutation({ mutationFn: (input: WebsiteAction) => actOnWebsiteContent(kind, input), onSuccess: invalidate });
}

export function useSaveHeroSettings() {
  const client = useQueryClient();
  const invalidate = useInvalidateWebsite("hero");
  return useMutation({
    mutationFn: updateHeroSettings,
    onSuccess: async (settings) => {
      client.setQueryData(websiteKeys.settings, settings);
      await invalidate();
    },
  });
}

const publicRefresh = { staleTime: 0, refetchInterval: 15_000, refetchOnWindowFocus: true, retry: false } as const;

export function usePublicHero() {
  return useQuery({ queryKey: websiteKeys.public("hero"), queryFn: getPublicHero, ...publicRefresh });
}

export function usePublicPopups(path: string, authenticated: boolean, enabled: boolean) {
  return useQuery({
    queryKey: [...websiteKeys.public("popup"), path, authenticated],
    queryFn: () => getPublicPopups(path),
    enabled,
    ...publicRefresh,
  });
}
