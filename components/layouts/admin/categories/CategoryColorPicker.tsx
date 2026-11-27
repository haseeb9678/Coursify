import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  categoryPalettes,
  getCategoryColorContrast,
  isCategoryHexColor,
  normalizeCategoryColor,
  type CategoryColors,
} from "@/features/categories/category-colors";

interface CategoryColorPickerProps {
  colors: CategoryColors;
  recommended: CategoryColors;
  errors: Partial<Record<keyof CategoryColors, string>>;
  onChange: (field: keyof CategoryColors, value: string) => void;
  onPaletteChange: (colors: CategoryColors) => void;
}

export default function CategoryColorPicker({
  colors,
  recommended,
  errors,
  onChange,
  onPaletteChange,
}: CategoryColorPickerProps) {
  const contrast = getCategoryColorContrast(colors);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <ColorInput
          label="Icon foreground"
          value={colors.iconColor}
          fallback={recommended.iconColor}
          error={errors.iconColor}
          onChange={(value) => onChange("iconColor", value)}
        />
        <ColorInput
          label="Icon background"
          value={colors.iconBackground}
          fallback={recommended.iconBackground}
          error={errors.iconBackground}
          onChange={(value) => onChange("iconBackground", value)}
        />
      </div>
      {contrast !== null && contrast < 3 && (
        <p role="status" className="rounded-md border border-brand-border px-2 py-1.5 text-xs text-brand-text">
          Low icon contrast ({contrast.toFixed(2)}:1). Aim for at least 3:1.
        </p>
      )}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Color palettes">
        {Object.entries(categoryPalettes).map(([name, palette]) => (
          <Button
            key={name}
            type="button"
            size="sm"
            variant="outline"
            aria-pressed={
              palette.iconColor === colors.iconColor.toUpperCase() &&
              palette.iconBackground === colors.iconBackground.toUpperCase()
            }
            className="capitalize aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary"
            onClick={() => onPaletteChange(palette)}
          >
            <span
              aria-hidden="true"
              className="size-3 rounded-full ring-1 ring-border"
              style={{ backgroundColor: palette.iconColor }}
            />
            {name}
          </Button>
        ))}
      </div>
      <Button type="button" size="sm" variant="outline" onClick={() => onPaletteChange(recommended)}>
        Reset to recommended colors
      </Button>
    </div>
  );
}

function ColorInput({
  label,
  value,
  fallback,
  error,
  onChange,
}: {
  label: string;
  value: string;
  fallback: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const id = useId();

  return (
    <div className="min-w-0 space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-brand-text">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`Choose ${label.toLowerCase()} color`}
          className="size-9 shrink-0 cursor-pointer rounded-md border border-brand-border bg-background p-1 focus-visible:ring-2 focus-visible:ring-ring"
          value={isCategoryHexColor(value) ? value.toLowerCase() : fallback.toLowerCase()}
          onChange={(event) => onChange(normalizeCategoryColor(event.target.value))}
        />
        <Input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          value={value}
          placeholder="#2563EB"
          autoComplete="off"
          spellCheck={false}
          onChange={(event) => onChange(normalizeCategoryColor(event.target.value))}
        />
      </div>
      {error && <p id={`${id}-error`} role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
