import type { PaginationMeta } from "@/features/admin/types/management.types";

export const statuses = ["DRAFT", "ACTIVE", "INACTIVE"] as const;
export const imagePositions = ["CENTER", "CENTER_UP", "LEFT", "RIGHT", "TOP", "BOTTOM"] as const;
export const popupLayouts = ["CENTERED", "IMAGE_LEFT", "IMAGE_TOP", "TEXT_ONLY"] as const;
export const popupTriggers = ["ON_PAGE_LOAD", "AFTER_DELAY"] as const;
export const frequencies = ["ONCE_PER_SESSION", "ONCE_PER_VISITOR", "ONCE_PER_DAY", "EVERY_VISIT", "CUSTOM_INTERVAL"] as const;
export const audiences = ["ALL_VISITORS", "GUESTS_ONLY", "AUTHENTICATED_USERS"] as const;
export const pageTargets = ["HOMEPAGE_ONLY", "ALL_PUBLIC_PAGES", "COURSE_CATALOG", "SPECIFIC_PATHS"] as const;

export type ContentStatus = typeof statuses[number];
export type WebsiteKind = "hero" | "popup";
export type Visibility = "LIVE" | "SCHEDULED" | "EXPIRED";
export type Sort = "ORDER" | "NAME" | "UPDATED" | "CREATED";

export interface ContentFields {
  title: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string;
  primaryCtaLabel: string;
  primaryCtaHref: string | null;
  secondaryCtaLabel: string;
  secondaryCtaHref: string | null;
  endsAt: string | null;
}

export interface AdminFields {
  internalName: string;
  status: ContentStatus;
  startsAt: string | null;
}

export interface HeroFields {
  eyebrow: string;
  mobileImageUrl: string | null;
  imagePosition: typeof imagePositions[number];
}

export interface PopupFields {
  layout: typeof popupLayouts[number];
  priority: number;
  triggerType: typeof popupTriggers[number];
  delaySeconds: number;
  displayFrequency: typeof frequencies[number];
  repeatAfterHours: number | null;
}

export interface PopupTargets {
  audience: typeof audiences[number];
  pageTarget: typeof pageTargets[number];
  targetPaths: string[];
}

export type HeroInput = ContentFields & AdminFields & HeroFields;
export type PopupInput = ContentFields & AdminFields & PopupFields & PopupTargets;
export type PublicHeroSlide = ContentFields & HeroFields & { id: string; position: number };
export type PublicPopup = ContentFields & PopupFields & { id: string };
type Timestamps = { createdAt: string; updatedAt: string };
export type HeroRecord = PublicHeroSlide & AdminFields & Timestamps;
export type PopupRecord = PublicPopup & AdminFields & PopupTargets & Timestamps;
export type WebsiteRecord = HeroRecord | PopupRecord;

export interface HeroSettings {
  isEnabled: boolean;
  autoplayEnabled: boolean;
  autoplayDelayMs: number;
  loopEnabled: boolean;
  showNavigationArrows: boolean;
  showPaginationDots: boolean;
  pauseOnHover: boolean;
  pauseOnFocus: boolean;
}

export interface WebsiteStats {
  total: number;
  live: number;
  scheduled: number;
  drafts: number;
  inactiveOrExpired: number;
}

export interface WebsiteListInput {
  pagination: { page: number; limit: number };
  filter?: { search?: string; status?: ContentStatus; visibility?: Visibility; sort?: Sort; descending?: boolean };
}

export type WebsitePage<T> = { items: T[]; meta: PaginationMeta };
export type PublicHero = { settings: HeroSettings; slides: PublicHeroSlide[]; serverTime: string; receivedAt: number };
export type PublicPopups = { campaigns: PublicPopup[]; serverTime: string; receivedAt: number };
