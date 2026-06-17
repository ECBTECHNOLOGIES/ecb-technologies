"use client";

import Link from "next/link";
import Script from "next/script";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";

const initialForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  address_1: "",
  city: "",
  state: "",
  country: "KE",
};

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);

  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [completedOrderId, setCompletedOrderId] = useState(null);

  useEffect(() => setMounted(true), []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billing: form, items }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      openPaystackPopup(data);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  function openPaystackPopup({ orderId, total, email }) {
    if (typeof window === "undefined" || !window.PaystackPop) {
      setError("Payment system is still loading. Please try again in a moment.");
      setSubmitting(false);
      return;
    }

    const reference = `ECB-${orderId}-${Date.now()}`;

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email,
      amount: Math.round(Number(total) * 100),
      currency: "KES",
      ref: reference,
      metadata: {
        order_id: orderId,
        custom_fields: [
          {
            display_name: "Order ID",
            variable_name: "order_id",
            value: String(orderId),
          },
        ],
      },
      callback: (response) => {
        verifyPayment(orderId, response.reference);
      },
      onClose: () => {
        setSubmitting(false);
        setError("Payment was cancelled. Your order is saved as pending.");
      },
    });

    handler.openIframe();
  }

  async function verifyPayment(orderId, reference) {
    try {
      const res = await fetch("/api/checkout/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, reference }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not verify payment. Please contact support.");
      }

      clearCart();
      setCompletedOrderId(orderId);
      localStorage.setItem(
        "ecb-last-order",
        JSON.stringify({ orderId, email: form.email })
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted) return null;

  if (completedOrderId) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Thank you for your order!</h1>
        <p className="mt-2 text-gray-500">
          Order #{completedOrderId} has been placed and payment received. We&apos;ll start
          processing it right away.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/products"
            className="inline-block rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Continue Shopping
          </Link>
          <Link
            href="/track-order"
            className="inline-block rounded-lg border-2 border-brand-blue px-4 py-2 text-sm font-semibold text-brand-blue hover:bg-brand-blue hover:text-white"
          >
            Track Your Order
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="mt-2 text-gray-500">Add some products before checking out.</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" />

      <Link
        href="/cart"
        className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Cart
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-gray-900">Checkout</h1>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        <form onSubmit={handleSubmit} className="flex-1 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Billing Details</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First Name" name="first_name" value={form.first_name} onChange={handleChange} required />
            <Field label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} required />
            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
            <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} required />
          </div>

          <Field label="Address" name="address_1" value={form.address_1} onChange={handleChange} required />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="City" name="city" value={form.city} onChange={handleChange} required />
            <Field label="County" name="state" value={form.state} onChange={handleChange} />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-brand-red">{error}</p>
          )}

          <p className="text-sm text-gray-500">
            Pay securely with M-Pesa or your debit/credit card, without leaving this page.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {submitting ? "Processing..." : "Place Order & Pay"}
          </button>
        </form>

        <div className="w-full shrink-0 rounded-lg bg-white p-6 shadow-sm lg:w-80">
          <h2 className="text-lg font-bold text-brand-green">Order Summary</h2>
          <ul className="mt-4 space-y-2">
            {items.map((item) => (
              <li
                key={`${item.id}-${item.variationId ?? "default"}`}
                className="flex justify-between text-sm text-gray-600"
              >
                <span className="pr-2">
                  {item.name} &times; {item.quantity}
                </span>
                <span className="font-heading shrink-0 font-medium text-brand-green">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-gray-200 pt-4 text-base font-bold text-gray-900">
            <span>Total</span>
            <span className="font-heading text-brand-green">{formatPrice(getTotalPrice())}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", value, onChange, required }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-gray-700">
        {label} {required && <span className="text-brand-red">*</span>}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
      />
    </label>
  );
}
