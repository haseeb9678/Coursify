
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { LucideIcon } from "lucide-react";

export interface CustomSelectOption {
  label: string;
  value: string;
  icon?: LucideIcon;
  disabled?: boolean;
}

interface CustomSelectProps {
  value: string;
  onValueChange: (value: string | null) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  contentClassName?: string;
  width?: string;
  disabled?: boolean;
}

export default function CustomSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  ariaLabel = "Select an option",
  className = "",
  contentClassName = "",
  width = "w-[180px]",
  disabled = false,
}: CustomSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className={`h-10 ${width} rounded-xl border-border bg-background text-xs font-semibold shadow-none transition-all hover:border-primary/40 focus:ring-2 focus:ring-primary/15 ${className}`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent
        align="end"
        className={`min-w-[190px] rounded-xl border-border p-1.5 shadow-xl ${contentClassName}`}
      >
        {options.map((option) => {
          const Icon = option.icon;

          return (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className="rounded-lg py-2.5 text-xs font-medium focus:bg-primary/10 focus:text-primary"
            >
              <span className="flex items-center gap-2">
                {Icon && (
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}

                {option.label}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
