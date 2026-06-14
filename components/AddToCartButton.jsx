"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/store";

export default function AddToCartButton({
  product,
  variation = null,
  quantity = 1,
  className = "",
}) {
  const addItem = useCartStore((state) => state.addItem);
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem(product, quantity, variation);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center justify-center whitespace-nowrap rounded-md bg-brand-green px-3 py-[7px] text-[11px] font-bold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[100px] ${className}`}
    >
      {added ? "Added!" : "Shop Now"}
    </button>
  );
}
