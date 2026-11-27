import { z } from "zod";
import {
  audiences, frequencies, imagePositions, pageTargets, popupLayouts, popupTriggers, statuses,
  type HeroInput, type PopupInput, type WebsiteKind, type WebsiteRecord,
} from "./website-types";
import { canUseImageReference, canUseReference, isMarketingPath } from "./website-display";

const url = z.string().max(2048).refine((value) => !value.trim() || canUseReference(value.trim()), "Use a site-relative path or a valid HTTPS URL.");
const image = url.refine((value) => !value.trim() || canUseImageReference(value.trim()), "Use a public image URL without signed credentials.");
const fields = z.object({
  internalName: z.string().trim().min(1, "Enter an internal name.").max(100),
  title: z.string().max(110),
  description: z.string().max(500),
  eyebrow: z.string().max(60),
  imageUrl: image,
  mobileImageUrl: image,
  imageAlt: z.string().max(160),
  imagePosition: z.enum(imagePositions),
  primaryCtaLabel: z.string().max(40),
  primaryCtaHref: url,
  secondaryCtaLabel: z.string().max(40),
  secondaryCtaHref: url,
  status: z.enum(statuses),
  startsAt: z.string(),
  endsAt: z.string(),
  layout: z.enum(popupLayouts),
  priority: z.number().int().min(0).max(1000),
  triggerType: z.enum(popupTriggers),
  delaySeconds: z.number().int().min(0).max(120),
  displayFrequency: z.enum(frequencies),
  repeatAfterHours: z.number().int().min(1).max(8760),
  audience: z.enum(audiences),
  pageTarget: z.enum(pageTargets),
  targetPaths: z.string().max(5019),
});

export type WebsiteForm = z.infer<typeof fields>;

const splitPaths = (value: string) => value.split(/\r?\n/).map((path) => path.trim()).filter(Boolean);

export function websiteFormSchema(kind: WebsiteKind) {
  return fields.superRefine((values, context) => {
    const error = (field: keyof WebsiteForm, message: string) => context.addIssue({ code: "custom", path: [field], message });
    if (kind === "hero" && values.description.length > 260) error("description", "Use 260 characters or fewer.");
    for (const name of ["startsAt", "endsAt"] as const) {
      if (values[name] && !Number.isFinite(Date.parse(values[name]))) error(name, "Enter a valid local date and time.");
    }
    if (values.startsAt && values.endsAt && Date.parse(values.endsAt) <= Date.parse(values.startsAt)) {
      error("endsAt", "The end must be later than the start.");
    }
    if (kind === "popup" && values.pageTarget === "SPECIFIC_PATHS") {
      const paths = splitPaths(values.targetPaths);
      if (paths.length > 20 || paths.some((path) => path.length > 250 || !isMarketingPath(path))) {
        error("targetPaths", "Enter up to 20 homepage, catalog, or course paths.");
      } else if (values.status === "ACTIVE" && !paths.length) {
        error("targetPaths", "Enter at least one public path.");
      }
    }
    if (values.status !== "ACTIVE") return;
    if (!values.title.trim()) error("title", "Enter a title before activating.");
    if (!values.description.trim()) error("description", "Enter a description before activating.");
    if (kind === "hero" && !values.imageUrl.trim()) error("imageUrl", "Enter the desktop image reference.");
    if (values.imageUrl.trim() && !values.imageAlt.trim()) error("imageAlt", "Enter alternative text.");
    for (const [label, href] of [["primaryCtaLabel", "primaryCtaHref"], ["secondaryCtaLabel", "secondaryCtaHref"]] as const) {
      const required = kind === "hero" && label === "primaryCtaLabel";
      if ((required || values[href].trim()) && !values[label].trim()) error(label, "Enter a button label.");
      if ((required || values[label].trim()) && !values[href].trim()) error(href, "Enter a button destination.");
    }
  });
}

function toLocal(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 19);
}

export function websiteFormValues(record?: WebsiteRecord): WebsiteForm {
  const hero = record && "position" in record ? record : undefined;
  const popup = record && "priority" in record ? record : undefined;
  return {
    internalName: record?.internalName ?? "", title: record?.title ?? "", description: record?.description ?? "",
    imageUrl: record?.imageUrl ?? "", imageAlt: record?.imageAlt ?? "",
    primaryCtaLabel: record?.primaryCtaLabel ?? "", primaryCtaHref: record?.primaryCtaHref ?? "",
    secondaryCtaLabel: record?.secondaryCtaLabel ?? "", secondaryCtaHref: record?.secondaryCtaHref ?? "",
    status: record?.status ?? "DRAFT", startsAt: toLocal(record?.startsAt), endsAt: toLocal(record?.endsAt),
    eyebrow: hero?.eyebrow ?? "", mobileImageUrl: hero?.mobileImageUrl ?? "", imagePosition: hero?.imagePosition ?? "CENTER",
    layout: popup?.layout ?? "CENTERED", priority: popup?.priority ?? 0, triggerType: popup?.triggerType ?? "ON_PAGE_LOAD",
    delaySeconds: popup?.delaySeconds ?? 5, displayFrequency: popup?.displayFrequency ?? "ONCE_PER_SESSION",
    repeatAfterHours: popup?.repeatAfterHours ?? 24, audience: popup?.audience ?? "ALL_VISITORS",
    pageTarget: popup?.pageTarget ?? "HOMEPAGE_ONLY", targetPaths: popup?.targetPaths.join("\n") ?? "",
  };
}

function commonInput(form: WebsiteForm) {
  return {
    internalName: form.internalName, title: form.title, description: form.description,
    imageUrl: form.imageUrl.trim() || null, imageAlt: form.imageAlt,
    primaryCtaLabel: form.primaryCtaLabel, primaryCtaHref: form.primaryCtaHref.trim() || null,
    secondaryCtaLabel: form.secondaryCtaLabel, secondaryCtaHref: form.secondaryCtaHref.trim() || null,
    status: form.status, startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
    endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
  };
}

export function heroInput(form: WebsiteForm): HeroInput {
  return { ...commonInput(form), eyebrow: form.eyebrow, mobileImageUrl: form.mobileImageUrl.trim() || null, imagePosition: form.imagePosition };
}

export function popupInput(form: WebsiteForm): PopupInput {
  return {
    ...commonInput(form), layout: form.layout, priority: form.priority, triggerType: form.triggerType,
    delaySeconds: form.delaySeconds, displayFrequency: form.displayFrequency,
    repeatAfterHours: form.displayFrequency === "CUSTOM_INTERVAL" ? form.repeatAfterHours : null,
    audience: form.audience, pageTarget: form.pageTarget,
    targetPaths: form.pageTarget === "SPECIFIC_PATHS" ? splitPaths(form.targetPaths) : [],
  };
}

export const heroSettingsSchema = z.object({
  isEnabled: z.boolean(), autoplayEnabled: z.boolean(), autoplayDelayMs: z.number().int().min(3000).max(15000),
  loopEnabled: z.boolean(), showNavigationArrows: z.boolean(), showPaginationDots: z.boolean(),
  pauseOnHover: z.boolean(), pauseOnFocus: z.boolean(),
}).refine((settings) => settings.showNavigationArrows || settings.showPaginationDots, {
  path: ["showPaginationDots"], message: "Keep at least one manual navigation control enabled.",
});

export function humanize(value: string) {
  const labels: Record<string, string> = {
    CENTER_UP: "Center, 40% from top",
    ON_PAGE_LOAD: "On page load",
    ONCE_PER_DAY: "Once every 24 hours",
    EVERY_VISIT: "Every full page visit",
  };
  return labels[value] ?? value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}
