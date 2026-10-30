import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BLUR_DATA_URL } from "@/lib/utils";
import ProductCard from "./ProductCard";

function categoryImage(tab) {
  return tab.image ?? tab.products.find((product) => product.images?.[0])?.images[0].src ?? null;
}

export default function OurProductsClient({ tabs, groups = [] }) {
  const shelf = tabs.filter((tab) => tab.categoryId);

  return (
    <>
      {shelf.length > 0 && (
        <section className="pb-14 sm:pb-20">
          <div className="no-scrollbar mx-auto flex max-w-[1440px] gap-6 overflow-x-auto px-6 sm:justify-center sm:gap-10 lg:px-8">
            {shelf.map((tab) => {
              const image = categoryImage(tab);
              return (
                <Link
                  key={tab.categoryId}
                  href={`/products?category=${tab.categoryId}`}
                  className="group flex w-[84px] shrink-0 flex-col items-center text-center sm:w-24"
                >
                  <span className="relative h-[72px] w-[72px] sm:h-20 sm:w-20">
                    {image && (
                      <Image
                        src={image}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                      />
                    )}
                  </span>
                  <span className="type-caption mt-3 font-semibold text-ink">{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {groups.map((group, i) => (
        <section
          key={group.label}
          className={`py-14 sm:py-20 ${i % 2 === 0 ? "on-parchment bg-parchment" : "bg-white"}`}
        >
          <div className="mx-auto max-w-[1440px] px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <h2 className="type-display text-ink">{group.label}</h2>
              <Link
                href={`/products?category=${group.categoryId}`}
                className="link type-caption inline-flex shrink-0 items-center sm:text-[17px]"
              >
                See all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
              {group.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
