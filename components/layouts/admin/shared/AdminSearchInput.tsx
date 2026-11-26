import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AdminSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}

export default function AdminSearchInput({
  value,
  onChange,
  placeholder,
  label,
}: AdminSearchInputProps) {
  return (
    <div className="relative min-w-0 flex-1 sm:max-w-sm">
      <Search
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-brand-text-muted"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="h-10 border-brand-border bg-background pl-9 pr-9 text-sm"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={`Clear ${label.toLowerCase()}`}
          className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-brand-text-muted hover:bg-muted hover:text-brand-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
