import { NextResponse } from "next/server";
import { getProductVariations } from "@/lib/woocommerce";

export async function GET(request, { params }) {
  const { id } = await params;

  try {
    const variations = await getProductVariations(id);
    return NextResponse.json(variations);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
