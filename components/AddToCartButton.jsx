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
      className={`flex min-w-[100px] items-center justify-center rounded-md bg-brand-green px-4 py-[7px] text-xs font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {added ? "Added!" : "Shop Now"}
    </button>
  );
}
