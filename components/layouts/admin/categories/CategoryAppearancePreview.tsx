import { CategoryIcon } from "@/features/categories/category-icon-components";
import { isCategoryHexColor, type CategoryColors } from "@/features/categories/category-colors";

interface CategoryAppearancePreviewProps {
  name: string;
  description: string;
  iconKey: string;
  colors: CategoryColors;
  courseCount?: number;
}

export default function CategoryAppearancePreview({
  name,
  description,
  iconKey,
  colors,
  courseCount,
}: CategoryAppearancePreviewProps) {
  return (
    <section aria-label="Category preview" className="space-y-2">
      <h3 className="text-xs font-medium text-brand-text">Category preview</h3>
      <div className="relative flex min-w-0 items-center gap-4 overflow-hidden rounded-xl border border-brand-border bg-card p-4 sm:p-5">
        <CategoryIcon
          name={iconKey}
          aria-hidden="true"
          strokeWidth={1.2}
          className="pointer-events-none absolute -right-5 -bottom-6 size-28 -rotate-12 text-primary opacity-[0.07]"
          style={{ color: isCategoryHexColor(colors.iconColor) ? colors.iconColor : undefined }}
        />
        <span
          className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-primary shadow-sm ring-1 ring-black/5 sm:size-14"
          style={{
            color: isCategoryHexColor(colors.iconColor) ? colors.iconColor : undefined,
            backgroundColor: isCategoryHexColor(colors.iconBackground) ? colors.iconBackground : undefined,
          }}
        >
          <CategoryIcon name={iconKey} size={25} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <div className="relative min-w-0 flex-1">
          <p className="truncate text-base font-bold text-brand-text">{name.trim() || "Category name"}</p>
          {description.trim() && (
            <p className="mt-0.5 truncate text-sm text-brand-text-muted">{description}</p>
          )}
          {courseCount !== undefined && (
            <p className="mt-2 text-xs font-semibold text-brand-primary">
              {courseCount.toLocaleString()} {courseCount === 1 ? "course" : "courses"}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
