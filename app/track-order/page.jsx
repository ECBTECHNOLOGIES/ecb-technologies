"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";

export const STATUS_LABELS = {
  pending: { label: "Pending Payment", className: "bg-yellow-100 text-yellow-800" },
  processing: { label: "Processing", className: "bg-blue-100 text-blue-800" },
  dispatched: { label: "Dispatched", className: "bg-indigo-100 text-indigo-800" },
  "on-hold": { label: "On Hold", className: "bg-yellow-100 text-yellow-800" },
  completed: { label: "Delivered", className: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-700" },
  refunded: { label: "Refunded", className: "bg-gray-100 text-gray-700" },
  failed: { label: "Failed", className: "bg-red-100 text-brand-red" },
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
    <div className="mt-4 flex items-center">
      {PROGRESS_STEPS.map((step, i) => (
        <div key={step.key} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                i <= currentIndex ? "bg-brand-green text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`mt-1 w-20 text-center text-[11px] ${
                i <= currentIndex ? "font-medium text-gray-900" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < PROGRESS_STEPS.length - 1 && (
            <div
              className={`mx-1 h-0.5 flex-1 ${i < currentIndex ? "bg-brand-green" : "bg-gray-200"}`}
            />
          )}
        </div>
      ))}
    </div>
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
    className: "bg-gray-100 text-gray-700",
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Track Your Order</h1>
      <p className="mt-2 text-gray-600">
        Enter your order ID and the email address you used at checkout to see
        its status.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-1">
          <span className="font-medium text-gray-700">Order ID</span>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </label>
        <label className="block text-sm sm:col-span-1">
          <span className="font-medium text-gray-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </label>

        {error && (
          <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-brand-red sm:col-span-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="font-heading w-full rounded-lg bg-brand-blue px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#2651AB] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 sm:w-auto"
        >
          {loading ? "Searching..." : "Track Order"}
        </button>
      </form>

      {order && (
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-gray-900">Order #{order.id}</h2>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}
            >
              {status.label}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Placed on {new Date(order.date_created).toLocaleDateString()}
          </p>

          <OrderProgress status={order.status} />

          <ul className="mt-4 space-y-2 border-t border-gray-100 pt-4">
            {order.line_items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm text-gray-600">
                <span className="pr-2">
                  {item.name} &times; {item.quantity}
                </span>
                <span className="font-heading shrink-0 font-medium text-brand-green">
                  {formatPrice(item.total)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex justify-between border-t border-gray-200 pt-4 text-base font-bold text-gray-900">
            <span>Total</span>
            <span className="font-heading text-brand-green">
              {formatPrice(order.total)}
            </span>
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
