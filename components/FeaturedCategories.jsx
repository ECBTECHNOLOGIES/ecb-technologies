import Image from "next/image";
import Link from "next/link";
import { Boxes } from "lucide-react";
import { getCategories, getProducts } from "@/lib/woocommerce";
import { BLUR_DATA_URL, decodeEntities } from "@/lib/utils";
import CategoryTabs from "./CategoryTabs";

export default async function FeaturedCategories() {
  let categories = [];
  try {
    categories = await getCategories({ parent: 0, orderby: "count", order: "desc" });
    categories = categories
      .filter(
        (category) =>
          category.slug !== "uncategorized" &&
          category.id !== 274 &&
          category.count > 0,
      )
      .slice(0, 8);
  } catch {
    categories = [];
  }

  if (!categories.length) return null;

  // Use each category's own image if set, otherwise fall back to the image
  // of a real product from that category.
  const fallbackImages = await Promise.all(
    categories.map(async (category) => {
      if (category.image?.src) return null;
      try {
        const products = await getProducts({
          category: category.id,
          per_page: 1,
          orderby: "popularity",
        });
        return products[0]?.images?.[0]?.src ?? null;
      } catch {
        return null;
      }
    })
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold text-brand-blue">Shop by Category</h2>
      <CategoryTabs categories={categories} className="mt-3 sm:hidden" />

      <div className="mt-3 hidden sm:grid sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-8">
        {categories.map((category, i) => {
          const name = decodeEntities(category.name);
          const imageSrc = category.image?.src || fallbackImages[i];
          return (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="group flex flex-col items-center gap-2 rounded-lg bg-white px-4 py-4 text-center text-sm font-medium text-gray-700 no-underline shadow-sm transition-shadow hover:bg-white hover:text-brand-blue hover:shadow-md active:bg-white active:text-brand-blue"
            >
              <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                {imageSrc ? (
                  <Image
                    src={imageSrc}
                    alt={name}
                    fill
                    sizes="48px"
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    loading="lazy"
                  />
                ) : (
                  <Boxes className="h-6 w-6 text-brand-blue" />
                )}
              </div>
              <span>{name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
