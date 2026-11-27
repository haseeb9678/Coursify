import type { HeroSlide } from "@/features/home/types/hero-slide.types";
import type { HeroFields, PublicHeroSlide, PublicPopup } from "./website-types";

const positions: Record<HeroFields["imagePosition"], string> = {
  CENTER: "center", CENTER_UP: "center 40%", LEFT: "left", RIGHT: "right", TOP: "top", BOTTOM: "bottom",
};

export function toHeroSlide(slide: PublicHeroSlide): HeroSlide {
  return {
    id: slide.id, src: slide.imageUrl ?? "", mobileSrc: slide.mobileImageUrl ?? undefined,
    alt: slide.imageAlt, eyebrow: slide.eyebrow, title: slide.title, description: slide.description,
    ctaLabel: slide.primaryCtaLabel, ctaHref: slide.primaryCtaHref ?? undefined,
    secondaryCtaLabel: slide.secondaryCtaLabel, secondaryCtaHref: slide.secondaryCtaHref ?? undefined,
    imagePosition: positions[slide.imagePosition],
  };
}

export function isMarketingPath(path: string) {
  return path === "/" || /^\/courses(?:\/[a-zA-Z0-9-]+)?\/?$/.test(path);
}

export function canUseReference(value: string) {
  const invalidCharacter = [...value].some((character) => {
    const code = character.charCodeAt(0);
    return code < 32 || code === 127;
  });
  if (invalidCharacter || /[\\\s]/.test(value) || /%(?:0[0-9a-f]|1[0-9a-f]|2f|5c|7f)/i.test(value)) return false;
  try {
    const url = new URL(value, "https://internal.invalid");
    return value.startsWith("/") && !value.startsWith("//") && url.origin === "https://internal.invalid"
      || /^https:\/\/[^/?#]/.test(value) && !url.username && !url.password && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function canUseImageReference(value: string) {
  if (!canUseReference(value)) return false;
  const url = new URL(value, "https://internal.invalid");
  return ![...url.searchParams.keys()].some((key) =>
    /^(?:x-amz-|x-goog-)/i.test(key) ||
    /^(?:token|access_token|api_key|sig|signature|awsaccesskeyid|googleaccessid|key-pair-id|policy|credential)$/i.test(key),
  );
}

export const PUBLIC_CONTENT_MAX_AGE_MS = 45_000;

export function estimatedServerTime(data: { serverTime: string; receivedAt: number }) {
  return Date.parse(data.serverTime) + Math.max(0, Date.now() - data.receivedAt);
}

const seen = new Map<string, number>();
const keyFor = (id: string) => `coursify:promotional-popup:${id}`;

function browserStorage(campaign: PublicPopup) {
  return campaign.displayFrequency === "ONCE_PER_SESSION" ? window.sessionStorage : window.localStorage;
}

export function isFrequencyEligible(campaign: PublicPopup, now = Date.now()) {
  if (campaign.displayFrequency === "EVERY_VISIT") return true;
  const key = keyFor(campaign.id);
  let timestamp = seen.get(key) ?? 0;
  try {
    const saved = Number(browserStorage(campaign).getItem(key));
    if (Number.isFinite(saved)) timestamp = Math.max(timestamp, saved);
  } catch {
    // Memory remains available when storage is blocked.
  }
  if (timestamp === 0) return true;
  if (campaign.displayFrequency === "ONCE_PER_SESSION" || campaign.displayFrequency === "ONCE_PER_VISITOR") return false;
  const hours = campaign.displayFrequency === "ONCE_PER_DAY" ? 24 : campaign.repeatAfterHours ?? 24;
  return now - timestamp >= hours * 3_600_000;
}

export function recordPopupDisplay(campaign: PublicPopup, now = Date.now()) {
  const key = keyFor(campaign.id);
  seen.set(key, now);
  if (campaign.displayFrequency === "EVERY_VISIT") return;
  try {
    browserStorage(campaign).setItem(key, String(now));
  } catch {
    // Keep the restriction for the current document.
  }
}
