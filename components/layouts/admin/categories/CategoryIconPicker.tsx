"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminDialog from "@/components/layouts/admin/shared/AdminDialog";
import AdminFilterSelect from "@/components/layouts/admin/shared/AdminFilterSelect";
import {
  CategoryIcon,
  resolveCategoryIconName,
  type CategoryIconName,
} from "@/features/categories/category-icon-components";
import {
  categoryIconGroups,
  searchCategoryIcons,
} from "@/features/categories/category-icon-library";

const allGroups = "all";
const groupOptions = [
  { label: "All groups", value: allGroups },
  ...categoryIconGroups.map(({ label }) => ({ label, value: label })),
];

interface CategoryIconPickerProps {
  value: string;
  onSelect: (name: CategoryIconName) => void;
  onClose: () => void;
}

export default function CategoryIconPicker({
  value,
  onSelect,
  onClose,
}: CategoryIconPickerProps) {
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState(allGroups);
  const [selected, setSelected] = useState<CategoryIconName>();
  const searchInput = useRef<HTMLInputElement>(null);
  const deferredSearch = useDeferredValue(search);
  const matches = useMemo(
    () => searchCategoryIcons(deferredSearch, group === allGroups ? "" : group),
    [deferredSearch, group],
  );
  const selectedName = selected ?? resolveCategoryIconName(value);

  useEffect(() => {
    searchInput.current?.focus();
  }, []);

  return (
    <AdminDialog
      open
      onOpenChange={(open) => { if (!open) onClose(); }}
      title="Category icon library"
      size="lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            type="button"
            disabled={!selectedName}
            onClick={() => {
              if (selected) onSelect(selected);
              onClose();
            }}
          >
            Select icon
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="flex gap-2">
            <Input
              ref={searchInput}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search category icons"
              placeholder="Search icons"
              className="h-10"
              type="search"
            />
            {search && (
              <Button
                type="button"
                variant="outline"
                className="h-10"
                onClick={() => {
                  setSearch("");
                  searchInput.current?.focus();
                }}
              >
                Clear
              </Button>
            )}
          </div>
          <AdminFilterSelect label="Icon group" value={group} options={groupOptions} onChange={setGroup} />
        </div>

        <p role="status" className="sr-only">
          {matches.reduce((count, { icons }) => count + icons.length, 0)} icons found
        </p>
        <div
          className="max-h-[min(48dvh,25rem)] space-y-4 overflow-y-auto overscroll-contain p-1.5"
          aria-busy={search !== deferredSearch}
        >
          {matches.length === 0 && (
            <p className="rounded-lg border border-dashed border-brand-border p-6 text-center text-sm text-brand-text-muted">
              No icons match your search.
            </p>
          )}
          {matches.map(({ label, icons }) => (
            <section key={label} aria-label={label}>
              <h3 className="mb-2 text-xs font-semibold text-brand-text">{label}</h3>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {icons.map(({ name, label: iconLabel }) => {
                  const isSelected = name === selectedName;
                  return (
                    <Button
                      key={name}
                      type="button"
                      variant="outline"
                      className="relative h-auto min-h-16 min-w-0 flex-col gap-1 whitespace-normal px-1.5 py-2 text-center text-xs leading-tight aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary"
                      aria-pressed={isSelected}
                      onClick={() => setSelected(name)}
                    >
                      <CategoryIcon name={name} aria-hidden="true" className="size-5" />
                      <span className="wrap-anywhere">{iconLabel}</span>
                      {isSelected && (
                        <Check aria-hidden="true" className="absolute top-1 right-1 size-3" />
                      )}
                    </Button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </AdminDialog>
  );
}
