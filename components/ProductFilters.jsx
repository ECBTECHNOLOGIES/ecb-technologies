"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ChevronDown, X } from "lucide-react";

const SORT_OPTIONS = [
  { value: "date-desc", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "popularity-desc", label: "Most popular" },
];

// One quiet toolbar row: sort and price. Categories live in the chip row above.
export default function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") ?? "");
  const [priceOpen, setPriceOpen] = useState(false);

  const currentSort = `${searchParams.get("orderby") ?? "date"}-${searchParams.get("order") ?? "desc"}`;
  const hasPriceFilter = Boolean(searchParams.get("min_price") || searchParams.get("max_price"));

  function updateParams(updates) {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  function handlePriceSubmit(e) {
    e.preventDefault();
    updateParams({ min_price: minPrice, max_price: maxPrice });
    setPriceOpen(false);
  }

  function clearPrice() {
    setMinPrice("");
    setMaxPrice("");
    updateParams({ min_price: null, max_price: null });
  }

  function handleSortChange(e) {
    const [orderby, order] = e.target.value.split("-");
    updateParams({ orderby, order });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {hasPriceFilter && (
          <button type="button" onClick={clearPrice} className="chip chip-active gap-1.5">
            KSh {searchParams.get("min_price") || "0"} – {searchParams.get("max_price") || "any"}
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setPriceOpen((open) => !open)}
          aria-expanded={priceOpen}
          className="chip gap-1"
        >
          Price
          <ChevronDown className={`h-4 w-4 transition-transform ${priceOpen ? "rotate-180" : ""}`} />
        </button>

        <label className="relative">
          <span className="sr-only">Sort by</span>
          <select
            value={currentSort}
            onChange={handleSortChange}
            className="chip cursor-pointer appearance-none pr-9"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-48" />
        </label>
      </div>

      {priceOpen && (
        <form
          onSubmit={handlePriceSubmit}
          className="ml-auto mt-4 flex max-w-md items-end gap-2"
        >
          <label className="flex-1">
            <span className="field-label">Min (KSh)</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="field"
            />
          </label>
          <label className="flex-1">
            <span className="field-label">Max (KSh)</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="field"
            />
          </label>
          <button type="submit" className="btn-primary">
            Apply
          </button>
        </form>
      )}
    </div>
  );
}
