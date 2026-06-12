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
      className={`flex items-center justify-center rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {added ? "Added!" : "Shop Now"}
    </button>
  );
}
