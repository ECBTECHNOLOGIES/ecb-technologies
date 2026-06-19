"use client";

import Link from "next/link";
import Script from "next/script";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import TownSelect, { getShippingOption, PICKUP_KEY } from "@/components/TownSelect";

const initialForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  country: "KE",
};

const PICKUP_OPTION = getShippingOption(PICKUP_KEY);

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);

  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [shippingKey, setShippingKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [completedOrderId, setCompletedOrderId] = useState(null);
  const [completedEmail, setCompletedEmail] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => setMounted(true), []);

  const shippingOption =
    deliveryMethod === "pickup" ? PICKUP_OPTION : getShippingOption(shippingKey);
  const subtotal = getTotalPrice();
  const shippingCost = shippingOption?.cost ?? 0;
  const orderTotal = subtotal + shippingCost;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!shippingOption) {
      setError("Please select a delivery location.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const billing = {
        ...form,
        address_1: shippingOption.isPickup
          ? "Iconic Business Plaza, Moi Avenue, Nairobi"
          : `Fargo Courier Branch, ${shippingOption.label}`,
        city: shippingOption.isPickup ? "Nairobi" : shippingOption.label,
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing,
          items,
          shipping: {
            method_id: shippingOption.isPickup ? "local_pickup" : "flat_rate",
            method_title: shippingOption.isPickup ? "Store Pickup" : shippingOption.label,
            total: String(shippingOption.cost),
          },
        }),
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
      setCompletedEmail(form.email);
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
    const trackOrderHref = `/track-order?orderId=${encodeURIComponent(completedOrderId)}&email=${encodeURIComponent(completedEmail)}`;

    function handleCopyOrderId() {
      navigator.clipboard.writeText(String(completedOrderId));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }

    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Thank you for your order!</h1>
        <p className="mt-2 text-gray-500">
          Your order has been placed and payment received. We&apos;ll start processing it
          right away.
        </p>

        <div className="mx-auto mt-6 inline-flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-5 py-3 shadow-sm">
          <span className="text-sm text-gray-500">Order ID</span>
          <span className="font-heading text-xl font-bold text-brand-green">
            #{completedOrderId}
          </span>
          <button
            type="button"
            onClick={handleCopyOrderId}
            className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-brand-green" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy
              </>
            )}
          </button>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/products"
            className="inline-block rounded-lg bg-brand-green px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Continue Shopping
          </Link>
          <Link
            href={trackOrderHref}
            className="inline-block rounded-lg border-2 border-brand-blue px-4 py-2 text-sm font-semibold text-brand-blue hover:bg-brand-blue hover:text-white"
          >
            Track My Order
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

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-gray-700">Delivery Method</legend>

            <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm">
              <input
                type="radio"
                name="delivery_method"
                value="delivery"
                checked={deliveryMethod === "delivery"}
                onChange={() => setDeliveryMethod("delivery")}
                className="h-4 w-4 accent-brand-green"
              />
              Deliver to my location
            </label>

            <label className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm">
              <input
                type="radio"
                name="delivery_method"
                value="pickup"
                checked={deliveryMethod === "pickup"}
                onChange={() => setDeliveryMethod("pickup")}
                className="h-4 w-4 accent-brand-green"
              />
              Free pickup at ECB store (Iconic Business Plaza, Moi Avenue, Nairobi)
            </label>
          </fieldset>

          {deliveryMethod === "delivery" ? (
            <>
              <TownSelect value={shippingKey} onChange={setShippingKey} />
              <p className="text-xs text-gray-500">
                Your order is delivered to the Fargo Courier branch in your selected town —
                you&apos;ll collect it from there.
              </p>

              {shippingOption?.surcharge && (
                <p className="rounded-md bg-amber-50 px-4 py-2 text-sm text-amber-800">
                  Orders over 5kg to this location may incur an additional KSh 150/kg —
                  we&apos;ll confirm final shipping cost before dispatch.
                </p>
              )}
            </>
          ) : (
            <p className="rounded-md bg-blue-50 px-4 py-2 text-sm text-brand-blue">
              Pick up at Iconic Business Plaza, Moi Avenue, Nairobi — Open Mon–Sat, 8am–6:30pm.
            </p>
          )}

          {error && (
            <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-brand-red">{error}</p>
          )}

          <p className="text-sm text-gray-500">
            Pay securely with M-Pesa or your debit/credit card, without leaving this page.
          </p>

          <button
            type="submit"
            disabled={submitting || !shippingOption}
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

          <div className="mt-4 space-y-2 border-t border-gray-200 pt-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping {shippingOption && !shippingOption.isPickup ? `(${shippingOption.label})` : ""}</span>
              <span className="font-medium text-gray-900">
                {!shippingOption
                  ? "—"
                  : shippingOption.isPickup
                    ? "Free"
                    : formatPrice(shippingCost)}
              </span>
            </div>
          </div>

          <div className="mt-2 flex justify-between border-t border-gray-200 pt-4 text-base font-bold text-gray-900">
            <span>Total</span>
            <span className="font-heading text-brand-green">{formatPrice(orderTotal)}</span>
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
