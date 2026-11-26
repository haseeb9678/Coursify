"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import type { DashboardSearchBarProps } from "@/features/dashboard/types/dashboard.types";

export default function DashboardSearchBar({
  placeholder,
  searchRoute,
}: DashboardSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = query.trim();
    if (!value) return;

    router.push(
      `${searchRoute}?search=${encodeURIComponent(value)}`,
    );
  };

  return (
    <form
      onSubmit={handleSearch}
      role="search"
      className="group flex h-10 w-full items-center gap-2.5 rounded-lg border border-brand-border bg-brand-page-secondary/60 px-3 transition-colors duration-200 focus-within:border-primary/40 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/10"
    >
      <Search
        size={17}
        strokeWidth={1.8}
        className="shrink-0 text-brand-text-muted transition-colors group-focus-within:text-primary"
      />

      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-brand-text outline-none placeholder:text-brand-text-muted/80 [&::-webkit-search-cancel-button]:hidden"
      />

      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          aria-label="Clear search"
          className="cursor-pointer text-brand-text-muted transition-colors hover:text-brand-text"
        >
          <X size={15} />
        </button>
      )}
    </form>
  );
}
