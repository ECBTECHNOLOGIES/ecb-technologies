"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SearchBar({ className = "" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") ?? "");

  function handleSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    router.push(`/products?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products"
        aria-label="Search products"
        className="h-9 w-full rounded-full bg-parchment pl-9 pr-4 text-base text-ink placeholder:text-ink-48 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-focus/40 sm:text-[14px]"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center text-ink-48"
      >
        <Search className="h-4 w-4" strokeWidth={2} />
      </button>
    </form>
  );
}
