import type { CategoryColors } from "./category-colors";
import { getRecommendedCategoryColors } from "./category-icon-library";

interface CategoryAppearance extends CategoryColors {
  iconKey: string;
}

type SavedCategoryAppearance = Partial<CategoryColors> & Pick<CategoryAppearance, "iconKey">;

export function getInitialCategoryAppearance(saved?: SavedCategoryAppearance): CategoryAppearance {
  const iconKey = saved?.iconKey ?? "Code2";
  const recommended = getRecommendedCategoryColors(iconKey);

  return {
    iconKey,
    iconColor: saved?.iconColor ?? recommended.iconColor,
    iconBackground: saved?.iconBackground ?? recommended.iconBackground,
  };
}

export function getCategoryAppearanceChanges(
  appearance: CategoryAppearance,
  saved: SavedCategoryAppearance,
) {
  const initial = getInitialCategoryAppearance(saved);

  return {
    ...(appearance.iconKey !== initial.iconKey && { iconName: appearance.iconKey }),
    ...(appearance.iconColor !== initial.iconColor && { iconColor: appearance.iconColor }),
    ...(appearance.iconBackground !== initial.iconBackground && { iconBackground: appearance.iconBackground }),
  };
}
