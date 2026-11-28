"use client";

import {
  SearchableSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const triggerClassName = "h-10 min-w-32 max-w-[min(100%,24rem)] rounded-lg border-brand-border bg-background px-3 text-xs font-medium text-brand-text transition-colors hover:border-primary/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40";

interface AdminFilterSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
  searchable?: boolean;
}

export default function AdminFilterSelect({
  label,
  value,
  options,
  onChange,
  disabled = false,
  searchable = options.length >= 8,
}: AdminFilterSelectProps) {
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? value;

  if (searchable) {
    return <SearchableSelect aria-label={label} value={value} options={options} onValueChange={onChange}
      placeholder={selectedLabel} disabled={disabled} className={triggerClassName} />;
  }

  return (
    <Select
      value={value}
      disabled={disabled}
      onValueChange={(nextValue) => {
        if (nextValue !== null) onChange(nextValue);
      }}
    >
      <SelectTrigger
        aria-label={label}
        className={triggerClassName}
      >
        <SelectValue title={selectedLabel}>{selectedLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent
        align="start"
        className="min-w-40 rounded-xl border-brand-border bg-popover p-1.5 text-popover-foreground shadow-xl"
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="min-h-10 rounded-lg px-3 py-2.5 text-sm font-medium data-[highlighted]:bg-accent data-[selected]:bg-primary/10 data-[selected]:text-primary"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
