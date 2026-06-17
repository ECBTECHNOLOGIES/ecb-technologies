"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

export const STATUS_LABELS = {
  pending: { label: "Pending Payment", className: "bg-yellow-100 text-yellow-800" },
  processing: { label: "Processing", className: "bg-blue-100 text-blue-800" },
  "on-hold": { label: "On Hold", className: "bg-yellow-100 text-yellow-800" },
  completed: { label: "Completed", className: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-700" },
  refunded: { label: "Refunded", className: "bg-gray-100 text-gray-700" },
  failed: { label: "Failed", className: "bg-red-100 text-brand-red" },
};

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("ecb-last-order"));
      if (saved?.orderId) setOrderId(String(saved.orderId));
      if (saved?.email) setEmail(saved.email);
    } catch {
      // ignore malformed/missing data
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch("/api/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, email }),
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
