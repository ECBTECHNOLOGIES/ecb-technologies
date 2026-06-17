import { NextResponse } from "next/server";
import { getOrder } from "@/lib/woocommerce";

export async function POST(request) {
  const { orderId, email } = await request.json();

  if (!orderId || !email) {
    return NextResponse.json(
      { error: "Order ID and email are required" },
      { status: 400 }
    );
  }

  try {
    const order = await getOrder(orderId);

    if (order.billing?.email?.toLowerCase() !== String(email).toLowerCase()) {
      return NextResponse.json(
        { error: "We couldn't find an order matching that ID and email." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: order.id,
      status: order.status,
      date_created: order.date_created,
      total: order.total,
      line_items: order.line_items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        total: item.total,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "We couldn't find an order matching that ID and email." },
      { status: 404 }
    );
  }
}
