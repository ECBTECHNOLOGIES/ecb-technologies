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
      className={`btn-primary btn-sm ${className}`}
    >
      {added ? "Added" : "Add to cart"}
    </button>
  );
}
