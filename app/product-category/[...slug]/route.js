import { NextResponse } from "next/server";
import { getCategoryBySlug } from "@/lib/woocommerce";

// Old WooCommerce category archives (/product-category/<parent>/<child>/)
// that aren't explicitly mapped in next.config.ts. Redirect to the matching
// category listing so indexed URLs keep their relevance, falling back to the
// full catalogue only when the category no longer exists.
export async function GET(request, { params }) {
  const { slug } = await params;
  const lastSlug = slug.filter((segment) => segment !== "page" && !/^\d+$/.test(segment)).pop();
  const category = lastSlug ? await getCategoryBySlug(lastSlug).catch(() => null) : null;

  const destination = new URL(category ? `/products?category=${category.id}` : "/products", request.url);
  return NextResponse.redirect(destination, 308);
}
