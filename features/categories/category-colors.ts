export interface CategoryColors {
  iconColor: string;
  iconBackground: string;
}

export const categoryPalettes = {
  blue: { iconColor: "#2563EB", iconBackground: "#DBEAFE" },
  orange: { iconColor: "#C2410C", iconBackground: "#FFEDD5" },
  purple: { iconColor: "#9333EA", iconBackground: "#F3E8FF" },
  green: { iconColor: "#047857", iconBackground: "#D1FAE5" },
  pink: { iconColor: "#BE185D", iconBackground: "#FCE7F3" },
  indigo: { iconColor: "#4F46E5", iconBackground: "#E0E7FF" },
  cyan: { iconColor: "#0E7490", iconBackground: "#CFFAFE" },
  red: { iconColor: "#DC2626", iconBackground: "#FEE2E2" },
  amber: { iconColor: "#B45309", iconBackground: "#FEF3C7" },
  teal: { iconColor: "#0F766E", iconBackground: "#CCFBF1" },
  slate: { iconColor: "#475569", iconBackground: "#F1F5F9" },
  emerald: { iconColor: "#047857", iconBackground: "#ECFDF5" },
} satisfies Record<string, CategoryColors>;

export type CategoryPaletteName = keyof typeof categoryPalettes;

const fallbackPalettes = Object.values(categoryPalettes);

export function getFallbackPalette(name: string): CategoryColors {
  let hash = 0;
  for (const character of name) {
    hash = (Math.imul(hash, 31) + character.charCodeAt(0)) >>> 0;
  }
  return fallbackPalettes[hash % fallbackPalettes.length];
}

export function isCategoryHexColor(value: string): boolean {
  return value.length === 7 && /^#[0-9a-f]{6}$/i.test(value);
}

export function normalizeCategoryColor(value: string): string {
  return isCategoryHexColor(value) ? value.toUpperCase() : value;
}

function luminance(color: string): number {
  const channels = [1, 3, 5].map((start) => {
    const channel = Number.parseInt(color.slice(start, start + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function getCategoryColorContrast({ iconColor, iconBackground }: CategoryColors) {
  if (!isCategoryHexColor(iconColor) || !isCategoryHexColor(iconBackground)) return null;
  const foreground = luminance(iconColor);
  const background = luminance(iconBackground);
  return (Math.max(foreground, background) + 0.05) /
    (Math.min(foreground, background) + 0.05);
}
