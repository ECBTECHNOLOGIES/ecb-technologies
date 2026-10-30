import Link from "next/link";
import { getProducts } from "@/lib/woocommerce";
import ProductCard from "./ProductCard";

const STUDENT_DEALS_CATEGORY_ID = 390;

export default async function StudentDeals() {
  let products = [];
  try {
    products = await getProducts({ category: STUDENT_DEALS_CATEGORY_ID, per_page: 4 });
  } catch {
    products = [];
  }

  if (!products.length) return null;

  return (
    <section className="on-dark bg-tile py-14 text-white sm:py-20">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-8">
        <div className="text-center">
          <p className="type-caption font-semibold text-white/60">Student Deals</p>
          <h2 className="type-display mt-2">Built for campus. Priced for it too.</h2>
          <Link
            href={`/products?category=${STUDENT_DEALS_CATEGORY_ID}`}
            className="mt-4 inline-block text-[17px] text-primary-on-dark hover:underline"
          >
            Shop student deals ›
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
