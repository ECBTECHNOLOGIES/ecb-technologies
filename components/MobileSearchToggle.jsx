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
      className="flex shrink-0 items-center justify-center p-2 text-brand-blue md:hidden"
    >
      <Search className="h-6 w-6" />
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
          className="flex shrink-0 items-center justify-center p-2 text-gray-500"
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
    <div className="flex items-center gap-2 px-4 pb-3 md:hidden">{children}</div>
  );
}
