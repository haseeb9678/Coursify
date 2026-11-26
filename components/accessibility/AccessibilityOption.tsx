"use client";

import { useId, type ComponentType, type SVGProps } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface AccessibilityOptionProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: () => void;
}

export default function AccessibilityOption({
  icon: Icon,
  title,
  description,
  checked,
  onCheckedChange,
}: AccessibilityOptionProps) {
  const id = useId();

  return (
    <div
      className={cn(
        "rounded-xl border p-[12px] transition-colors",
        checked
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-card",
      )}
    >
      <div className="flex min-w-0 items-center gap-[12px]">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-[36px] shrink-0 items-center justify-center rounded-lg",
            checked
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="size-[18px]" />
        </span>

        <p
          id={`${id}-label`}
          className="min-w-0 flex-1 text-sm font-semibold text-foreground"
        >
          {title}
        </p>

        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-labelledby={`${id}-label`}
          aria-describedby={`${id}-description`}
          onClick={onCheckedChange}
          className={cn(
            "relative inline-flex h-[24px] w-[44px] shrink-0 items-center rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            checked ? "bg-primary" : "bg-muted-foreground/35",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "flex size-[20px] items-center justify-center rounded-full bg-background shadow-sm transition-transform",
              checked ? "translate-x-[22px]" : "translate-x-[2px]",
            )}
          >
            {checked && (
              <Check className="size-3 text-primary" strokeWidth={2.5} />
            )}
          </span>
        </button>
      </div>

      <p
        id={`${id}-description`}
        className="mt-[8px] text-xs leading-relaxed text-muted-foreground"
      >
        {description}
      </p>
    </div>
  );
}
