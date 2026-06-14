import Link from "next/link";
import { getProducts } from "@/lib/woocommerce";
import ProductCard from "./ProductCard";

const STUDENT_DEALS_CATEGORY_ID = 390;

export default async function StudentDeals() {
  let products = [];
  try {
    products = await getProducts({ category: STUDENT_DEALS_CATEGORY_ID, per_page: 8 });
  } catch {
    products = [];
  }

  if (!products.length) return null;

  return (
    <section className="border-y border-gray-100 bg-brand-blue/5 py-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-block rounded bg-brand-blue px-2 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Student Deals
            </span>
            <h2 className="mt-2 text-2xl font-bold text-black">
              Save Big on Top Picks
            </h2>
          </div>
          <Link
            href={`/products?category=${STUDENT_DEALS_CATEGORY_ID}`}
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
