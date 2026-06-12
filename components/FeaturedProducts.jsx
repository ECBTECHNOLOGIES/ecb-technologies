import Link from "next/link";
import { getFeaturedProducts, getProducts } from "@/lib/woocommerce";
import ProductCard from "./ProductCard";

export default async function FeaturedProducts() {
  let products = [];
  try {
    products = await getFeaturedProducts(8);
    if (products.length < 4) {
      products = await getProducts({
        per_page: 8,
        status: "publish",
        orderby: "date",
        order: "desc",
      });
    }
  } catch {
    products = [];
  }

  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
        <Link
          href="/products"
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
    </section>
  );
}
