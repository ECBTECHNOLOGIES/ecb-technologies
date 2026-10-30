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
          {formatPrice(product.price)}{" "}
          <span className="text-sm text-ink-48 line-through">
            {formatPrice(product.regular_price)}
          </span>
        </>
      );
    }
    return formatPrice(product.price);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full overflow-y-auto rounded-t-[18px] bg-white p-6 sm:max-w-md sm:rounded-[18px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="type-tagline line-clamp-2 text-ink">
            {decodeEntities(product.name)}
          </h3>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-parchment text-ink-80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-2 text-[17px] text-ink-80">
          {priceDisplay()}
          {selectedCondition && <span className="text-ink-48"> · {selectedCondition}</span>}
        </p>

        {loading ? (
          <p className="type-caption mt-6 text-ink-48">Loading options…</p>
        ) : (
          <div className="mt-6 space-y-6">
            {variationAttributes.map((attr) => (
              <div key={attr.id ?? attr.name}>
                <p className="text-[15px] font-semibold text-ink">{attr.name}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {attr.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSelectAttribute(attr.name, option)}
                      aria-pressed={selected[attr.name] === option}
                      className={`chip ${selected[attr.name] === option ? "chip-active" : ""}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {variationAttributes.length > 0 && allSelected && !matchedVariation && (
              <p className="type-caption text-danger">This combination is unavailable.</p>
            )}

            {!inStock && (
              <p className="type-caption text-danger">Out of stock</p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canAddToCart || loading}
          className="btn-primary mt-8 w-full"
        >
          {added ? "Added" : !inStock ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    </div>,
    document.body
  );
}
