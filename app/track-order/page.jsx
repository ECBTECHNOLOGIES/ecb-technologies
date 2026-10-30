"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";

export const STATUS_LABELS = {
  pending: { label: "Pending payment", className: "text-deal" },
  processing: { label: "Processing", className: "text-primary" },
  dispatched: { label: "Dispatched", className: "text-primary" },
  "on-hold": { label: "On hold", className: "text-deal" },
  completed: { label: "Delivered", className: "text-success" },
  cancelled: { label: "Cancelled", className: "text-ink-48" },
  refunded: { label: "Refunded", className: "text-ink-48" },
  failed: { label: "Failed", className: "text-danger" },
};

// Statuses that progress through the delivery pipeline, in order. Orders
// outside this list (cancelled/refunded/failed/on-hold) are terminal or
// exceptional, so they show just the status badge with no stepper.
const PROGRESS_STEPS = [
  { key: "pending", label: "Order Received" },
  { key: "processing", label: "Processing" },
  { key: "dispatched", label: "Dispatched" },
  { key: "completed", label: "Delivered" },
];

function OrderProgress({ status }) {
  const currentIndex = PROGRESS_STEPS.findIndex((step) => step.key === status);
  if (currentIndex === -1) return null;

  return (
    <ol className="mt-8 grid grid-cols-4 gap-2">
      {PROGRESS_STEPS.map((step, i) => (
        <li key={step.key}>
          <div className={`h-1 rounded-full ${i <= currentIndex ? "bg-primary" : "bg-hairline"}`} />
          <p
            className={`type-fine mt-2 ${i <= currentIndex ? "font-semibold text-ink" : "text-ink-48"}`}
          >
            {step.label}
          </p>
        </li>
      ))}
    </ol>
  );
}

function TrackOrderForm() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  const trackOrder = useCallback(async (id, addr) => {
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id, email: addr }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // The checkout confirmation page links here with ?orderId=&email= so the
  // customer never has to retype either value. Fall back to the last order
  // saved in localStorage (e.g. they navigate here later in the same browser).
  useEffect(() => {
    const queryOrderId = searchParams.get("orderId");
    const queryEmail = searchParams.get("email");

    if (queryOrderId && queryEmail) {
      setOrderId(queryOrderId);
      setEmail(queryEmail);
      trackOrder(queryOrderId, queryEmail);
      return;
    }

    try {
      const saved = JSON.parse(localStorage.getItem("ecb-last-order"));
      if (saved?.orderId) setOrderId(String(saved.orderId));
      if (saved?.email) setEmail(saved.email);
    } catch {
      // ignore malformed/missing data
    }
  }, [searchParams, trackOrder]);

  function handleSubmit(e) {
    e.preventDefault();
    trackOrder(orderId, email);
  }

  const status = order && (STATUS_LABELS[order.status] ?? {
    label: order.status,
    className: "text-ink-48",
  });

  return (
    <div className="mx-auto max-w-[680px] px-6 pb-24 pt-14 sm:pt-20">
      <h1 className="type-hero text-ink">Track your order.</h1>
      <p className="type-lead mt-3 text-ink-80">
        Enter your order number and the email you used at checkout.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="field-label">Order number</span>
          <input
            type="text"
            inputMode="numeric"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
            className="field"
          />
        </label>
        <label className="block">
          <span className="field-label">Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="field"
          />
        </label>

        {error && (
          <p className="type-caption rounded-xl bg-[#fff2f4] px-4 py-3 text-danger sm:col-span-2">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary mt-2 sm:col-span-2 sm:justify-self-start">
          {loading ? "Searching…" : "Track order"}
        </button>
      </form>

      {order && (
        <div className="mt-12 rounded-[18px] bg-parchment p-6 sm:p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="type-tagline text-ink">Order #{order.id}</h2>
            <span className={`text-[15px] font-semibold ${status.className}`}>{status.label}</span>
          </div>
          <p className="type-caption mt-1 text-ink-48">
            Placed {new Date(order.date_created).toLocaleDateString("en-KE", { dateStyle: "medium" })}
          </p>

          <OrderProgress status={order.status} />

          <ul className="mt-8 space-y-3 border-t border-hairline pt-6">
            {order.line_items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 text-[15px] text-ink-80">
                <span>
                  {item.name}
                  {item.quantity > 1 && <span className="text-ink-48"> × {item.quantity}</span>}
                </span>
                <span className="shrink-0 text-ink">{formatPrice(item.total)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-between border-t border-hairline pt-6 text-[21px] font-semibold text-ink">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={null}>
      <TrackOrderForm />
    </Suspense>
  );
}
