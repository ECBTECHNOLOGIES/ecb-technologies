import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BLUR_DATA_URL, decodeEntities, formatPrice, stripHtml } from "@/lib/utils";
import AddToCartButton from "./AddToCartButton";
import SelectOptionsButton from "./SelectOptionsButton";

export default function ProductCard({ product }) {
  const image = product.images?.[0];
  const name = decodeEntities(product.name);
  const canAddToCart =
    product.type === "simple" && product.stock_status === "instock";

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square bg-gray-50">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt || name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-contain p-4 transition-transform group-hover:scale-105"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}

        {product.stock_status !== "instock" ? (
          <span className="absolute left-2 top-2 rounded bg-[#9CA3AF] px-2 py-1 text-xs font-bold text-white">
            Sold Out
          </span>
        ) : (
          product.on_sale && (
            <span className="absolute left-2 top-2 rounded bg-brand-red px-2 py-1 text-xs font-bold text-white">
              Sale
            </span>
          )
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-medium text-gray-800 hover:text-brand-blue">
            {name}
          </h3>
        </Link>

        {product.short_description && (
          <p className="line-clamp-2 text-xs text-gray-500">
            {stripHtml(product.short_description)}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 pt-2">
          {product.on_sale && product.regular_price ? (
            <>
              <span className="text-base font-bold text-brand-red">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.regular_price)}
              </span>
            </>
          ) : (
            <span className="text-base font-bold text-brand-blue">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {canAddToCart ? (
          <AddToCartButton product={product} className="mt-2 w-full" />
        ) : (
          <SelectOptionsButton product={product} className="mt-2 w-full" />
        )}

        <Link
          href={`/products/${product.slug}`}
          className="flex items-center justify-center gap-1 text-xs font-medium text-brand-blue hover:underline"
        >
          Show details
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
