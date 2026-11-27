import { formatCoursePrice } from "@/features/admin/utils/learning.utils";

export function statusLabel(value?: string | null): string {
  if (!value) return "?";
  return value.toLowerCase().split("_").filter(Boolean).map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
}

export function commerceDate(value: string | null | undefined): string {
  return value ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "?";
}

export function commerceMoney(value: number | string, currency: string): string {
  if (typeof value === "number") return formatCoursePrice(value, currency);
  const minor = BigInt(value);
  if (minor <= BigInt(Number.MAX_SAFE_INTEGER)) return formatCoursePrice(Number(minor), currency);
  const whole = (minor / BigInt(100)).toLocaleString("en");
  const fraction = (minor % BigInt(100)).toString().padStart(2, "0");
  return `${currency} ${whole}.${fraction}`;
}

export function openStripeCheckout(value: string): void {
  const url = new URL(value);
  if (url.origin !== "https://checkout.stripe.com" || url.username || url.password || !url.pathname.startsWith("/c/pay/")) {
    throw new Error("The checkout address returned by the server is invalid.");
  }
  window.location.assign(url.href);
}

export function paymentReference(id: string): string {
  return id.slice(-8).toUpperCase();
}

export function safeMaterialUrl(value?: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}
