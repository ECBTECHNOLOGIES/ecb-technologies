"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { decodeEntities } from "@/lib/utils";

export default function CategoryTabs({ categories, activeCategoryId, className = "" }) {
  const activeRef = useRef(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeCategoryId]);

  return (
    <div className={`flex gap-2 overflow-x-auto pb-1 ${className}`}>
      {categories.map((category) => {
        const isActive = category.id
          ? activeCategoryId === String(category.id)
          : !activeCategoryId;
        return (
          <Link
            key={category.id || "all"}
            ref={isActive ? activeRef : null}
            href={category.id ? `/products?category=${category.id}` : "/products"}
            className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold no-underline transition-colors ${
              isActive
                ? "border-brand-blue bg-brand-blue text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-brand-blue hover:bg-brand-blue hover:text-white"
            }`}
          >
            {decodeEntities(category.name)}
          </Link>
        );
      })}
    </div>
  );
}
