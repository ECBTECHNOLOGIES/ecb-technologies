"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
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
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="mt-2 text-gray-500">
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg border-2 border-brand-green px-4 py-2 text-sm font-semibold text-brand-green hover:bg-brand-green hover:text-white"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.id}-${item.variationId ?? "default"}`}
              className="flex flex-wrap items-center gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-nowrap"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-50">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-contain p-1"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                    No image
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${item.slug}`}
                  className="text-sm font-medium text-gray-800 hover:text-brand-blue"
                >
                  {item.name}
                </Link>
                <p className="font-heading mt-1 text-sm font-semibold text-brand-green">
                  {formatPrice(item.price)}
                </p>
              </div>

              <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-start">
                <div className="flex items-center rounded-md border border-gray-300">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.id, item.variationId, item.quantity - 1)
                    }
                    className="p-2 text-gray-600 hover:text-brand-blue"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.id, item.variationId, item.quantity + 1)
                    }
                    className="p-2 text-gray-600 hover:text-brand-blue"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="font-heading text-right text-sm font-bold text-brand-green sm:w-24">
                  {formatPrice(item.price * item.quantity)}
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.id, item.variationId)}
                  aria-label="Remove item"
                  className="p-2 text-gray-400 transition-colors hover:text-brand-red"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full shrink-0 rounded-lg bg-white p-6 shadow-sm lg:w-80">
          <h2 className="text-lg font-bold text-brand-green">Order Summary</h2>
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>{formatPrice(getTotalPrice())}</span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Shipping &amp; taxes calculated at checkout.
          </p>
          <div className="mt-4 flex justify-between border-t border-gray-200 pt-4 text-base font-bold text-gray-900">
            <span>Total</span>
            <span className="font-heading text-brand-green">{formatPrice(getTotalPrice())}</span>
          </div>
          <Link
            href="/checkout"
            className="font-heading mt-6 block w-full rounded-lg bg-brand-green px-4 py-2 text-center text-sm font-semibold text-white hover:bg-green-700"
          >
            Proceed to Checkout
          </Link>
          <Link
            href="/products"
            className="mt-3 block w-full rounded-lg border-2 border-brand-green px-4 py-2 text-center text-sm font-semibold text-brand-green hover:bg-brand-green hover:text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
