import { NextResponse } from "next/server";
import { getOrder, updateOrder } from "@/lib/woocommerce";

export async function POST(request) {
  const { reference, orderId } = await request.json();

  if (!reference || !orderId) {
    return NextResponse.json({ error: "Missing reference or order id" }, { status: 400 });
  }

  try {
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || !verifyData.status || verifyData.data?.status !== "success") {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    const order = await getOrder(orderId);
    const expectedAmount = Math.round(Number(order.total) * 100);

    if (verifyData.data.amount !== expectedAmount) {
      return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
    }

    const updated = await updateOrder(orderId, {
      status: "processing",
      set_paid: true,
      transaction_id: reference,
    });

    return NextResponse.json({ success: true, orderId: updated.id });
  } catch {
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
