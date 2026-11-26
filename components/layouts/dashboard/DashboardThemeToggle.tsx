"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function DashboardThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      title="Toggle color theme"
      className="relative flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-brand-text-muted transition-colors duration-200 hover:bg-brand-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <Sun
        size={20}
        strokeWidth={1.7}
        className="rotate-0 scale-100 transition-transform duration-300 dark:-rotate-90 dark:scale-0 motion-reduce:transition-none"
      />

      <Moon
        size={20}
        strokeWidth={1.7}
        className="absolute rotate-90 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100 motion-reduce:transition-none"
      />
    </button>
  );
}
