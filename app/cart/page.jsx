"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store";
import { BLUR_DATA_URL, formatPrice } from "@/lib/utils";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="px-6 py-24 text-center sm:py-32">
        <h1 className="type-hero text-ink">Your cart is empty.</h1>
        <p className="type-lead mt-4 text-ink-80">Find something you&apos;ll love.</p>
        <Link href="/products" className="btn-primary mt-8">
          Continue shopping
        </Link>
      </div>
    );
  }

  const total = getTotalPrice();

  return (
    <div className="mx-auto max-w-[980px] px-6 pb-24 pt-10 sm:pt-14">
      <h1 className="type-hero text-ink">Your cart total is {formatPrice(total)}.</h1>
      <p className="type-lead mt-3 text-ink-80">Free pickup in store. Delivery across Kenya.</p>
      <div className="mt-8">
        <Link href="/checkout" className="btn-primary w-full sm:w-auto sm:min-w-60">
          Check out
        </Link>
      </div>

      <ul className="mt-12 divide-y divide-hairline border-y border-hairline">
        {items.map((item) => (
          <li
            key={`${item.id}-${item.variationId ?? "default"}`}
            className="flex gap-5 py-8 sm:gap-8"
          >
            <Link
              href={`/products/${item.slug}`}
              className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[18px] bg-parchment sm:h-36 sm:w-36"
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="144px"
                  className="object-contain p-3 sm:p-5"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                />
              ) : (
                <span className="type-fine flex h-full w-full items-center justify-center text-ink-48">
                  No image
                </span>
              )}
            </Link>

            <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <Link href={`/products/${item.slug}`} className="type-tagline text-ink hover:underline">
                  {item.name}
                </Link>
                <p className="type-caption mt-1 text-ink-48">{formatPrice(item.price)} each</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 sm:flex-col sm:flex-nowrap sm:items-end">
                <p className="type-tagline text-ink">{formatPrice(item.price * item.quantity)}</p>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 items-center rounded-full bg-parchment">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.variationId, item.quantity - 1)
                      }
                      className="flex h-10 w-10 items-center justify-center text-ink-80"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-5 text-center text-[15px]">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.variationId, item.quantity + 1)
                      }
                      className="flex h-10 w-10 items-center justify-center text-ink-80"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id, item.variationId)}
                    className="link text-[15px]"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <dl className="ml-auto mt-8 max-w-sm space-y-3 text-[17px]">
        <div className="flex justify-between text-ink-80">
          <dt>Subtotal</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
        <div className="flex justify-between text-ink-80">
          <dt>Shipping</dt>
          <dd>Calculated at checkout</dd>
        </div>
        <div className="flex justify-between border-t border-hairline pt-4 text-[21px] font-semibold text-ink">
          <dt>Total</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
      <div className="mt-8 flex flex-col items-end gap-4">
        <Link href="/checkout" className="btn-primary w-full sm:w-auto sm:min-w-60">
          Check out
        </Link>
        <Link href="/products" className="link text-[17px]">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
