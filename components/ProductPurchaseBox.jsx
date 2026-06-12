"use client";

import Link from "next/link";
import { CheckCircle2, Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";

export default function ProductPurchaseBox({ product, variations = [] }) {
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isVariable = product.type === "variable" && variations.length > 0;
  const variationAttributes = useMemo(
    () => product.attributes?.filter((attr) => attr.variation) ?? [],
    [product.attributes]
  );

  const [selected, setSelected] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const matchedVariation = useMemo(() => {
    if (!isVariable) return null;
    if (variationAttributes.some((attr) => !selected[attr.name])) return null;

    return variations.find((variation) =>
      variation.attributes.every((attr) => {
        const expected = Object.entries(selected).find(
          ([name]) => name.toLowerCase() === attr.name.toLowerCase()
        )?.[1];
        return expected === attr.option;
      })
    );
  }, [isVariable, variationAttributes, selected, variations]);

  const activeStockStatus = matchedVariation?.stock_status ?? product.stock_status;
  const inStock = activeStockStatus === "instock";

  const canAddToCart = isVariable
    ? Boolean(matchedVariation) && inStock
    : inStock;

  const variationId = matchedVariation?.id ?? null;
  const cartItem = mounted
    ? items.find((item) => item.id === product.id && item.variationId === variationId)
    : null;

  function handleSelectAttribute(name, option) {
    setSelected((prev) => ({ ...prev, [name]: option }));
    setAdded(false);
  }

  function handleAddToCart() {
    addItem(product, quantity, matchedVariation ?? null);
    setAdded(true);
  }

  function priceDisplay() {
    if (matchedVariation) {
      return formatPrice(matchedVariation.price);
    }
    if (product.on_sale && product.regular_price) {
      return (
        <>
          <span className="text-brand-red">{formatPrice(product.price)}</span>{" "}
          <span className="text-lg text-gray-400 line-through">
            {formatPrice(product.regular_price)}
          </span>
        </>
      );
    }
    return formatPrice(product.price);
  }

  return (
    <div className="space-y-4">
      <div className="text-3xl font-bold text-brand-blue">{priceDisplay()}</div>

      <div>
        {inStock ? (
          <span className="inline-block rounded bg-green-100 px-2 py-1 text-xs font-bold uppercase text-green-700">
            In Stock
          </span>
        ) : (
          <span className="inline-block rounded bg-red-100 px-2 py-1 text-xs font-bold uppercase text-red-700">
            Out of Stock
          </span>
        )}
      </div>

      {isVariable &&
        variationAttributes.map((attr) => (
          <div key={attr.id ?? attr.name}>
            <label className="text-sm font-semibold text-gray-900">{attr.name}</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {attr.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelectAttribute(attr.name, option)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    selected[attr.name] === option
                      ? "border-brand-green bg-brand-green text-white"
                      : "border-gray-300 text-gray-700 hover:border-brand-blue"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}

      <div>
        <label className="text-sm font-semibold text-gray-900">Quantity</label>
        <div className="mt-2 flex w-fit items-center rounded-md border border-gray-300">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="p-2 text-gray-600 hover:text-brand-blue"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-medium">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="p-2 text-gray-600 hover:text-brand-blue"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {cartItem && !added && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-brand-green">
          <CheckCircle2 className="h-4 w-4" />
          Already in your cart (Qty: {cartItem.quantity})
        </div>
      )}

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!canAddToCart}
        className={`flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
          cartItem
            ? "bg-brand-blue text-white hover:bg-brand-blue-hover"
            : "bg-brand-green text-white hover:bg-green-700"
        }`}
      >
        {added
          ? "Added to Cart!"
          : isVariable && !matchedVariation
            ? "Select Options"
            : !inStock
              ? "Out of Stock"
              : cartItem
                ? "Add Another"
                : "Shop Now"}
      </button>

      {(added || cartItem) && (
        <div className="space-y-2 text-center">
          <Link
            href="/checkout"
            className="block w-full rounded-lg bg-yellow-400 px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-yellow-500"
          >
            Proceed to Checkout
          </Link>
          <Link
            href="/products"
            className="block text-sm font-medium text-brand-blue hover:underline"
          >
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
