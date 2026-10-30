"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import shippingRates from "@/lib/shipping-rates.json";
import { ADDRESS_LINE } from "@/lib/business";

export const PICKUP_KEY = "__pickup__";

const PICKUP_OPTION = {
  key: PICKUP_KEY,
  label: `Store Pickup — ${ADDRESS_LINE}`,
  cost: 0,
  zone: null,
  surcharge: null,
  isPickup: true,
};

const TOWN_OPTIONS = Object.entries(shippingRates)
  .map(([town, rate]) => ({
    key: town,
    label: town,
    cost: rate.cost,
    zone: rate.zone,
    surcharge: rate.surcharge,
    isPickup: false,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const ALL_OPTIONS = [PICKUP_OPTION, ...TOWN_OPTIONS];

// Used by the checkout page to look up cost/surcharge for both town
// selections and the pickup radio option (PICKUP_KEY), so this includes
// PICKUP_OPTION even though the dropdown below only ever lists towns.
export function getShippingOption(key) {
  return ALL_OPTIONS.find((option) => option.key === key) ?? null;
}

export default function TownSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const listboxId = useId();

  const selected = TOWN_OPTIONS.find((option) => option.key === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TOWN_OPTIONS;
    return TOWN_OPTIONS.filter((option) => option.label.toLowerCase().includes(q));
  }, [query]);

  function handleSelect(option) {
    onChange(option.key);
    setQuery("");
    setOpen(false);
  }

  // Close on outside taps/clicks. We deliberately don't rely on the input's
  // onBlur + e.relatedTarget here: iOS Safari doesn't reliably set
  // relatedTarget on touch-triggered blur, so the list would close (blur)
  // before the tap's click on an option had a chance to register, making
  // options look unclickable on iPhone.
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <label className="block" htmlFor={`${listboxId}-input`}>
        <span className="field-label">Delivery town</span>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-48" />
          <input
            id={`${listboxId}-input`}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            autoComplete="off"
            value={open ? query : selected?.label ?? ""}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              setQuery("");
              setOpen(true);
            }}
            placeholder="Search for your town..."
            className="field pl-10 pr-10"
          />
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-48" />
        </div>
      </label>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-[14px] border border-hairline bg-white py-1.5 shadow-[0_10px_30px_rgb(0_0_0/0.08)]"
        >
          {filtered.length === 0 && (
            <li className="type-caption px-4 py-2.5 text-ink-48">No matching towns</li>
          )}
          {filtered.map((option) => (
            <li key={option.key} role="option" aria-selected={option.key === value}>
              <button
                type="button"
                onClick={() => handleSelect(option)}
                className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-[15px] text-ink hover:bg-parchment"
              >
                <span className="flex items-center gap-2 truncate">
                  {option.key === value && (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  )}
                  <span className={option.isPickup ? "font-semibold" : ""}>
                    {option.label}
                  </span>
                </span>
                <span className="shrink-0 text-ink-48">
                  {formatPrice(option.cost)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
