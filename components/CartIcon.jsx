"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store";

export default function CartIcon() {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link
      href="/cart"
      aria-label="View cart"
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-80 transition-colors hover:text-ink"
    >
      <ShoppingBag className="h-5 w-5" strokeWidth={1.75} />
      {mounted && totalItems > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink px-1 text-[11px] font-semibold text-white">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
