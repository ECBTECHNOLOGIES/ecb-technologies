import Image from "next/image";
import Link from "next/link";
import { Boxes } from "lucide-react";
import { getCategories, getProducts } from "@/lib/woocommerce";
import { BLUR_DATA_URL, decodeEntities } from "@/lib/utils";

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
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
        {categories.map((category, i) => {
          const name = decodeEntities(category.name);
          const imageSrc = category.image?.src || fallbackImages[i];
          return (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="group flex flex-col items-center gap-2 rounded-lg bg-white p-4 text-center shadow-sm transition-shadow hover:shadow-md"
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
              <span className="text-sm font-medium text-gray-700 group-hover:text-brand-blue">
                {name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
