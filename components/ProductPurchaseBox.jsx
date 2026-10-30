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
          {formatPrice(product.price)}{" "}
          <span className="text-[17px] font-normal text-ink-48 line-through">
            {formatPrice(product.regular_price)}
          </span>
        </>
      );
    }
    return formatPrice(product.price);
  }

  return (
    <div>
      <p className="text-[24px] font-semibold tracking-tight text-ink">{priceDisplay()}</p>
      <p className={`type-caption mt-1 ${inStock ? "text-success" : "text-danger"}`}>
        {inStock ? "In stock" : "Out of stock"}
        {selectedCondition && <span className="text-ink-48"> · {selectedCondition}</span>}
      </p>

      {isVariable &&
        variationAttributes.map((attr) => (
          <fieldset key={attr.id ?? attr.name} className="mt-8">
            <legend className="text-[17px] font-semibold text-ink">{attr.name}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {attr.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelectAttribute(attr.name, option)}
                  aria-pressed={selected[attr.name] === option}
                  className={`chip px-5 py-3 ${selected[attr.name] === option ? "chip-active" : ""}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>
        ))}

      <div className="mt-8 flex items-center gap-3">
        <div className="flex h-12 items-center rounded-full bg-parchment">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-12 w-12 items-center justify-center text-ink-80 disabled:opacity-30"
            disabled={quantity === 1}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-6 text-center text-[17px]" aria-live="polite">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="flex h-12 w-12 items-center justify-center text-ink-80"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canAddToCart}
          className="btn-primary h-12 flex-1"
        >
          {added
            ? "Added to cart"
            : isVariable && !matchedVariation
              ? "Choose options"
              : !inStock
                ? "Out of stock"
                : cartItem
                  ? "Add another"
                  : "Add to cart"}
        </button>
      </div>

      {cartItem && !added && (
        <p className="type-caption mt-3 flex items-center gap-1.5 text-ink-48">
          <CheckCircle2 className="h-4 w-4 text-success" />
          {cartItem.quantity} already in your cart
        </p>
      )}

      {(added || cartItem) && (
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/checkout" className="btn-secondary">
            Check out
          </Link>
          <Link href="/products" className="link text-[17px]">
            Continue shopping
          </Link>
        </div>
      )}
    </div>
  );
}
