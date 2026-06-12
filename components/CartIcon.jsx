"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
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
      className="relative flex items-center justify-center p-2 text-brand-blue transition-colors hover:text-[#2651AB] active:text-[#5B8DEF]"
    >
      <ShoppingCart className="h-6 w-6" />
      {mounted && totalItems > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-red px-1 text-xs font-bold text-white">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
