"use client";

import { Search, X } from "lucide-react";
import { usePathname } from "next/navigation";
import SearchBar from "./SearchBar";
import { useMobileSearch } from "./MobileSearchContext";

export function MobileSearchButton() {
  const pathname = usePathname();
  const { open, setOpen } = useMobileSearch();

  if (pathname !== "/" || open) return null;

  return (
    <button
      type="button"
      aria-label="Search"
      onClick={() => setOpen(true)}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink md:hidden"
    >
      <Search className="h-5 w-5" strokeWidth={1.75} />
    </button>
  );
}

export function MobileSearchPanel() {
  const pathname = usePathname();
  const { open, setOpen } = useMobileSearch();

  if (pathname === "/" && !open) return null;

  return (
    <div className="flex flex-1 items-center gap-2">
      <div className="flex-1">
        <SearchBar />
      </div>
      {pathname === "/" && open && (
        <button
          type="button"
          aria-label="Close search"
          onClick={() => setOpen(false)}
          className="flex h-9 w-9 shrink-0 items-center justify-center text-ink-48"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export function MobileSecondRow({ children }) {
  const pathname = usePathname();
  const { open } = useMobileSearch();

  if (pathname === "/" && !open) return null;

  return (
    <div className="flex items-center gap-1 px-4 pb-2.5 md:hidden">{children}</div>
  );
}
