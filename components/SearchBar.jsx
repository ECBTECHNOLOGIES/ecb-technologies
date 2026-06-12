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
        placeholder="Search for products..."
        className="w-full rounded-md border border-gray-200 bg-white py-2 pl-4 pr-12 text-sm text-gray-900 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-1 top-1 bottom-1 flex items-center justify-center rounded-md bg-brand-green px-3 text-white transition-colors hover:bg-green-700"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}
