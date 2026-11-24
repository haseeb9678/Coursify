
"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterOption } from "@/features/courses/types/catalog.types";

interface FilterGroupProps {
  title: string;
  options: FilterOption[];
  selected: string[];
  onChange: (value: string, checked: boolean) => void;
}

export default function FilterGroup({
  title,
  options,
  selected,
  onChange,
}: FilterGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-900"
      >
        {title}

        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? "" : "-rotate-90"
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pb-1 pt-1">
              {options.map((option) => (
                <label
                  key={option.label}
                  className="flex cursor-pointer items-center justify-between gap-3 text-sm text-gray-600 transition-colors hover:text-blue-600"
                >
                  <span className="flex items-center gap-2.5">
                    <Checkbox
                      checked={selected.includes(option.label)}
                      onCheckedChange={(checked) =>
                        onChange(option.label, checked === true)
                      }
                    />

                    <span>{option.label}</span>
                  </span>

                  {option.count !== undefined && (
                    <span className="text-xs text-gray-400">
                      ({option.count})
                    </span>
                  )}
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
