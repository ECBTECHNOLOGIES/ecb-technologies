"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { decodeEntities } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "date-desc", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popularity-desc", label: "Most Popular" },
];

export default function ProductFilters({ categories }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") ?? "");

  const activeCategory = searchParams.get("category") ?? "";
  const currentSort = `${searchParams.get("orderby") ?? "date"}-${searchParams.get("order") ?? "desc"}`;

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
  }

  function handleSortChange(e) {
    const [orderby, order] = e.target.value.split("-");
    updateParams({ orderby, order });
  }

  function categoryHref(categoryId) {
    const params = new URLSearchParams(searchParams);
    if (categoryId) {
      params.set("category", String(categoryId));
    } else {
      params.delete("category");
    }
    params.delete("page");
    return `/products?${params.toString()}`;
  }

  return (
    <aside className="w-full shrink-0 space-y-6 rounded-lg bg-white p-4 shadow-sm lg:w-64">
      <div>
        <label htmlFor="sort" className="text-sm font-semibold text-gray-900">
          Sort by
        </label>
        <select
          id="sort"
          value={currentSort}
          onChange={handleSortChange}
          className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden sm:block">
        <h3 className="text-sm font-semibold text-gray-900">Categories</h3>
        <ul className="mt-2 space-y-1">
          <li>
            <Link
              href={categoryHref(null)}
              className={`block rounded px-2 py-1 text-sm ${
                !activeCategory
                  ? "bg-[#5B8DEF] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              All Products
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={categoryHref(category.id)}
                className={`block rounded px-2 py-1 text-sm ${
                  activeCategory === String(category.id)
                    ? "bg-[#5B8DEF] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {decodeEntities(category.name)}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handlePriceSubmit}>
        <h3 className="text-sm font-semibold text-gray-900">Price (KSh)</h3>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </div>
        <button
          type="submit"
          className="mt-2 w-full rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
        >
          Apply
        </button>
      </form>
    </aside>
  );
}
