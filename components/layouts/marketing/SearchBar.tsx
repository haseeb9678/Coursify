
import { Search } from "lucide-react";

const SearchBar = () => {
  return (
    <form
      action="/courses"
      method="GET"
      className="flex h-11 w-full max-w-xl items-center gap-2 rounded-full border border-brand-border bg-brand-page-secondary p-1.5 pl-4 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10"
    >
      <input
        type="search"
        name="q"
        placeholder="What do you want to learn?"
        aria-label="Search courses"
        className="min-w-0 flex-1 border-none bg-transparent text-sm text-brand-text outline-none placeholder:text-brand-text-muted"
      />

      <button
        type="submit"
        aria-label="Search courses"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-brand-primary-hover"
      >
        <Search size={16} />
      </button>
    </form>
  );
};

export default SearchBar;
