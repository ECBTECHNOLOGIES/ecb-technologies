"use client";

import Link from "next/link";
import Script from "next/script";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import TownSelect, { getShippingOption, PICKUP_KEY } from "@/components/TownSelect";
import { ADDRESS_LINE, BUSINESS } from "@/lib/business";

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
          ? ADDRESS_LINE
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
      <div className="px-6 py-24 text-center sm:py-32">
        <h1 className="type-hero text-ink">Thank you. Your order is in.</h1>
        <p className="type-lead mx-auto mt-4 max-w-xl text-ink-80">
          Payment received. We&apos;ll start processing your order right away.
        </p>

        <div className="mt-8 inline-flex items-center gap-4 rounded-full bg-parchment py-2 pl-6 pr-2">
          <span className="text-[17px] text-ink-80">
            Order <span className="font-semibold text-ink">#{completedOrderId}</span>
          </span>
          <button
            type="button"
            onClick={handleCopyOrderId}
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[14px] text-primary"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy
              </>
            )}
          </button>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={trackOrderHref} className="btn-primary">
            Track my order
          </Link>
          <Link href="/products" className="btn-secondary">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-6 py-24 text-center sm:py-32">
        <h1 className="type-hero text-ink">Your cart is empty.</h1>
        <p className="type-lead mt-4 text-ink-80">Add something before checking out.</p>
        <Link href="/products" className="btn-primary mt-8">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] px-6 pb-24 pt-8 sm:pt-12">
      <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" />

      <Link
        href="/cart"
        className="link inline-flex items-center gap-1 text-[15px]"
      >
        <ArrowLeft className="h-4 w-4" />
        Cart
      </Link>

      <h1 className="type-hero mt-4 text-ink">Checkout</h1>

      <div className="mt-10 flex flex-col gap-12 lg:flex-row lg:gap-16">
        <form onSubmit={handleSubmit} className="flex-1 space-y-10">
          <section className="space-y-4">
          <h2 className="type-tagline text-ink">Your details</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First Name" name="first_name" value={form.first_name} onChange={handleChange} required />
            <Field label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} required />
            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
            <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} required />
          </div>

          </section>

          <fieldset className="space-y-3">
            <legend className="type-tagline mb-4 text-ink">How would you like to get it?</legend>

            <label
              className={`flex cursor-pointer items-start gap-3 rounded-[18px] bg-white p-5 transition-shadow ${
                deliveryMethod === "delivery"
                  ? "shadow-[inset_0_0_0_2px_#0071e3]"
                  : "shadow-[inset_0_0_0_1px_#d2d2d7]"
              }`}
            >
              <input
                type="radio"
                name="delivery_method"
                value="delivery"
                checked={deliveryMethod === "delivery"}
                onChange={() => setDeliveryMethod("delivery")}
                className="mt-1 h-4 w-4 accent-primary"
              />
              <span>
                <span className="block text-[17px] font-semibold text-ink">Delivery</span>
                <span className="type-caption text-ink-48">To the Fargo Courier branch in your town</span>
              </span>
            </label>

            <label
              className={`flex cursor-pointer items-start gap-3 rounded-[18px] bg-white p-5 transition-shadow ${
                deliveryMethod === "pickup"
                  ? "shadow-[inset_0_0_0_2px_#0071e3]"
                  : "shadow-[inset_0_0_0_1px_#d2d2d7]"
              }`}
            >
              <input
                type="radio"
                name="delivery_method"
                value="pickup"
                checked={deliveryMethod === "pickup"}
                onChange={() => setDeliveryMethod("pickup")}
                className="mt-1 h-4 w-4 accent-primary"
              />
              <span>
                <span className="block text-[17px] font-semibold text-ink">Pick up in store · Free</span>
                <span className="type-caption text-ink-48">
                  {ADDRESS_LINE}. {BUSINESS.hoursDisplay}.
                </span>
              </span>
            </label>
          </fieldset>

          {deliveryMethod === "delivery" ? (
            <div className="space-y-3">
              <TownSelect value={shippingKey} onChange={setShippingKey} />
              <p className="type-caption text-ink-48">
                Your order is delivered to the Fargo Courier branch in your selected town —
                you&apos;ll collect it from there.
              </p>

              {shippingOption?.surcharge && (
                <p className="type-caption rounded-xl bg-parchment px-4 py-3 text-ink-80">
                  Orders over 5kg to this location may incur an additional KSh 150/kg —
                  we&apos;ll confirm final shipping cost before dispatch.
                </p>
              )}
            </div>
          ) : null}

          <div className="space-y-4">
            {error && (
              <p className="type-caption rounded-xl bg-[#fff2f4] px-4 py-3 text-danger">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !shippingOption}
              className="btn-primary h-12 w-full"
            >
              {submitting ? "Processing…" : `Pay ${formatPrice(orderTotal)}`}
            </button>
            <p className="type-caption text-center text-ink-48">
              Pay securely with M-Pesa or debit/credit card without leaving this page.
            </p>
          </div>
        </form>

        <aside className="w-full shrink-0 self-start rounded-[18px] bg-parchment p-6 lg:sticky lg:top-24 lg:w-[360px]">
          <h2 className="type-tagline text-ink">Summary</h2>
          <ul className="mt-5 space-y-3">
            {items.map((item) => (
              <li
                key={`${item.id}-${item.variationId ?? "default"}`}
                className="flex justify-between gap-4 text-[15px] text-ink-80"
              >
                <span>
                  {item.name}
                  {item.quantity > 1 && <span className="text-ink-48"> × {item.quantity}</span>}
                </span>
                <span className="shrink-0 text-ink">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 space-y-2 border-t border-hairline pt-5 text-[15px] text-ink-80">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-ink">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Shipping {shippingOption && !shippingOption.isPickup ? `(${shippingOption.label})` : ""}</span>
              <span className="shrink-0 text-ink">
                {!shippingOption
                  ? "—"
                  : shippingOption.isPickup
                    ? "Free"
                    : formatPrice(shippingCost)}
              </span>
            </div>
          </div>

          <div className="mt-5 flex justify-between border-t border-hairline pt-5 text-[21px] font-semibold text-ink">
            <span>Total</span>
            <span>{formatPrice(orderTotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

const AUTOCOMPLETE = {
  first_name: "given-name",
  last_name: "family-name",
  email: "email",
  phone: "tel",
};

function Field({ label, name, type = "text", value, onChange, required }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={AUTOCOMPLETE[name]}
        className="field"
      />
    </label>
  );
}
