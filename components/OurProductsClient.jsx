import Link from "next/link";
import ProductCard from "./ProductCard";

export default function OurProductsClient({ tabs, groups = [] }) {
  return (
    <section className="px-4 pb-10 pt-4 sm:px-6 sm:pt-6 lg:px-8">
      <h2 className="text-2xl font-bold text-brand-blue">Our Products</h2>

      <div className="sticky top-[118px] z-30 -mx-4 flex gap-2 overflow-x-auto bg-white px-4 py-2 sm:mx-0 sm:px-0 md:top-[70px]">
        {tabs.map((tab, i) => (
          <Link
            key={tab.label}
            href={tab.categoryId ? `/products?category=${tab.categoryId}` : "/products"}
            className={`font-heading shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-center text-sm font-semibold transition-colors ${
              i === 0
                ? "border-brand-blue bg-brand-blue text-white"
                : "border-gray-200 bg-white text-gray-700 hover:border-brand-blue hover:bg-brand-blue hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="mt-10 space-y-12">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-brand-blue">{group.label}</h3>
              <Link
                href={`/products?category=${group.categoryId}`}
                className="text-sm font-semibold text-brand-blue hover:underline"
              >
                See more →
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {group.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
