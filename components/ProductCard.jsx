import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { BLUR_DATA_URL, decodeEntities, formatPrice } from "@/lib/utils";
import AddToCartButton from "./AddToCartButton";
import SelectOptionsButton from "./SelectOptionsButton";

const NEW_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

function isNew(product) {
  if (!product.date_created) return false;
  return Date.now() - new Date(product.date_created).getTime() < NEW_WINDOW_MS;
}

function getBrandName(product) {
  if (product.brands?.[0]?.name) return product.brands[0].name;
  const brandAttribute = product.attributes?.find((attr) => /brand/i.test(attr.name));
  return brandAttribute?.options?.[0] ?? null;
}

export default function ProductCard({ product }) {
  const image = product.images?.[0];
  const name = decodeEntities(product.name);
  const brand = getBrandName(product);
  const isSoldOut = product.stock_status !== "instock";
  const canAddToCart = !isSoldOut && product.type === "simple";

  let badge = null;
  if (isSoldOut) badge = { label: "Sold Out", className: "bg-[#888888]" };
  else if (product.on_sale) badge = { label: "Sale", className: "bg-brand-red" };
  else if (isNew(product)) badge = { label: "New", className: "bg-brand-green" };

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border-[0.5px] border-gray-300 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/products/${product.slug}`} className="relative block h-[180px] bg-[#f5f5f5]">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt || name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            className="object-contain p-4"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}

        {badge && (
          <span
            className={`absolute left-2 top-2 rounded px-2 py-[3px] text-[10px] font-bold text-white ${badge.className}`}
          >
            {badge.label}
          </span>
        )}

        <Heart className="absolute right-2 top-2 h-4 w-4 text-gray-400" />
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3">
        {brand && (
          <span className="text-[10px] uppercase tracking-wide text-gray-400">{brand}</span>
        )}

        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 text-[13px] font-bold text-gray-800 hover:text-brand-blue">
            {name}
          </h3>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-brand-green">
            {formatPrice(product.price)}
          </span>
          {product.on_sale && product.regular_price && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.regular_price)}
            </span>
          )}
        </div>

        <div className="mt-auto flex flex-col items-stretch gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/products/${product.slug}`}
            className="text-xs font-medium text-brand-blue hover:underline"
          >
            Show details →
          </Link>

          {isSoldOut ? (
            <button
              type="button"
              disabled
              className="w-full shrink-0 whitespace-nowrap rounded-md bg-[#888888] px-3 py-[7px] text-[11px] font-bold text-white disabled:cursor-not-allowed sm:w-auto sm:min-w-[100px]"
            >
              Sold Out
            </button>
          ) : canAddToCart ? (
            <AddToCartButton product={product} className="w-full shrink-0 sm:w-auto" />
          ) : (
            <SelectOptionsButton product={product} className="w-full shrink-0 sm:w-auto" />
          )}
        </div>
      </div>
    </div>
  );
}
