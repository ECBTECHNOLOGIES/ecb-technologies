import Link from "next/link";
import { getOnSaleProducts } from "@/lib/woocommerce";
import ProductCard from "./ProductCard";

export default async function StudentDeals() {
  let products = [];
  try {
    products = await getOnSaleProducts(8);
  } catch {
    products = [];
  }

  if (!products.length) return null;

  return (
    <section className="border-y border-gray-100 bg-brand-blue/5 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-block rounded bg-brand-red px-2 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Student Deals
            </span>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              Save Big on Top Picks
            </h2>
          </div>
          <Link
            href="/products?on_sale=true"
            className="text-sm font-semibold text-brand-blue hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
