import { graphqlClient } from "@/lib/graphql/client";
import type {
  ContentStatus, HeroInput, HeroRecord, HeroSettings, PopupInput, PopupRecord,
  PublicHero, PublicPopups, WebsiteKind, WebsiteListInput, WebsitePage, WebsiteStats,
} from "./website-types";

const commonFields = "id title description imageUrl imageAlt primaryCtaLabel primaryCtaHref secondaryCtaLabel secondaryCtaHref endsAt";
const heroFields = commonFields + " eyebrow mobileImageUrl imagePosition position";
const popupFields = commonFields + " layout priority triggerType delaySeconds displayFrequency repeatAfterHours";
const adminFields = " internalName status startsAt createdAt updatedAt";
const settingsFields = "isEnabled autoplayEnabled autoplayDelayMs loopEnabled showNavigationArrows showPaginationDots pauseOnHover pauseOnFocus";
const pageFields = "meta { page limit total totalPages hasNext hasPrevious }";
const config = {
  hero: { admin: "adminHeroSlide", name: "HeroSlide", input: "HeroSlideInput", fields: heroFields + adminFields },
  popup: { admin: "adminPromotionalPopup", name: "PromotionalPopup", input: "PopupInput", fields: popupFields + adminFields + " audience pageTarget targetPaths" },
} as const;

type ContentRecord<K extends WebsiteKind> = K extends "hero" ? HeroRecord : PopupRecord;

export async function listWebsiteContent<K extends WebsiteKind>(kind: K, variables: WebsiteListInput) {
  const { admin, fields } = config[kind];
  const key = admin + "s";
  const response = await graphqlClient.request<Record<string, WebsitePage<ContentRecord<K>>>, WebsiteListInput>(
    `query WebsiteContent($pagination: PaginationInput!, $filter: WebsiteFilter) {
      ${key}(pagination: $pagination, filter: $filter) { items { ${fields} } ${pageFields} }
    }`, variables,
  );
  return response[key];
}

export async function getWebsiteContent<K extends WebsiteKind>(kind: K, id: string) {
  const { admin, fields } = config[kind];
  const response = await graphqlClient.request<Record<string, ContentRecord<K>>, { id: string }>(
    `query WebsiteItem($id: ID!) { ${admin}(id: $id) { ${fields} } }`, { id },
  );
  return response[admin];
}

export async function getWebsiteStats(kind: WebsiteKind) {
  const key = config[kind].admin + "Stats";
  const response = await graphqlClient.request<Record<string, WebsiteStats>>(
    `query WebsiteStats { ${key} { total live scheduled drafts inactiveOrExpired } }`,
  );
  return response[key];
}

type WebsiteSave = ({ kind: "hero"; input: HeroInput } | { kind: "popup"; input: PopupInput }) & { id?: string };
export async function saveWebsiteContent({ kind, id, input }: WebsiteSave) {
  const item = config[kind];
  const key = "admin" + (id ? "Update" : "Create") + item.name;
  const response = await graphqlClient.request<Record<string, HeroRecord | PopupRecord>, { id?: string; input: HeroInput | PopupInput }>(
    `mutation SaveWebsiteContent(${id ? "$id: ID!, " : ""}$input: ${item.input}!) {
      ${key}(${id ? "id: $id, " : ""}input: $input) { ${item.fields} }
    }`, id ? { id, input } : { input },
  );
  return response[key];
}

export type WebsiteAction =
  | { action: "status"; id: string; status: ContentStatus }
  | { action: "delete"; id: string }
  | { action: "move"; id: string; direction: "UP" | "DOWN" };

export async function actOnWebsiteContent(kind: WebsiteKind, input: WebsiteAction) {
  const item = config[kind];
  if (input.action === "move") {
    if (kind !== "hero") throw new Error("Only hero slides have a positional order.");
    const { id, direction } = input;
    await graphqlClient.request<unknown, { id: string; direction: "UP" | "DOWN" }>(
      `mutation MoveHeroSlide($id: ID!, $direction: HeroMove!) { adminMoveHeroSlide(id: $id, direction: $direction) { id } }`, { id, direction },
    );
  } else if (input.action === "status") {
    const { id, status } = input;
    await graphqlClient.request<unknown, { id: string; status: ContentStatus }>(
      `mutation SetWebsiteContentStatus($id: ID!, $status: WebsiteContentStatus!) { adminUpdate${item.name}Status(id: $id, status: $status) { id } }`,
      { id, status },
    );
  } else {
    const key = "adminDelete" + item.name;
    const response = await graphqlClient.request<Record<string, { success: boolean; message: string }>, { id: string }>(
      `mutation DeleteWebsiteContent($id: ID!) { ${key}(id: $id) { success message } }`, { id: input.id },
    );
    if (!response[key].success) throw new Error(response[key].message);
  }
}

export async function getHeroSettings() {
  const result = await graphqlClient.request<{ adminHeroSettings: HeroSettings }>(`query HeroSettings { adminHeroSettings { ${settingsFields} } }`);
  return result.adminHeroSettings;
}

export async function updateHeroSettings(input: HeroSettings) {
  const result = await graphqlClient.request<{ adminUpdateHeroSettings: HeroSettings }, { input: HeroSettings }>(
    `mutation UpdateHeroSettings($input: HeroSettingsInput!) { adminUpdateHeroSettings(input: $input) { ${settingsFields} } }`, { input },
  );
  return result.adminUpdateHeroSettings;
}

export async function getPublicHero() {
  const result = await graphqlClient.request<{ publicHero: Omit<PublicHero, "receivedAt"> }>(`query PublicHero {
    publicHero { settings { ${settingsFields} } slides { ${heroFields} } serverTime }
  }`);
  return { ...result.publicHero, receivedAt: Date.now() };
}

export async function getPublicPopups(path: string) {
  const result = await graphqlClient.request<{ publicPromotionalPopups: Omit<PublicPopups, "receivedAt"> }, { path: string }>(
    `query PublicPromotionalPopups($path: String!) { publicPromotionalPopups(path: $path) { campaigns { ${popupFields} } serverTime } }`, { path },
  );
  return { ...result.publicPromotionalPopups, receivedAt: Date.now() };
}
