"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useCartStore } from "@/lib/store";
import { decodeEntities, formatPrice } from "@/lib/utils";

export default function QuickSelectModal({ product, onClose }) {
  const addItem = useCartStore((state) => state.addItem);
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({});
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetch(`/api/products/${product.id}/variations`)
      .then((res) => res.json())
      .then((data) => {
        if (active) setVariations(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setVariations([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [product.id]);

  const variationAttributes = useMemo(
    () =>
      product.attributes?.filter(
        (attr) => attr.variation && !/warranty/i.test(attr.name)
      ) ?? [],
    [product.attributes]
  );

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
    if (variationAttributes.some((attr) => !selected[attr.name])) return null;

    return variations.find((variation) =>
      variationAttributes.every((attr) => {
        const variationAttr = variation.attributes.find(
          (vAttr) => vAttr.name.toLowerCase() === attr.name.toLowerCase()
        );
        return variationAttr?.option === selected[attr.name];
      })
    );
  }, [variationAttributes, selected, variations]);

  const conditionAttr = variationAttributes.find((attr) => /condition/i.test(attr.name));
  const selectedCondition = conditionAttr ? selected[conditionAttr.name] : null;

  const activeStockStatus = matchedVariation?.stock_status ?? product.stock_status;
  const inStock = activeStockStatus === "instock";
  const canAddToCart = Boolean(matchedVariation) && inStock;
  const allSelected = variationAttributes.every((attr) => selected[attr.name]);

  function handleSelectAttribute(name, option) {
    setSelected((prev) => ({ ...prev, [name]: option }));
    setAdded(false);
  }

  function handleAddToCart() {
    addItem(product, 1, matchedVariation);
    setAdded(true);
    setTimeout(onClose, 800);
  }

  function priceDisplay() {
    if (matchedVariation) return formatPrice(matchedVariation.price);
    if (product.on_sale && product.regular_price) {
      return (
        <>
          <span className="text-brand-red">{formatPrice(product.price)}</span>{" "}
          <span className="text-sm text-gray-400 line-through">
            {formatPrice(product.regular_price)}
          </span>
        </>
      );
    }
    return formatPrice(product.price);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-lg bg-white p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-base font-semibold text-gray-900">
            {decodeEntities(product.name)}
          </h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-1 flex items-center gap-2">
          <span className="font-heading text-lg font-bold text-brand-blue">{priceDisplay()}</span>
          {selectedCondition && (
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold uppercase text-gray-600">
              {selectedCondition}
            </span>
          )}
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-gray-500">Loading options...</p>
        ) : (
          <div className="mt-4 space-y-4">
            {variationAttributes.map((attr) => (
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

            {variationAttributes.length > 0 && allSelected && !matchedVariation && (
              <p className="text-xs text-red-600">This combination is unavailable.</p>
            )}

            {!inStock && (
              <span className="inline-block rounded bg-red-100 px-2 py-1 text-xs font-bold uppercase text-red-700">
                Out of Stock
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canAddToCart || loading}
          className="mt-5 flex w-full items-center justify-center rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {added ? "Added!" : !inStock ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>,
    document.body
  );
}
