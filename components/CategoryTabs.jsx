"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { decodeEntities } from "@/lib/utils";

export default function CategoryTabs({ categories, activeCategoryId, className = "" }) {
  const activeRef = useRef(null);

  useEffect(() => {
    const el = activeRef.current;
    const container = el?.parentElement;
    if (!el || !container) return;

    container.scrollTo({
      left: el.offsetLeft - container.clientWidth / 2 + el.offsetWidth / 2,
      behavior: "smooth",
    });
  }, [activeCategoryId]);

  return (
    <div className={`no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 py-1 lg:mx-0 lg:flex-wrap lg:px-0 ${className}`}>
      {categories.map((category) => {
        const isActive = category.id
          ? activeCategoryId === String(category.id)
          : !activeCategoryId;
        return (
          <Link
            key={category.id || "all"}
            ref={isActive ? activeRef : null}
            href={category.id ? `/products?category=${category.id}` : "/products"}
            aria-current={isActive ? "page" : undefined}
            className={`chip shrink-0 ${isActive ? "chip-active" : ""}`}
          >
            {decodeEntities(category.name)}
          </Link>
        );
      })}
    </div>
  );
}
