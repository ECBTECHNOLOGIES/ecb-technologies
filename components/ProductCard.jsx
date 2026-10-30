import Image from "next/image";
import Link from "next/link";
import { BLUR_DATA_URL, decodeEntities, formatPrice } from "@/lib/utils";
import AddToCartButton from "./AddToCartButton";
import SelectOptionsButton from "./SelectOptionsButton";

const NEW_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

function isNew(product) {
  if (!product.date_created) return false;
  return Date.now() - new Date(product.date_created).getTime() < NEW_WINDOW_MS;
}

// Store-grid card: image tile, a one-word status, name, price and a single
// action. The image tile flips to white on parchment sections and the text to
// white on dark tiles (see the .on-parchment / .on-dark section classes).
export default function ProductCard({ product }) {
  const image = product.images?.[0];
  const name = decodeEntities(product.name);
  const isSoldOut = product.stock_status !== "instock";
  const canAddToCart = !isSoldOut && product.type === "simple";

  let label = null;
  if (isSoldOut) label = { text: "Sold out", className: "text-ink-48 [.on-dark_&]:text-white/60" };
  else if (product.on_sale) label = { text: "Sale", className: "text-deal [.on-dark_&]:text-[#ff9f40]" };
  else if (isNew(product)) label = { text: "New", className: "text-deal [.on-dark_&]:text-[#ff9f40]" };

  return (
    <div className="group flex flex-col">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden rounded-[18px] bg-parchment [.on-dark_&]:bg-white [.on-parchment_&]:bg-white"
      >
        {image ? (
          <Image
            src={image.src}
            alt={image.alt || name}
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            className={`object-contain p-6 transition-transform duration-500 group-hover:scale-[1.03] sm:p-8 ${
              isSoldOut ? "opacity-60" : ""
            }`}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            loading="lazy"
          />
        ) : (
          <span className="type-caption flex h-full w-full items-center justify-center text-ink-48">
            No image
          </span>
        )}
      </Link>

      <div className="mt-4 flex flex-1 flex-col px-1">
        {label && <span className={`type-fine font-semibold ${label.className}`}>{label.text}</span>}

        <Link href={`/products/${product.slug}`} className="mt-0.5">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink sm:text-[17px] [.on-dark_&]:text-white">
            {name}
          </h3>
        </Link>

        <div className="mt-1 flex flex-wrap items-baseline gap-x-2 text-[15px] sm:text-[17px]">
          <span className="text-ink-80 [.on-dark_&]:text-white/80">{formatPrice(product.price)}</span>
          {product.on_sale && product.regular_price && (
            <span className="type-caption text-ink-48 line-through [.on-dark_&]:text-white/50">
              {formatPrice(product.regular_price)}
            </span>
          )}
        </div>

        {!isSoldOut && (
          <div className="mt-auto pt-3">
            {canAddToCart ? (
              <AddToCartButton product={product} className="w-full sm:w-auto" />
            ) : (
              <SelectOptionsButton product={product} className="w-full sm:w-auto" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
