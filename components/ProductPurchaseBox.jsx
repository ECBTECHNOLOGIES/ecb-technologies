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
    () =>
      product.attributes?.filter(
        (attr) => attr.variation && !/warranty/i.test(attr.name)
      ) ?? [],
    [product.attributes]
  );

  const [selected, setSelected] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Auto-select a valid combination of options (preferring "Brand New" for
  // Condition) so Add to Cart works immediately. Customers can still change
  // any option via the buttons below.
  useEffect(() => {
    if (!variationAttributes.length || !variations.length) return;

    setSelected((prev) => {
      if (Object.keys(prev).length > 0) return prev;

      const brandNewVariation = variations.find((variation) =>
        variation.attributes.some(
          (attr) => /condition/i.test(attr.name) && /brand new/i.test(attr.option)
        )
      );
      const defaultVariation = brandNewVariation ?? variations[0];

      const defaults = {};
      for (const attr of variationAttributes) {
        const match = defaultVariation.attributes.find(
          (vAttr) => vAttr.name.toLowerCase() === attr.name.toLowerCase()
        );
        defaults[attr.name] = match?.option ?? attr.options[0];
      }
      return defaults;
    });
  }, [variationAttributes, variations]);

  const matchedVariation = useMemo(() => {
    if (!isVariable) return null;
    if (variationAttributes.some((attr) => !selected[attr.name])) return null;

    return variations.find((variation) =>
      variationAttributes.every((attr) => {
        const variationAttr = variation.attributes.find(
          (vAttr) => vAttr.name.toLowerCase() === attr.name.toLowerCase()
        );
        return variationAttr?.option === selected[attr.name];
      })
    );
  }, [isVariable, variationAttributes, selected, variations]);

  const conditionAttr = variationAttributes.find((attr) => /condition/i.test(attr.name));
  const selectedCondition = conditionAttr ? selected[conditionAttr.name] : null;

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
      <div className="flex items-center gap-2">
        <span className="text-3xl font-bold text-brand-blue">{priceDisplay()}</span>
        {selectedCondition && (
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold uppercase text-gray-600">
            {selectedCondition}
          </span>
        )}
      </div>

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
        className="flex w-full items-center justify-center rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
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
            className="block w-full rounded-lg border-2 border-brand-green px-4 py-2 text-sm font-semibold text-brand-green transition-colors hover:bg-brand-green hover:text-white"
          >
            Proceed to Checkout
          </Link>
          <Link
            href="/products"
            className="block text-sm font-medium text-brand-blue hover:underline"
          >
            ← Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
}
