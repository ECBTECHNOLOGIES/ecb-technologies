import { NextResponse } from "next/server";
import { createOrder } from "@/lib/woocommerce";

export async function POST(request) {
  const body = await request.json();
  const { billing, items } = body;

  if (!billing || !items?.length) {
    return NextResponse.json(
      { error: "Missing billing details or cart items" },
      { status: 400 }
    );
  }

  const line_items = items.map((item) => {
    const lineItem = {
      product_id: item.id,
      quantity: item.quantity,
    };
    if (item.variationId) lineItem.variation_id = item.variationId;
    return lineItem;
  });

  try {
    const order = await createOrder({
      payment_method: "paystack",
      payment_method_title: "Paystack",
      set_paid: false,
      status: "pending",
      billing,
      shipping: billing,
      line_items,
    });

    return NextResponse.json({
      orderId: order.id,
      total: order.total,
      email: order.billing.email,
    });
  } catch (error) {
    const message =
      error.response?.data?.message ?? "Failed to create order. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
